namespace PoultryERP.Domain.Entities;

public class EggProduction
{
    public int Id { get; set; }
    public int FlockId { get; set; }
    // Standardizing to 'Date' to fix the Repository error
    public DateTime Date { get; set; } = DateTime.Now;
    public int Count { get; set; }

    public int DamagedEggCount { get; set; }
    public virtual Flock? Flock { get; set; }
}