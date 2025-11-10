using Microsoft.AspNetCore.Mvc;
using TestAPI.Models;

namespace TestAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    /// <summary>
    /// Get all orders
    /// </summary>
    [HttpGet]
    public ActionResult<List<OrderDto>> GetOrders([FromQuery] string? status = null)
    {
        return Ok(new List<OrderDto>());
    }

    /// <summary>
    /// Get order by ID
    /// </summary>
    [HttpGet("{id}")]
    public ActionResult<OrderDto> GetOrder(int id)
    {
        return Ok(new OrderDto { Id = id });
    }

    /// <summary>
    /// Get order details with items
    /// </summary>
    [HttpGet("{id}/details")]
    public ActionResult<OrderDetailDto> GetOrderDetails(int id)
    {
        return Ok(new OrderDetailDto { Id = id });
    }

    /// <summary>
    /// Create a new order
    /// </summary>
    [HttpPost]
    public ActionResult<OrderDto> CreateOrder([FromBody] CreateOrderDto createOrderDto)
    {
        return CreatedAtAction(nameof(GetOrder), new { id = 1 }, new OrderDto { Id = 1 });
    }

    /// <summary>
    /// Update order status
    /// </summary>
    [HttpPut("{id}/status")]
    public ActionResult<OrderDto> UpdateOrderStatus(int id, [FromBody] string status)
    {
        return Ok(new OrderDto { Id = id, Status = status });
    }

    /// <summary>
    /// Cancel an order
    /// </summary>
    [HttpDelete("{id}")]
    public ActionResult CancelOrder(int id)
    {
        return NoContent();
    }

    /// <summary>
    /// Get orders by user
    /// </summary>
    [HttpGet("user/{userId}")]
    public ActionResult<List<OrderDto>> GetOrdersByUser(int userId)
    {
        return Ok(new List<OrderDto>());
    }

    /// <summary>
    /// Get order items
    /// </summary>
    [HttpGet("{id}/items")]
    public ActionResult<List<OrderItemDetailDto>> GetOrderItems(int id)
    {
        return Ok(new List<OrderItemDetailDto>());
    }
}
