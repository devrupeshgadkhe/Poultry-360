# Backend API Consumability Guide

To make your .NET Core APIs more easily consumable by the React frontend, consider the following improvements:

## 1. Consistent Response Wrapper
Instead of returning raw data, use a consistent response model. This makes it easier for the frontend to handle success and error states uniformly.

```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public T Data { get; set; }
}
```

## 2. JSON Naming Conventions
Ensure the API returns `camelCase` properties, which is the standard in JavaScript/React. This is usually the default in ASP.NET Core, but you can explicitly configure it in `Program.cs`:

```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });
```

## 3. Global Exception Handling
Implement a global exception filter or middleware to catch unhandled exceptions and return a consistent JSON error response instead of HTML error pages.

## 4. Use DTOs (Data Transfer Objects)
Avoid returning your Database Entities directly. Use DTOs to shape the data exactly as the UI needs it. This also prevents sensitive data from being exposed.

## 5. Standard HTTP Status Codes
- `200 OK`: Success with data.
- `201 Created`: Successfully created a resource.
- `204 No Content`: Success without data (e.g., Delete).
- `400 Bad Request`: Validation errors.
- `401 Unauthorized`: Authentication required.
- `403 Forbidden`: Insufficient permissions.
- `404 Not Found`: Resource doesn't exist.

## 6. CORS Policy
Your current policy is `AllowAll`, which is great for development. For production, restrict it to your frontend's domain.

## 7. Swagger/OpenAPI
Keep Swagger enabled in development. It serves as live documentation that the frontend team can use to test endpoints without writing code.
