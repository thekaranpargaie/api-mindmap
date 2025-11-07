namespace APIMindmap.Models
{
    /// <summary>
    /// Configuration options for API Mindmap UI
    /// </summary>
    public class ApiMindmapOptions
    {
        /// <summary>
        /// Gets or sets the default view to display when the page loads.
        /// Options: "mindmap", "tree", "dependency", "table", "matrix", "dashboard"
        /// Default: "mindmap"
        /// </summary>
        public string DefaultView { get; set; } = "mindmap";

        /// <summary>
        /// Gets or sets the default theme.
        /// Options: "light", "dark", "auto"
        /// Default: "light"
        /// </summary>
        public string Theme { get; set; } = "light";

        /// <summary>
        /// Gets or sets whether export functionality is enabled.
        /// Default: true
        /// </summary>
        public bool EnableExport { get; set; } = true;

        /// <summary>
        /// Gets or sets the title to display in the navigation bar.
        /// Default: "API Mindmap"
        /// </summary>
        public string Title { get; set; } = "API Mindmap";

        /// <summary>
        /// Gets or sets whether to enable caching of API data.
        /// Default: true
        /// </summary>
        public bool EnableCaching { get; set; } = true;
    }
}
