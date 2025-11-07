# 🧠 API Mindmap — Advanced API Insight Dashboard

**API Mindmap** is a powerful visualization dashboard for ASP.NET Core (6.0+) APIs. It auto-discovers all endpoints, controllers, and DTOs, and renders **multiple interactive views** — directly inside your API — just like Swagger UI, but with advanced visualization capabilities.

![API Mindmap Screenshot](https://github.com/user-attachments/assets/46cb86dd-289b-4a24-b751-cbf9977264a6)

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
✅ **6 visualization views** for different perspectives  
✅ **Interactive visualizations** with zoom, pan, drag, and search  
✅ **Professional exports** with metadata and legends  
✅ **Dark/Light theme** support  
✅ **Keyboard shortcuts** for power users  
✅ Lightweight — no database or extra service required  

## 🚀 Quick Start

### Installation

```bash
dotnet add package MindBoiling.APIMindmap
```

### Basic Integration

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

## 🎨 Visualization Modes

API Mindmap provides 6 different views to explore your API from multiple angles:

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

Customize API Mindmap behavior through the `UseApiMindmapUI` options:

```csharp
public class ApiMindmapOptions
{
    /// Options: "mindmap", "tree", "dependency", "table", "matrix", "dashboard"
    public string DefaultView { get; set; } = "mindmap";
    
    /// Options: "light", "dark", "auto"
    public string Theme { get; set; } = "light";
    
    /// Enable/disable export functionality
    public bool EnableExport { get; set; } = true;
    
    /// Custom title for the navigation bar
    public string Title { get; set; } = "API Mindmap";
    
    /// Enable client-side caching
    public bool EnableCaching { get; set; } = true;
}
```

## 🏗️ Architecture

```
┌─────────────────────────────┐
│ Your .NET Microservice API │
├─────────────────────────────┤
│ EndpointScanner Middleware  │  ← Uses reflection to map all routes, DTOs, dependencies
│ MindmapController (/api/mindmap)
│ Embedded StaticFile Server (/mindmap)
└─────────────────────────────┘
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
