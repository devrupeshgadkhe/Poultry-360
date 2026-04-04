using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PoultryERP.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SalesModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SaleItems_Flocks_FlockId",
                table: "SaleItems");

            migrationBuilder.DropForeignKey(
                name: "FK_SaleItems_Inventory_InventoryItemId",
                table: "SaleItems");

            migrationBuilder.AddColumn<int>(
                name: "PaymentMode",
                table: "Sales",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Sales",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "InventoryItemId",
                table: "SaleItems",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "EggInventoryId",
                table: "SaleItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ItemType",
                table: "SaleItems",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "EggInventories",
                keyColumn: "Id",
                keyValue: 1,
                column: "LastUpdated",
                value: new DateTime(2026, 3, 28, 19, 24, 13, 417, DateTimeKind.Local).AddTicks(3957));

            migrationBuilder.UpdateData(
                table: "EggInventories",
                keyColumn: "Id",
                keyValue: 2,
                column: "LastUpdated",
                value: new DateTime(2026, 3, 28, 19, 24, 13, 417, DateTimeKind.Local).AddTicks(3958));

            migrationBuilder.InsertData(
                table: "TransactionCategories",
                columns: new[] { "Id", "Description", "IsActive", "IsIncome", "Name" },
                values: new object[,]
                {
                    { 7, "Revenue from egg sales", true, true, "Egg Sales" },
                    { 8, "Revenue from flock/bird sales", true, true, "Bird Sales" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_SaleItems_EggInventoryId",
                table: "SaleItems",
                column: "EggInventoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_SaleItems_EggInventories_EggInventoryId",
                table: "SaleItems",
                column: "EggInventoryId",
                principalTable: "EggInventories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SaleItems_Flocks_FlockId",
                table: "SaleItems",
                column: "FlockId",
                principalTable: "Flocks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SaleItems_Inventory_InventoryItemId",
                table: "SaleItems",
                column: "InventoryItemId",
                principalTable: "Inventory",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SaleItems_EggInventories_EggInventoryId",
                table: "SaleItems");

            migrationBuilder.DropForeignKey(
                name: "FK_SaleItems_Flocks_FlockId",
                table: "SaleItems");

            migrationBuilder.DropForeignKey(
                name: "FK_SaleItems_Inventory_InventoryItemId",
                table: "SaleItems");

            migrationBuilder.DropIndex(
                name: "IX_SaleItems_EggInventoryId",
                table: "SaleItems");

            migrationBuilder.DeleteData(
                table: "TransactionCategories",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "TransactionCategories",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DropColumn(
                name: "PaymentMode",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "EggInventoryId",
                table: "SaleItems");

            migrationBuilder.DropColumn(
                name: "ItemType",
                table: "SaleItems");

            migrationBuilder.AlterColumn<int>(
                name: "InventoryItemId",
                table: "SaleItems",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "EggInventories",
                keyColumn: "Id",
                keyValue: 1,
                column: "LastUpdated",
                value: new DateTime(2026, 3, 28, 17, 4, 31, 657, DateTimeKind.Local).AddTicks(1263));

            migrationBuilder.UpdateData(
                table: "EggInventories",
                keyColumn: "Id",
                keyValue: 2,
                column: "LastUpdated",
                value: new DateTime(2026, 3, 28, 17, 4, 31, 657, DateTimeKind.Local).AddTicks(1265));

            migrationBuilder.AddForeignKey(
                name: "FK_SaleItems_Flocks_FlockId",
                table: "SaleItems",
                column: "FlockId",
                principalTable: "Flocks",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SaleItems_Inventory_InventoryItemId",
                table: "SaleItems",
                column: "InventoryItemId",
                principalTable: "Inventory",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
