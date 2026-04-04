using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PoultryERP.Domain.Entities
{
    public class DailyLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int FlockId { get; set; }

        [Required]
        public DateTime Date { get; set; } = DateTime.Now;

        public int MortalityCount { get; set; }

        // नवीन फील्ड: मृत्यूचे कारण
        [MaxLength(200)]
        public string? MortalityReason { get; set; }

        // Feed Tracking (तुमचे मूळ कॉलम्स)
        [Required]
        public int FeedItemId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal FeedConsumedKg { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal FeedCost { get; set; }

        // Egg Production Logic (तुमचे मूळ कॉलम्स)
        public int EggsCollected { get; set; }

        // नवीन फील्ड: खराब झालेली अंडी
        public int DamagedEggsCollected { get; set; }

        // Logic: 1 Tray = 30 Eggs (UI साठी - तुमचे मूळ लॉजिक)
        [NotMapped]
        public decimal TotalTrays => (decimal)EggsCollected / 30;

        [Column(TypeName = "decimal(18,2)")]
        public decimal AverageBirdWeightGm { get; set; }

        // Financial Metric (तुमचा मूळ कॉलम)
        [Column(TypeName = "decimal(18,2)")]
        public decimal DailyBirdCost { get; set; }

        public string? Notes { get; set; }

        [ForeignKey("FlockId")]
        public virtual Flock? Flock { get; set; }

        [ForeignKey("FeedItemId")]
        public virtual InventoryItem? FeedItem { get; set; }
    }
}