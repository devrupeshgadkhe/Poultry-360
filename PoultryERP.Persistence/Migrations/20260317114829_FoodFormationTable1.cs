using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PoultryERP.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FoodFormationTable1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FoodFormations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TargetQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoodFormations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FoodFormationItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FoodFormationId = table.Column<int>(type: "int", nullable: false),
                    InventoryItemId = table.Column<int>(type: "int", nullable: false),
                    Percentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoodFormationItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FoodFormationItems_FoodFormations_FoodFormationId",
                        column: x => x.FoodFormationId,
                        principalTable: "FoodFormations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FoodFormationItems_Inventory_InventoryItemId",
                        column: x => x.InventoryItemId,
                        principalTable: "Inventory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 17, 11, 48, 29, 193, DateTimeKind.Utc).AddTicks(2166));

            migrationBuilder.CreateIndex(
                name: "IX_FoodFormationItems_FoodFormationId",
                table: "FoodFormationItems",
                column: "FoodFormationId");

            migrationBuilder.CreateIndex(
                name: "IX_FoodFormationItems_InventoryItemId",
                table: "FoodFormationItems",
                column: "InventoryItemId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FoodFormationItems");

            migrationBuilder.DropTable(
                name: "FoodFormations");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 15, 20, 39, 33, 191, DateTimeKind.Utc).AddTicks(4728));
        }
    }
}
