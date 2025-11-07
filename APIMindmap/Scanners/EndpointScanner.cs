using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using APIMindmap.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Routing;

namespace APIMindmap.Scanners
{
    public class EndpointScanner
    {
        private readonly IEnumerable<EndpointDataSource> _dataSources;
        private static readonly HashSet<Type> CollectionTypes = new()
        {
            typeof(IEnumerable<>),
            typeof(List<>),
            typeof(IList<>),
            typeof(ICollection<>)
        };

        public EndpointScanner(IEnumerable<EndpointDataSource> dataSources)
        {
            _dataSources = dataSources;
        }

        public MindmapDto Scan()
        {
            var mindmap = new MindmapDto();
            var processedTypes = new HashSet<Type>();

            foreach (var dataSource in _dataSources)
            {
                foreach (var endpoint in dataSource.Endpoints)
                {
                    var controllerActionDescriptor = endpoint.Metadata
                        .GetMetadata<ControllerActionDescriptor>();

                    if (controllerActionDescriptor == null)
                        continue;

                    var controllerName = controllerActionDescriptor.ControllerName;
                    var actionName = controllerActionDescriptor.ActionName;
                    var httpMethod = endpoint.Metadata
                        .GetMetadata<HttpMethodMetadata>()?.HttpMethods.FirstOrDefault() ?? "UNKNOWN";

                    // Add controller node
                    var controllerNodeId = $"{controllerName}Controller";
                    if (!mindmap.Nodes.Any(n => n.Id == controllerNodeId))
                    {
                        mindmap.Nodes.Add(new MindmapNode
                        {
                            Id = controllerNodeId,
                            Type = "controller",
                            Description = $"{controllerName} Controller",
                            Metadata = new Dictionary<string, object>
                            {
                                { "controllerName", controllerName }
                            }
                        });
                    }

                    // Add action node
                    var actionNodeId = $"{controllerName}.{actionName}";
                    var routePattern = (endpoint as RouteEndpoint)?.RoutePattern?.RawText ?? "";
                    
                    mindmap.Nodes.Add(new MindmapNode
                    {
                        Id = actionNodeId,
                        Type = "method",
                        Description = $"{httpMethod} {actionName}",
                        Metadata = new Dictionary<string, object>
                        {
                            { "httpMethod", httpMethod },
                            { "route", routePattern },
                            { "actionName", actionName }
                        }
                    });

                    // Link controller to action
                    mindmap.Links.Add(new MindmapLink
                    {
                        Source = controllerNodeId,
                        Target = actionNodeId,
                        Type = "contains"
                    });

                    // Process return type
                    var returnType = controllerActionDescriptor.MethodInfo.ReturnType;
                    ProcessType(returnType, actionNodeId, "returns", mindmap, processedTypes);

                    // Process parameters
                    foreach (var parameter in controllerActionDescriptor.Parameters)
                    {
                        var paramType = parameter.ParameterType;
                        ProcessType(paramType, actionNodeId, "accepts", mindmap, processedTypes);
                    }
                }
            }

            return mindmap;
        }

        private void ProcessType(Type type, string sourceNodeId, string linkType, MindmapDto mindmap, HashSet<Type> processedTypes)
        {
            // Unwrap Task, ActionResult, etc.
            type = UnwrapType(type);

            // Skip primitive types and common system types
            if (type.IsPrimitive || type == typeof(string) || type == typeof(void) || 
                type.Namespace?.StartsWith("System") == true && !IsDto(type))
                return;

            // Avoid circular processing
            if (processedTypes.Contains(type))
            {
                // Just add the link if node already exists
                var existingNodeId = GetTypeNodeId(type);
                if (mindmap.Nodes.Any(n => n.Id == existingNodeId))
                {
                    if (!mindmap.Links.Any(l => l.Source == sourceNodeId && l.Target == existingNodeId))
                    {
                        mindmap.Links.Add(new MindmapLink
                        {
                            Source = sourceNodeId,
                            Target = existingNodeId,
                            Type = linkType
                        });
                    }
                }
                return;
            }

            processedTypes.Add(type);

            var typeNodeId = GetTypeNodeId(type);

            // Add DTO node
            if (!mindmap.Nodes.Any(n => n.Id == typeNodeId))
            {
                mindmap.Nodes.Add(new MindmapNode
                {
                    Id = typeNodeId,
                    Type = "dto",
                    Description = type.Name,
                    Metadata = new Dictionary<string, object>
                    {
                        { "typeName", type.Name },
                        { "namespace", type.Namespace ?? "" }
                    }
                });
            }

            // Link action to DTO
            if (!mindmap.Links.Any(l => l.Source == sourceNodeId && l.Target == typeNodeId))
            {
                mindmap.Links.Add(new MindmapLink
                {
                    Source = sourceNodeId,
                    Target = typeNodeId,
                    Type = linkType
                });
            }

            // Process properties for nested DTOs
            if (IsDto(type))
            {
                foreach (var property in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
                {
                    ProcessType(property.PropertyType, typeNodeId, "references", mindmap, processedTypes);
                }
            }
        }

        private Type UnwrapType(Type type)
        {
            // Unwrap Task<T>
            if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(System.Threading.Tasks.Task<>))
            {
                type = type.GetGenericArguments()[0];
            }

            // Unwrap ActionResult<T>
            if (type.IsGenericType && type.GetGenericTypeDefinition().Name.StartsWith("ActionResult"))
            {
                type = type.GetGenericArguments()[0];
            }

            // Unwrap IEnumerable<T>, List<T>, etc.
            if (type.IsGenericType)
            {
                var genericDef = type.GetGenericTypeDefinition();
                if (CollectionTypes.Contains(genericDef))
                {
                    type = type.GetGenericArguments()[0];
                }
            }

            return type;
        }

        private bool IsDto(Type type)
        {
            // Skip framework types
            if (type.Namespace?.StartsWith("System") == true || 
                type.Namespace?.StartsWith("Microsoft") == true)
                return false;

            // Simple heuristic: if it's a class with public properties, consider it a DTO
            return type.IsClass && 
                   !type.IsAbstract && 
                   type.GetProperties(BindingFlags.Public | BindingFlags.Instance).Any();
        }

        private string GetTypeNodeId(Type type)
        {
            return $"DTO.{type.Name}";
        }
    }
}
