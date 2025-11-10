# 🧠 API Mindmap — Advanced API Insight Dashboard

**API Mindmap** is a powerful visualization dashboard for ASP.NET Core (6.0+) APIs. It auto-discovers all endpoints, controllers, and DTOs, and renders **multiple interactive views** — directly inside your API — just like Swagger UI, but with advanced visualization capabilities.

<img width="1902" height="898" alt="Screenshot 2025-11-10 111220" src="https://github.com/user-attachments/assets/dfd45642-0a22-47aa-bbbb-33538f58ddaa" />


## ✨ What's New in v3.0

🗄️ **Database Analyzer** — Visualize your database schema from Entity Framework DbContext  
🔗 **Unified API** — Single fluent call: `app.UseApiMindmap().WithDbAnalyzer<TDbContext>()`  
🌐 **Simplified Routes** — `/mindmap/index.json` and `/mindmap/database.json`  
🔍 **Auto-Detection** — Database tab appears automatically when analyzer is enabled  
📊 **Smart Schema Analysis** — Detects entities, relationships, join tables, and cardinality  
🎨 **Interactive Graph** — Color-coded entities and relationships with D3.js  
♻️ **Backward Compatible** — Existing v2 code continues to work  

## ✨ What's New in v2.0

🎨 **Modern UI** — TailwindCSS-based design with Lucide icons  
🌓 **Dark/Light Mode** — Toggle between themes with one click  
📊 **6 Visualization Modes** — Mindmap, Tree, Dependency, Table, Matrix, Dashboard  
💾 **Comprehensive Export** — PNG, SVG, PDF, CSV, JSON, Markdown  
⌨️ **Keyboard Shortcuts** — Ctrl+/-, R, F, / for efficient navigation  
📈 **Advanced Insights** — Top DTOs, controller metrics, HTTP method distribution  
⚙️ **Configurable** — Customize default view, theme, and features  
🚀 **Performance Optimized** — D3.js force simulation for large APIs  

## 🎯 Features

✅ **One-line setup** — like Swagger UI  
✅ Works with **any ASP.NET Core 6+ microservice**  
✅ Generates **live, up-to-date API structure**  
✅ **7 visualization views** for different perspectives (including Database)  
✅ **Interactive visualizations** with zoom, pan, drag, and search  
✅ **Database schema visualization** from Entity Framework DbContext  
✅ **Professional exports** with metadata and legends  
✅ **Dark/Light theme** support  
✅ **Keyboard shortcuts** for power users  
✅ Lightweight — no database or extra service required  

## 🚀 Quick Start

### Installation

```bash
dotnet add package MindBoiling.APIMindmap
```

### v3 Unified API (Recommended)

Use the new unified API for both API visualization and Database Analyzer:

```csharp
using APIMindmap.Extensions;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add your services
builder.Services.AddControllers();

// Add your DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

app.MapControllers();

// 👇 One-line setup with Database Analyzer
app.UseApiMindmap()
   .WithDbAnalyzer<ApplicationDbContext>();

app.Run();
```

### v2 Basic Integration (Still Supported)

Add these two lines to your `Program.cs`:

```csharp
using APIMindmap.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add your services
builder.Services.AddControllers();

var app = builder.Build();

// 👇 Add API Mindmap UI (serves static files)
app.UseApiMindmapUI();

app.MapControllers();

// 👇 Add API Mindmap data endpoint
app.MapApiMindmap();

app.Run();
```

### Advanced Configuration

Customize the behavior with options:

```csharp
app.UseApiMindmapUI(options =>
{
    options.DefaultView = "dashboard";  // Start with dashboard view
    options.Theme = "dark";             // Use dark theme by default
    options.EnableExport = true;        // Enable export features
    options.Title = "My API Explorer";  // Custom title
});
```

### Usage

Now visit:
- **`/swagger`** → traditional API documentation
- **`/mindmap/mindmap/index.html`** → interactive API insight dashboard
- **Database tab** → appears automatically when `WithDbAnalyzer()` is used

## 🎨 Visualization Modes

API Mindmap provides 7 different views to explore your API and database from multiple angles:

