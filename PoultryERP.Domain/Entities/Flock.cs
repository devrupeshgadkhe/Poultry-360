using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PoultryERP.Domain.Entities
{
    public class Flock
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Breed { get; set; } = string.Empty;

        [Required]
        public int InitialCount { get; set; }

        public int CurrentCount { get; set; }

        // StartDate Required आहे म्हणून ArrivalDate ची व्हॅल्यू इथे वापरू
        [Required]
        public DateTime StartDate { get; set; }

        public DateTime ArrivalDate { get; set; }

        public DateTime? EndDate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPurchasePrice { get; set; }

        // आता हा प्रत्यक्ष कॉलम असेल जो DB मध्ये सेव्ह होईल
        [Column(TypeName = "decimal(18,2)")]
        public decimal PerBirdPurchasePrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalFeedCost { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalVaccineCost { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public string? Status { get; set; }
        public string? Notes { get; set; }
    }
}