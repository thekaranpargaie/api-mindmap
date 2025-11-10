# TestAPI - API Mindmap Test Project

This is a test API project created to easily test the API Mindmap visualization tool.

## Quick Start

```bash
# From the TestAPI directory
dotnet run
```

The API will start at:
- **HTTP**: http://localhost:5000
- **HTTPS**: https://localhost:7001

## Access Points

- **API Mindmap**: https://localhost:7001/mindmap/mindmap/index.html
- **Mindmap Data (JSON)**: https://localhost:7001/api/mindmap
- **Swagger UI**: https://localhost:7001/swagger

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/{id}/profile` - Get user profile with addresses
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `GET /api/users/{id}/addresses` - Get user addresses
- `POST /api/users/{id}/addresses` - Add address to user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/{id}/details` - Get product details with reviews
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `GET /api/products/{id}/reviews` - Get product reviews
- `POST /api/products/{id}/reviews` - Add review to product
- `GET /api/products/search` - Search products

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders/{id}/details` - Get order details with items
- `POST /api/orders` - Create new order
- `PUT /api/orders/{id}/status` - Update order status
- `DELETE /api/orders/{id}` - Cancel order
- `GET /api/orders/user/{userId}` - Get orders by user
- `GET /api/orders/{id}/items` - Get order items

## DTOs Used

This test API includes various DTOs to demonstrate complex relationships:

- **User DTOs**: UserDto, CreateUserDto, UpdateUserDto, UserProfileDto, AddressDto
- **Product DTOs**: ProductDto, CreateProductDto, UpdateProductDto, ProductDetailDto, ReviewDto
- **Order DTOs**: OrderDto, CreateOrderDto, OrderItemDto, OrderDetailDto, OrderItemDetailDto

## Features to Test in Mindmap

1. **Multiple Controllers** - Users, Products, Orders
2. **Complex DTOs** - Nested relationships (Orders ? Users, Products)
3. **Different HTTP Methods** - GET, POST, PUT, DELETE
4. **Multiple Views** - Mindmap, Tree, Dependencies, Table, Matrix, Dashboard
5. **Dark/Light Themes** - Toggle with theme button or press 'T'
6. **Export Options** - PNG, SVG, PDF, CSV, JSON, Markdown
7. **Search & Filter** - Find specific endpoints or DTOs
8. **Interactive Graphs** - Zoom, pan, reset

## How It Works

The TestAPI project:
1. References the APIMindmap library via project reference
2. Calls `app.UseApiMindmapUI()` to serve the visualization UI
3. Calls `app.MapApiMindmap()` to expose the data endpoint
4. The UI is served at `/mindmap/mindmap/index.html`
5. The data is available at `/api/mindmap` as JSON

## Development

This project references the APIMindmap library locally:
```xml
<ProjectReference Include="..\APIMindmap\APIMindmap.csproj" />
```

Any changes to the APIMindmap project will be reflected when you rebuild and run this test API.

## Troubleshooting

**404 Error**: Make sure to navigate to `/mindmap/mindmap/index.html` not just `/api-mindmap`

**Build Errors**: Ensure you're building from the solution root or that APIMindmap is built first

**No Data Showing**: Check that controllers are being discovered by visiting `/api/mindmap` directly