### 🧠 Mindmap View (Default)
Interactive force-directed graph showing controllers, methods, and DTOs with their relationships. Perfect for understanding the overall structure at a glance.

**Features:**
- Drag nodes to rearrange
- Zoom and pan smoothly
- Click to highlight connected nodes
- Color-coded by type (Controllers: Purple, Methods: Pink, DTOs: Cyan)

### 🌳 Tree View
Hierarchical layout showing Controller → Methods → DTOs in a tree structure. Ideal for drilling down into specific controllers.

**Features:**
- Clear hierarchical organization
- Expandable/collapsible branches
- Easy to trace data flow

### 🕸️ Dependency View
Visualizes shared DTOs and their cross-links across multiple methods. Shows which DTOs are most commonly used.

**Features:**
- Highlights reusable components
- Identifies coupling points
- Great for refactoring insights

### 📊 Table View
Searchable and sortable table of all endpoints with complete details.

**Columns:**
- Controller name
- Method name
- HTTP verb (GET, POST, PUT, DELETE, etc.)
- Route pattern
- DTOs used

### 🧩 Matrix View
Heat map showing which controllers use which DTOs. Excellent for understanding data model usage patterns.

**Features:**
- Quick visual scan of DTO usage
- Identify unused DTOs
- Spot controller-DTO coupling

### 📈 Dashboard View
Statistical overview with interactive charts showing API metrics.

**Charts:**
- API Overview (doughnut chart)
- Top Controllers by method count (bar chart)
- HTTP Methods Distribution (pie chart)
- Most Used DTOs (horizontal bar chart)

### 🗄️ Database Analyzer View (v3)
Interactive database schema visualization extracted from Entity Framework DbContext. **Automatically appears when `WithDbAnalyzer()` is configured.**

**Features:**
- Force-directed graph layout showing entities and relationships
- Smart join table detection (many-to-many relationships)
- Color-coded nodes:
  - 🟣 **Purple**: Regular entities (tables)
  - 💗 **Pink**: Join tables (composite keys)
  - 🟢 **Green**: Views (future support)
- Relationship type visualization:
  - 🔵 **Blue links**: One-to-one relationships
  - 🟠 **Orange links**: One-to-many relationships
  - 🔴 **Red links**: Many-to-many relationships
- Interactive tooltips showing table details, columns, and keys
- Drag nodes, zoom, and pan for large schemas
- Compatible with EF Core 6.0, 7.0, and 8.0

**Example:**
```csharp
// Configure in Program.cs
app.UseApiMindmap()
   .WithDbAnalyzer<YourDbContext>();
```

## 💾 Export Options

Export your API visualization in multiple formats:

| Format | Description | Use Case |
|--------|-------------|----------|
| **PNG** | High-quality screenshot | Presentations, documentation |
| **SVG** | Vector graphics | Scalable diagrams, design tools |
| **PDF** | Full report with metadata | Formal documentation, archival |
| **CSV** | Endpoint data table | Excel analysis, data processing |
| **JSON** | Raw API structure data | Integration with other tools |
| **Markdown** | Formatted API summary | README files, wiki pages |

All exports include:
- Timestamp and version info
- Node statistics
- Legends and color keys

## ⌨️ Keyboard Shortcuts

Power user features for efficient navigation:

| Shortcut | Action |
|----------|--------|
| `Ctrl +` / `Cmd +` | Zoom in |
| `Ctrl -` / `Cmd -` | Zoom out |
| `R` | Reset view |
| `F` | Toggle fullscreen |
| `/` | Focus search box |
| `Esc` | Clear search/highlights |

## 📊 What It Shows

API Mindmap automatically discovers and visualizes:

- **Controllers** (purple circles) - Your API controllers
- **Methods** (pink circles) - HTTP endpoints with their verbs (GET, POST, PUT, DELETE)
- **DTOs** (cyan circles) - Data Transfer Objects and their relationships
- **Relationships** - How controllers contain methods, methods accept/return DTOs, and DTOs reference other DTOs

## 🎨 Interactive Features

