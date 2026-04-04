namespace PoultryERP.Domain.Entities
{
    public class FoodFormationItem
    {
        public int Id { get; set; }
        public int FoodFormationId { get; set; }

        // FoodFormation सोबतचे नाते
        public virtual FoodFormation? FoodFormation { get; set; }

        public int InventoryItemId { get; set; }

        // InventoryItem सोबतचे नाते (नवीन जोडले)
        public virtual InventoryItem? InventoryItem { get; set; }

        public decimal Percentage { get; set; }
    }
}