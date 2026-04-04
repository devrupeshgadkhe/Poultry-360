namespace PoultryERP.Domain.Entities;

public class Vaccination
{
    public int Id { get; set; }
    public int FlockId { get; set; }
    public string VaccineName { get; set; } = string.Empty;
    public DateTime ScheduledDate { get; set; }
    public DateTime? AdministeredDate { get; set; }
    public string AdministeredBy { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string Status { get; set; } = "Scheduled";
    public decimal Cost { get; set; } // New Field: Tracking financial impact
}