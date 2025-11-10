using System;
using System.Collections.Generic;
using System.Linq;
using APIMindmap.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace APIMindmap.Scanners
{
    /// <summary>
    /// Scans Entity Framework DbContext to extract database schema and relationships.
    /// </summary>
    public class DbContextScanner
    {
        private readonly DbContext _dbContext;

        public DbContextScanner(DbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        /// <summary>
        /// Scans the DbContext and generates a database schema representation.
        /// </summary>
        /// <returns>A DbSchemaDto containing all entities and relationships.</returns>
        public DbSchemaDto Scan()
        {
            var schema = new DbSchemaDto();
            var model = _dbContext.Model;
            var processedEntities = new HashSet<string>();

            // Process all entity types
            foreach (var entityType in model.GetEntityTypes())
            {
                // Skip shadow/owned entities that are part of other entities
                if (entityType.IsOwned())
                    continue;

                var entityName = entityType.ClrType.Name;
                var tableName = GetTableName(entityType);
                var entityId = $"Entity.{entityName}";

                if (processedEntities.Contains(entityId))
                    continue;

                processedEntities.Add(entityId);

                // Determine if this is a join table
                var isJoinTable = IsJoinTable(entityType);
                var nodeType = isJoinTable ? "join_table" : "entity";

                // Get columns information
                var columns = entityType.GetProperties()
                    .Select(p => new
                    {
                        Name = p.Name,
                        Type = p.ClrType.Name,
                        IsNullable = p.IsNullable,
                        IsPrimaryKey = p.IsPrimaryKey(),
                        IsForeignKey = p.IsForeignKey()
                    })
                    .ToList();

                // Get primary keys
                var primaryKeys = entityType.FindPrimaryKey()?.Properties
                    .Select(p => p.Name)
                    .ToList() ?? new List<string>();

                // Add entity node
                schema.Nodes.Add(new DbSchemaNode
                {
                    Id = entityId,
                    Type = nodeType,
                    Description = entityName,
                    Metadata = new Dictionary<string, object>
                    {
                        { "entityName", entityName },
                        { "tableName", tableName },
                        { "schema", GetSchemaName(entityType) },
                        { "isJoinTable", isJoinTable },
                        { "columns", columns },
                        { "primaryKeys", primaryKeys }
                    }
                });

                // Process relationships (navigations)
                ProcessRelationships(entityType, entityId, schema);
            }

            return schema;
        }

        private void ProcessRelationships(IEntityType entityType, string sourceEntityId, DbSchemaDto schema)
        {
            // Process foreign key relationships
            foreach (var foreignKey in entityType.GetForeignKeys())
            {
                var principalEntityType = foreignKey.PrincipalEntityType;
                var principalEntityId = $"Entity.{principalEntityType.ClrType.Name}";

                // Determine relationship type
                string relationshipType;
                var isUnique = foreignKey.IsUnique;
                var isRequired = foreignKey.IsRequired;

                if (isUnique)
                {
                    relationshipType = "one-to-one";
                }
                else
                {
                    // Check if this is part of a many-to-many
                    var isManyToMany = IsPartOfManyToMany(foreignKey);
                    relationshipType = isManyToMany ? "many-to-many" : "one-to-many";
                }

                var foreignKeyProperties = foreignKey.Properties
                    .Select(p => p.Name)
                    .ToList();

                var principalKeyProperties = foreignKey.PrincipalKey.Properties
                    .Select(p => p.Name)
                    .ToList();

                // Get constraint name with fallback
                var constraintName = GetConstraintName(foreignKey);

                // Add relationship link
                var linkId = $"{sourceEntityId}->{principalEntityId}";
                if (!schema.Links.Any(l => 
                    (l.Source == sourceEntityId && l.Target == principalEntityId) ||
                    (l.Source == principalEntityId && l.Target == sourceEntityId)))
                {
                    schema.Links.Add(new DbSchemaLink
                    {
                        Source = sourceEntityId,
                        Target = principalEntityId,
                        Type = relationshipType,
                        Metadata = new Dictionary<string, object>
                        {
                            { "foreignKeyName", constraintName },
                            { "foreignKeyColumns", foreignKeyProperties },
                            { "principalKeyColumns", principalKeyProperties },
                            { "isRequired", isRequired },
                            { "deleteAction", foreignKey.DeleteBehavior.ToString() }
                        }
                    });
                }
            }
        }

        private bool IsJoinTable(IEntityType entityType)
        {
            // A join table typically has:
            // 1. Composite primary key
            // 2. All PK properties are also FKs
            // 3. Two or more foreign keys
            
            var primaryKey = entityType.FindPrimaryKey();
            if (primaryKey == null || primaryKey.Properties.Count < 2)
                return false;

            var foreignKeys = entityType.GetForeignKeys().ToList();
            if (foreignKeys.Count < 2)
                return false;

            // Check if all primary key properties are foreign keys
            var allPkAreFk = primaryKey.Properties.All(p => p.IsForeignKey());
            
            return allPkAreFk;
        }

        private bool IsPartOfManyToMany(IForeignKey foreignKey)
        {
            // Check if the dependent entity is a join table
            return IsJoinTable(foreignKey.DeclaringEntityType);
        }

        private string GetTableName(IEntityType entityType)
        {
            // Try to get the table name, with fallback to entity name
            try
            {
                var tableName = entityType.GetTableName();
                return tableName ?? entityType.ClrType.Name;
            }
            catch
            {
                return entityType.ClrType.Name;
            }
        }

        private string GetSchemaName(IEntityType entityType)
        {
            // Try to get the schema name, with fallback to "dbo"
            try
            {
                return entityType.GetSchema() ?? "dbo";
            }
            catch
            {
                return "dbo";
            }
        }

        private string GetConstraintName(IForeignKey foreignKey)
        {
            // Try to get the constraint name, with fallback
            try
            {
                return foreignKey.GetConstraintName() ?? $"FK_{foreignKey.DeclaringEntityType.ClrType.Name}_{foreignKey.PrincipalEntityType.ClrType.Name}";
            }
            catch
            {
                return $"FK_{foreignKey.DeclaringEntityType.ClrType.Name}_{foreignKey.PrincipalEntityType.ClrType.Name}";
            }
        }
    }
}
