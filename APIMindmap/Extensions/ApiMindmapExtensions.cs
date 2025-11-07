using System;
using System.Collections.Generic;
using APIMindmap.Models;
using APIMindmap.Scanners;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;

namespace APIMindmap.Extensions
{
    /// <summary>
    /// Extension methods for integrating API Mindmap into ASP.NET Core applications.
    /// </summary>
    public static class ApiMindmapExtensions
    {
        /// <summary>
        /// Adds API Mindmap UI middleware to serve the interactive visualization interface.
        /// This serves the embedded static files (HTML, CSS, JavaScript) for the mindmap visualization.
        /// </summary>
        /// <param name="app">The application builder instance.</param>
        /// <param name="configureOptions">Optional action to configure API Mindmap options.</param>
        /// <returns>The application builder for method chaining.</returns>
        /// <example>
        /// <code>
        /// // Basic usage
        /// app.UseApiMindmapUI();
        /// 
        /// // With configuration
        /// app.UseApiMindmapUI(options => {
        ///     options.DefaultView = "tree";
        ///     options.Theme = "dark";
        ///     options.EnableExport = true;
        /// });
        /// </code>
        /// </example>
        /// <remarks>
        /// This middleware serves the UI at /mindmap/mindmap/index.html by default.
        /// Make sure to call this before MapControllers() in your Program.cs.
        /// </remarks>
        public static IApplicationBuilder UseApiMindmapUI(this IApplicationBuilder app, Action<ApiMindmapOptions>? configureOptions = null)
        {
            // Register options in DI container if not already registered
            var options = new ApiMindmapOptions();
            configureOptions?.Invoke(options);
            
            // Store in app state for later retrieval
            app.ApplicationServices.GetService<IOptions<ApiMindmapOptions>>()?.Value.CopyFrom(options);

            var assembly = typeof(ApiMindmapExtensions).Assembly;
            var provider = new ManifestEmbeddedFileProvider(assembly, "wwwroot");

            // Serve embedded UI files
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = provider,
                RequestPath = "/mindmap",
                ContentTypeProvider = new FileExtensionContentTypeProvider
                {
                    Mappings =
                    {
                        [".js"] = "application/javascript",
                        [".css"] = "text/css",
                        [".html"] = "text/html"
                    }
                }
            });

            return app;
        }

        /// <summary>
        /// Maps the API Mindmap data endpoint at /api/mindmap.
        /// This endpoint returns JSON data containing all discovered controllers, methods, and DTOs.
        /// </summary>
        /// <param name="endpoints">The endpoint route builder instance.</param>
        /// <returns>The endpoint route builder for method chaining.</returns>
        /// <example>
        /// <code>
        /// app.MapApiMindmap();
        /// </code>
        /// </example>
        /// <remarks>
        /// This endpoint automatically scans all registered endpoints and returns a JSON graph structure
        /// that can be consumed by the visualization UI or external tools.
        /// The endpoint is tagged with "ApiMindmap" for Swagger/OpenAPI documentation.
        /// </remarks>
        public static IEndpointRouteBuilder MapApiMindmap(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapGet("/api/mindmap", (IEnumerable<EndpointDataSource> dataSources) =>
            {
                var scanner = new EndpointScanner(dataSources);
                return Results.Json(scanner.Scan());
            })
            .WithName("GetApiMindmap")
            .WithTags("ApiMindmap");

            // Add configuration endpoint - returns default options
            endpoints.MapGet("/api/mindmap/config", () =>
            {
                return Results.Json(new ApiMindmapOptions());
            })
            .WithName("GetApiMindmapConfig")
            .WithTags("ApiMindmap")
            .ExcludeFromDescription();

            return endpoints;
        }
    }

    /// <summary>
    /// Extension methods for ApiMindmapOptions
    /// </summary>
    internal static class ApiMindmapOptionsExtensions
    {
        internal static void CopyFrom(this ApiMindmapOptions target, ApiMindmapOptions source)
        {
            target.DefaultView = source.DefaultView;
            target.Theme = source.Theme;
            target.EnableExport = source.EnableExport;
            target.Title = source.Title;
            target.EnableCaching = source.EnableCaching;
        }
    }
}
