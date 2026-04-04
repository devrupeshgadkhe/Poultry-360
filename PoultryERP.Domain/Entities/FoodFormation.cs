using System;
using System.Collections.Generic;

namespace PoultryERP.Domain.Entities
{
    public class FoodFormation
    {
        public int Id { get; set; }

        // Nullable warnings फिक्स करण्यासाठी Default values दिल्या आहेत [cite: 2026-03-12]
        public string Name { get; set; } = string.Empty;

        public decimal TargetQuantity { get; set; }

        public string Unit { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public bool IsActive { get; set; } = true;

        public virtual ICollection<FoodFormationItem> FormationItems { get; set; } = new List<FoodFormationItem>();
    }
}