using Microsoft.Data.SqlClient;
using Dapper;

namespace SCD.Enterprise;

public class AntigravityMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;

    public AntigravityMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        _configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Headers.TryGetValue("X-Antigravity-Token", out var tokenValue))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("Unauthorized: Token Missing");
            return;
        }

        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        using var connection = new SqlConnection(connectionString);

        // Mimic Antigravity: Validate token against SQL Server 'users' table
        // We assume token is the user ID for this implementation
        var userId = tokenValue.ToString();
        var userExists = await connection.ExecuteScalarAsync<bool>(
            "SELECT COUNT(1) FROM users WHERE id = @Id", 
            new { Id = userId }
        );

        if (!userExists)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("Unauthorized: Invalid Token");
            return;
        }

        // Token is valid, proceed to next middleware
        await _next(context);
    }
}

public static class AntigravityMiddlewareExtensions
{
    public static IApplicationBuilder UseAntigravity(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<AntigravityMiddleware>();
    }
}
