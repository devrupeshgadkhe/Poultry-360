using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PoultryERP.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class updateFoodFormationEntities1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_FoodFormationItems_InventoryItemId",
                table: "FoodFormationItems",
                column: "InventoryItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_FoodFormationItems_Inventory_InventoryItemId",
                table: "FoodFormationItems",
                column: "InventoryItemId",
                principalTable: "Inventory",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FoodFormationItems_Inventory_InventoryItemId",
                table: "FoodFormationItems");

            migrationBuilder.DropIndex(
                name: "IX_FoodFormationItems_InventoryItemId",
                table: "FoodFormationItems");
        }
    }
}
