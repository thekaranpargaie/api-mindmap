using Microsoft.AspNetCore.Mvc;
using TestAPI.Models;

namespace TestAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    /// <summary>
    /// Get all users
    /// </summary>
    [HttpGet]
    public ActionResult<List<UserDto>> GetUsers()
    {
        return Ok(new List<UserDto>());
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    public ActionResult<UserDto> GetUser(int id)
    {
        return Ok(new UserDto { Id = id });
    }

    /// <summary>
    /// Get user profile with addresses
    /// </summary>
    [HttpGet("{id}/profile")]
    public ActionResult<UserProfileDto> GetUserProfile(int id)
    {
        return Ok(new UserProfileDto { Id = id });
    }

    /// <summary>
    /// Create a new user
    /// </summary>
    [HttpPost]
    public ActionResult<UserDto> CreateUser([FromBody] CreateUserDto createUserDto)
    {
        return CreatedAtAction(nameof(GetUser), new { id = 1 }, new UserDto { Id = 1 });
    }

    /// <summary>
    /// Update user information
    /// </summary>
    [HttpPut("{id}")]
    public ActionResult<UserDto> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
    {
        return Ok(new UserDto { Id = id });
    }

    /// <summary>
    /// Delete a user
    /// </summary>
    [HttpDelete("{id}")]
    public ActionResult DeleteUser(int id)
    {
        return NoContent();
    }

    /// <summary>
    /// Get user addresses
    /// </summary>
    [HttpGet("{id}/addresses")]
    public ActionResult<List<AddressDto>> GetUserAddresses(int id)
    {
        return Ok(new List<AddressDto>());
    }

    /// <summary>
    /// Add address to user
    /// </summary>
    [HttpPost("{id}/addresses")]
    public ActionResult<AddressDto> AddUserAddress(int id, [FromBody] AddressDto addressDto)
    {
        return CreatedAtAction(nameof(GetUserAddresses), new { id }, addressDto);
    }
}
