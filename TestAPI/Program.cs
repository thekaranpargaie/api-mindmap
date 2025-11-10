using APIMindmap.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Add API Mindmap UI - serves static files at /mindmap
app.UseApiMindmapUI();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Map API Mindmap data endpoint - available at /api/mindmap
app.MapApiMindmap();

app.Run();