- **Zoom In/Out** - Scale the visualization with mouse wheel or buttons
- **Pan** - Click and drag to move around
- **Drag Nodes** - Click and drag individual nodes to rearrange (Mindmap view)
- **Search** - Find specific controllers, methods, or DTOs with highlighting
- **Click to Highlight** - Click a node to highlight all connected nodes
- **Dark/Light Mode** - Toggle theme to match your preference
- **View Switching** - Switch between 6 different visualization modes
- **Hover Tooltips** - See detailed information about each node

## 🔧 Configuration Options

Customize API Mindmap behavior with options:

```csharp
// v3 API with options
app.UseApiMindmap(options => {
    options.DefaultView = "database";  // Start with database view
    options.Theme = "dark";            // Use dark theme by default
    options.EnableExport = true;       // Enable export features
    options.Title = "My API Explorer"; // Custom title
})
.WithDbAnalyzer<ApplicationDbContext>();

// v2 API (legacy)
app.UseApiMindmapUI(options => {
    options.DefaultView = "mindmap";
    options.Theme = "light";
    options.EnableExport = true;
    options.Title = "API Mindmap";
    options.EnableCaching = true;
});
```

**Available Options:**
```csharp
public class ApiMindmapOptions
{
    /// Options: "mindmap", "tree", "dependency", "table", "matrix", "dashboard", "database"
    public string DefaultView { get; set; } = "mindmap";
    
    /// Options: "light", "dark", "auto"
    public string Theme { get; set; } = "light";
    
    /// Enable/disable export functionality
    public bool EnableExport { get; set; } = true;
    
    /// Custom title for the navigation bar
    public string Title { get; set; } = "API Mindmap";
    
    /// Enable client-side caching
    public bool EnableCaching { get; set; } = true;
    
    /// Enable Database Analyzer (set automatically by WithDbAnalyzer)
    public bool EnableDatabaseAnalyzer { get; set; } = false;
}
```

## 🗄️ Database Analyzer API Reference (v3)

The Database Analyzer extension provides a fluent API for seamless DbContext integration:

### Setup Methods

```csharp
// Primary v3 API - Unified setup
IEndpointRouteBuilder.UseApiMindmap(Action<ApiMindmapOptions>? options = null)
    → Returns ApiMindmapBuilder for chaining

// Database Analyzer extension
ApiMindmapBuilder.WithDbAnalyzer<TDbContext>() where TDbContext : DbContext
    → Enables database schema visualization
```

### Endpoints Created

When using `UseApiMindmap().WithDbAnalyzer<T>()`, the following endpoints are automatically registered:

| Endpoint | Description | Response |
|----------|-------------|----------|
| `/mindmap/mindmap/index.html` | Main UI (auto-detects DB analyzer) | HTML |
| `/mindmap/index.json` | API structure (controllers, methods, DTOs) | JSON |
| `/mindmap/database.json` | Database schema (entities, relationships) | JSON |
| `/mindmap/config.json` | Configuration settings | JSON |
| `/api/mindmap` | Legacy API structure endpoint | JSON |

### Database Schema Response Format

```json
{
  "nodes": [
    {
      "id": "Entity.User",
      "type": "entity",
      "description": "User",
      "metadata": {
        "entityName": "User",
        "tableName": "Users",
        "schema": "dbo",
        "isJoinTable": false,
        "columns": [
          {
            "name": "Id",
            "type": "Int32",
            "isNullable": false,
            "isPrimaryKey": true,
            "isForeignKey": false
          }
        ],
        "primaryKeys": ["Id"]
      }
    }
  ],
  "links": [
    {
      "source": "Entity.Order",
      "target": "Entity.User",
      "type": "one-to-many",
      "metadata": {
        "foreignKeyName": "FK_Orders_Users",
        "foreignKeyColumns": ["UserId"],
        "principalKeyColumns": ["Id"],
        "isRequired": true,
        "deleteAction": "Restrict"
      }
    }
  ]
}
```

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   Your .NET Microservice API        │
├─────────────────────────────────────┤
│ EndpointScanner    (API discovery)  │
│ DbContextScanner   (DB analysis)    │  ← v3 Extension
│ Endpoints:                          │
│  • /mindmap/index.json              │
│  • /mindmap/database.json           │  ← v3 Endpoint
│  • /mindmap/index.html              │
└─────────────────────────────────────┘
```

## 📁 Project Structure

```
APIMindmap/
 ├── Extensions/
 │   └── ApiMindmapExtensions.cs   # Extension methods for easy integration
 ├── Scanners/
 │   └── EndpointScanner.cs        # Endpoint and DTO discovery logic
 ├── Models/
 │   ├── MindmapDto.cs             # Data models for mindmap representation
 │   └── ApiMindmapOptions.cs      # Configuration options
 ├── wwwroot/mindmap/
 │   ├── index.html                # Modern UI with TailwindCSS
 │   ├── mindmap.js                # Visualization logic with D3.js
 │   └── mindmap.css               # Styling
 └── APIMindmap.csproj
