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
        /// Initializes API Mindmap with a unified fluent API for configuring API visualization and optional Database Analyzer.
        /// This is the recommended v3 approach that combines UI, endpoints, and database analysis in a single call chain.
        /// </summary>
        /// <param name="endpoints">The endpoint route builder instance.</param>
        /// <param name="configureOptions">Optional action to configure API Mindmap options.</param>
        /// <returns>An ApiMindmapBuilder for method chaining with additional features like Database Analyzer.</returns>
        /// <example>
        /// <code>
        /// // Basic usage
        /// app.UseApiMindmap();
        /// 
        /// // With Database Analyzer
        /// app.UseApiMindmap()
        ///    .WithDbAnalyzer&lt;ApplicationDbContext&gt;();
        /// 
        /// // With custom options
        /// app.UseApiMindmap(options => {
        ///     options.DefaultView = "dashboard";
        ///     options.Theme = "dark";
        /// })
        /// .WithDbAnalyzer&lt;ApplicationDbContext&gt;();
        /// </code>
        /// </example>
        /// <remarks>
        /// This method serves the UI at /mindmap/index.html and creates endpoints at /mindmap/index.json.
        /// Call this method after MapControllers() in your Program.cs.
        /// </remarks>
        public static ApiMindmapBuilder UseApiMindmap(this IEndpointRouteBuilder endpoints, Action<ApiMindmapOptions>? configureOptions = null)
        {
            var app = (IApplicationBuilder)endpoints;
            var options = new ApiMindmapOptions();
            configureOptions?.Invoke(options);

            // Register options in DI container
            var serviceProvider = app.ApplicationServices;
            var optionsService = serviceProvider.GetService<IOptions<ApiMindmapOptions>>();
            if (optionsService != null)
            {
                optionsService.Value.CopyFrom(options);
            }

            var assembly = typeof(ApiMindmapExtensions).Assembly;
            var provider = new ManifestEmbeddedFileProvider(assembly, "wwwroot");

            // Serve embedded UI files at /mindmap
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

            // Map new v3 endpoints with simplified paths
            endpoints.MapGet("/mindmap/index.json", (IEnumerable<EndpointDataSource> dataSources) =>
            {
                var scanner = new EndpointScanner(dataSources);
                return Results.Json(scanner.Scan());
            })
            .WithName("GetApiMindmapJson")
            .WithTags("ApiMindmap")
            .ExcludeFromDescription();

            endpoints.MapGet("/mindmap/config.json", (IServiceProvider sp) =>
            {
                var opts = sp.GetService<IOptions<ApiMindmapOptions>>()?.Value ?? new ApiMindmapOptions();
                return Results.Json(opts);
            })
            .WithName("GetApiMindmapConfig")
            .WithTags("ApiMindmap")
            .ExcludeFromDescription();

            // Also maintain backward compatibility with /api/mindmap endpoint
            endpoints.MapGet("/api/mindmap", (IEnumerable<EndpointDataSource> dataSources) =>
            {
                var scanner = new EndpointScanner(dataSources);
                return Results.Json(scanner.Scan());
            })
            .WithName("GetApiMindmap_Legacy")
            .WithTags("ApiMindmap");

            return new ApiMindmapBuilder(app, endpoints, options);
        }

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
        /// [Obsolete] Consider using the new UseApiMindmap() method in v3 for a unified API.
        /// </remarks>
        [Obsolete("Use UseApiMindmap() extension on IEndpointRouteBuilder instead for v3 unified API. This method is kept for backward compatibility.")]
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
        /// [Obsolete] Consider using the new UseApiMindmap() method in v3 for a unified API.
        /// </remarks>
        [Obsolete("Use UseApiMindmap() extension on IEndpointRouteBuilder instead for v3 unified API. This method is kept for backward compatibility.")]
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
            target.EnableDatabaseAnalyzer = source.EnableDatabaseAnalyzer;
            target.DbContextType = source.DbContextType;
        }
    }
}
