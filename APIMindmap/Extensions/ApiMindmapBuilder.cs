using System;
using APIMindmap.Models;
using APIMindmap.Scanners;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;

namespace APIMindmap.Extensions
{
    /// <summary>
    /// Fluent builder for configuring API Mindmap with optional Database Analyzer extension.
    /// </summary>
    public class ApiMindmapBuilder
    {
        private readonly IApplicationBuilder _app;
        private readonly IEndpointRouteBuilder _endpoints;
        private readonly ApiMindmapOptions _options;

        internal ApiMindmapBuilder(IApplicationBuilder app, IEndpointRouteBuilder endpoints, ApiMindmapOptions options)
        {
            _app = app;
            _endpoints = endpoints;
            _options = options;
        }

        /// <summary>
        /// Adds Database Analyzer extension to visualize database schema from Entity Framework DbContext.
        /// </summary>
        /// <typeparam name="TDbContext">The DbContext type to analyze.</typeparam>
        /// <returns>The builder instance for method chaining.</returns>
        /// <example>
        /// <code>
        /// app.UseApiMindmap()
        ///    .WithDbAnalyzer&lt;ApplicationDbContext&gt;();
        /// </code>
        /// </example>
        public ApiMindmapBuilder WithDbAnalyzer<TDbContext>() where TDbContext : DbContext
        {
            _options.EnableDatabaseAnalyzer = true;
            _options.DbContextType = typeof(TDbContext);

            // Register the database endpoint
            _endpoints.MapGet("/mindmap/database.json", (IServiceProvider serviceProvider) =>
            {
                var dbContext = serviceProvider.GetRequiredService<TDbContext>();
                var scanner = new DbContextScanner(dbContext);
                return Results.Json(scanner.Scan());
            })
            .WithName("GetDatabaseSchema")
            .WithTags("ApiMindmap")
            .ExcludeFromDescription();

            return this;
        }

        /// <summary>
        /// Configures custom options for API Mindmap.
        /// </summary>
        /// <param name="configureOptions">Action to configure options.</param>
        /// <returns>The builder instance for method chaining.</returns>
        public ApiMindmapBuilder WithOptions(Action<ApiMindmapOptions> configureOptions)
        {
            configureOptions?.Invoke(_options);
            return this;
        }

        internal IApplicationBuilder Build()
        {
            // Store final options in DI container
            var serviceProvider = _app.ApplicationServices;
            var optionsService = serviceProvider.GetService<Microsoft.Extensions.Options.IOptions<ApiMindmapOptions>>();
            if (optionsService != null)
            {
                var targetOptions = optionsService.Value;
                targetOptions.CopyFrom(_options);
            }

            return _app;
        }
    }
}
