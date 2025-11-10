using Microsoft.AspNetCore.Mvc;
using TestAPI.Models;

namespace TestAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    /// <summary>
    /// Get all products
    /// </summary>
    [HttpGet]
    public ActionResult<List<ProductDto>> GetProducts([FromQuery] string? category = null)
    {
        return Ok(new List<ProductDto>());
    }

    /// <summary>
    /// Get product by ID
    /// </summary>
    [HttpGet("{id}")]
    public ActionResult<ProductDto> GetProduct(int id)
    {
        return Ok(new ProductDto { Id = id });
    }

    /// <summary>
    /// Get product details with reviews
    /// </summary>
    [HttpGet("{id}/details")]
    public ActionResult<ProductDetailDto> GetProductDetails(int id)
    {
        return Ok(new ProductDetailDto { Id = id });
    }

    /// <summary>
    /// Create a new product
    /// </summary>
    [HttpPost]
    public ActionResult<ProductDto> CreateProduct([FromBody] CreateProductDto createProductDto)
    {
        return CreatedAtAction(nameof(GetProduct), new { id = 1 }, new ProductDto { Id = 1 });
    }

    /// <summary>
    /// Update product information
    /// </summary>
    [HttpPut("{id}")]
    public ActionResult<ProductDto> UpdateProduct(int id, [FromBody] UpdateProductDto updateProductDto)
    {
        return Ok(new ProductDto { Id = id });
    }

    /// <summary>
    /// Delete a product
    /// </summary>
    [HttpDelete("{id}")]
    public ActionResult DeleteProduct(int id)
    {
        return NoContent();
    }

    /// <summary>
    /// Get product reviews
    /// </summary>
    [HttpGet("{id}/reviews")]
    public ActionResult<List<ReviewDto>> GetProductReviews(int id)
    {
        return Ok(new List<ReviewDto>());
    }

    /// <summary>
    /// Add a review to product
    /// </summary>
    [HttpPost("{id}/reviews")]
    public ActionResult<ReviewDto> AddProductReview(int id, [FromBody] ReviewDto reviewDto)
    {
        return CreatedAtAction(nameof(GetProductReviews), new { id }, reviewDto);
    }

    /// <summary>
    /// Search products
    /// </summary>
    [HttpGet("search")]
    public ActionResult<List<ProductDto>> SearchProducts([FromQuery] string query)
    {
        return Ok(new List<ProductDto>());
    }
}
