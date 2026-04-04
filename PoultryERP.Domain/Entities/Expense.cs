namespace PoultryERP.Domain.Entities;

public class Expense
{
    public int Id { get; set; }
    public string Category { get; set; } = string.Empty; // Feed, Medicine, Utility, Salary, etc.
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public int? FlockId { get; set; } // Optional: Link to a specific flock
}
