using System.Collections.Generic;

namespace APIMindmap.Models
{
    /// <summary>
    /// Represents the complete database schema structure containing entities and relationships.
    /// </summary>
    public class DbSchemaDto
    {
        /// <summary>
        /// Gets or sets the collection of nodes representing database entities, join tables, and views.
        /// </summary>
        public List<DbSchemaNode> Nodes { get; set; } = new();

        /// <summary>
        /// Gets or sets the collection of links representing relationships between entities.
        /// </summary>
        public List<DbSchemaLink> Links { get; set; } = new();
    }

    /// <summary>
    /// Represents a single node in the database schema (entity, join table, or view).
    /// </summary>
    public class DbSchemaNode
    {
        /// <summary>
        /// Gets or sets the unique identifier for the node.
        /// </summary>
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the type of node (entity, join_table, or view).
        /// </summary>
        public string Type { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the human-readable description of the node.
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Gets or sets additional metadata about the node (table name, columns, keys, etc.).
        /// </summary>
        public Dictionary<string, object>? Metadata { get; set; }
    }

    /// <summary>
    /// Represents a relationship/foreign key between two entities in the database schema.
    /// </summary>
    public class DbSchemaLink
    {
        /// <summary>
        /// Gets or sets the source entity ID.
        /// </summary>
        public string Source { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the target entity ID.
        /// </summary>
        public string Target { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the type of relationship (one-to-one, one-to-many, many-to-many).
        /// </summary>
        public string? Type { get; set; }

        /// <summary>
        /// Gets or sets additional metadata about the relationship (foreign key name, cascade behavior, etc.).
        /// </summary>
        public Dictionary<string, object>? Metadata { get; set; }
    }
}
