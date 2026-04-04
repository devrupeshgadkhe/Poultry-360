using System;
using System.ComponentModel.DataAnnotations;

namespace PoultryERP.Domain.Entities
{
    public class EggInventory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string EggType { get; set; } = "Good"; // Good, Damaged इ.

        [Required]
        public int CurrentStock { get; set; } = 0;

        public DateTime LastUpdated { get; set; } = DateTime.Now;
    }
}