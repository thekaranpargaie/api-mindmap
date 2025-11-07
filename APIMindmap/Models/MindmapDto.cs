using System.Collections.Generic;

namespace APIMindmap.Models
{
    /// <summary>
    /// Represents the complete mindmap data structure containing nodes and links.
    /// </summary>
    public class MindmapDto
    {
        /// <summary>
        /// Gets or sets the collection of nodes representing controllers, methods, and DTOs.
        /// </summary>
        public List<MindmapNode> Nodes { get; set; } = new();

        /// <summary>
        /// Gets or sets the collection of links representing relationships between nodes.
        /// </summary>
        public List<MindmapLink> Links { get; set; } = new();
    }

    /// <summary>
    /// Represents a single node in the mindmap (controller, method, or DTO).
    /// </summary>
    public class MindmapNode
    {
        /// <summary>
        /// Gets or sets the unique identifier for the node.
        /// </summary>
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the type of node (controller, method, or dto).
        /// </summary>
        public string Type { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the human-readable description of the node.
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Gets or sets additional metadata about the node (HTTP method, route, namespace, etc.).
        /// </summary>
        public Dictionary<string, object>? Metadata { get; set; }
    }

    /// <summary>
    /// Represents a link/relationship between two nodes in the mindmap.
    /// </summary>
    public class MindmapLink
    {
        /// <summary>
        /// Gets or sets the source node ID.
        /// </summary>
        public string Source { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the target node ID.
        /// </summary>
        public string Target { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the type of relationship (contains, returns, accepts, references).
        /// </summary>
        public string? Type { get; set; }
    }
}