```

## 🔧 API Data Format

The `/api/mindmap` endpoint returns JSON in this format:

```json
{
  "nodes": [
    {
      "id": "UsersController",
      "type": "controller",
      "description": "Users Controller",
      "metadata": { "controllerName": "Users" }
    },
    {
      "id": "Users.GetUsers",
      "type": "method",
      "description": "GET GetUsers",
      "metadata": {
        "httpMethod": "GET",
        "route": "api/Users",
        "actionName": "GetUsers"
      }
    },
    {
      "id": "DTO.UserDto",
      "type": "dto",
      "description": "UserDto",
      "metadata": {
        "typeName": "UserDto",
        "namespace": "YourApp.Models"
      }
    }
  ],
  "links": [
    {
      "source": "UsersController",
      "target": "Users.GetUsers",
      "type": "contains"
    },
    {
      "source": "Users.GetUsers",
      "target": "DTO.UserDto",
      "type": "returns"
    }
  ]
}
```

## 🌍 Microservices Integration

In a distributed system:
- Each microservice hosts its own `/mindmap` route
- A central **Mindmap Aggregator Dashboard** (optional) can call `/api/mindmap` of each service and merge graphs
- You get a **global system mindmap** showing all inter-service relationships

## 🚀 Performance

- **Efficient rendering** with D3.js force simulation
- **Smart caching** of API data on client-side
- **Optimized for large APIs** with hundreds of endpoints
- **Smooth animations** and transitions
- **Responsive design** that works on all screen sizes

## 🆚 Why API Mindmap?

Traditional API documentation (like Swagger) is great for understanding individual endpoints, but it doesn't show you the **big picture** of how your API is structured. API Mindmap fills this gap by providing:

- **Visual Overview** - See your entire API architecture at a glance
- **Multiple Perspectives** - 6 different views for different use cases
- **Interactive Exploration** - Zoom, pan, search, and filter
- **Actionable Insights** - Top DTOs, controller metrics, dependency analysis
- **Professional Exports** - Share visualizations in any format
- **Developer-Friendly** - Keyboard shortcuts and dark mode

This makes it invaluable for:
- **Onboarding new developers** - Quickly understand the API structure
- **Architecture reviews** - See the complete picture and identify issues
- **Debugging** - Trace data flow through your API
- **Documentation** - Visual supplement to written docs
- **Refactoring** - Identify coupling and reusable components
- **Presentations** - Export beautiful diagrams for stakeholders

## 🔮 Future Enhancements

- **AI Summaries:** Auto-describe controllers and DTOs using LLMs
- **Git Integration:** Highlight new or changed endpoints since last commit
- **Architecture Diff:** Compare mindmaps between versions
- **WebSocket Live Mode:** Re-render visualization when code changes
- **Swagger Merge:** Overlay endpoint docs onto the graph nodes
- **Multi-Service View:** Aggregate multiple microservices in one dashboard
- **Custom Filters:** Filter by HTTP method, controller, or DTO type
- **Collaborative Annotations:** Add comments and notes to nodes

## 📝 License

MIT License - feel free to use in commercial and open-source projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

Built with:
- [D3.js](https://d3js.org/) - Data visualization library
- [Chart.js](https://www.chartjs.org/) - Charting library
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide Icons](https://lucide.dev/) - Beautiful open-source icons
- [html2canvas](https://html2canvas.hertzen.com/) - Screenshot generation
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation

---

**API Mindmap** makes API architecture visible, navigable, and explainable — right where it belongs: inside your API.  
It's the **Swagger of visualization**, built for the modern microservice world.
