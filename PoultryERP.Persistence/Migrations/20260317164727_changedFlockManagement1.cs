using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PoultryERP.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class changedFlockManagement1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PurchasePrice",
                table: "Flocks",
                newName: "TotalPurchasePrice");

            migrationBuilder.AlterColumn<decimal>(
                name: "Percentage",
                table: "FoodFormationItems",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)");

            migrationBuilder.AddColumn<decimal>(
                name: "DailyBirdCost",
                table: "DailyLogs",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "FeedCost",
                table: "DailyLogs",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "FeedItemId",
                table: "DailyLogs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 17, 16, 47, 26, 715, DateTimeKind.Utc).AddTicks(2273));

            migrationBuilder.CreateIndex(
                name: "IX_DailyLogs_FeedItemId",
                table: "DailyLogs",
                column: "FeedItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_DailyLogs_Inventory_FeedItemId",
                table: "DailyLogs",
                column: "FeedItemId",
                principalTable: "Inventory",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DailyLogs_Inventory_FeedItemId",
                table: "DailyLogs");

            migrationBuilder.DropIndex(
                name: "IX_DailyLogs_FeedItemId",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "DailyBirdCost",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "FeedCost",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "FeedItemId",
                table: "DailyLogs");

            migrationBuilder.RenameColumn(
                name: "TotalPurchasePrice",
                table: "Flocks",
                newName: "PurchasePrice");

            migrationBuilder.AlterColumn<decimal>(
                name: "Percentage",
                table: "FoodFormationItems",
                type: "decimal(5,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 17, 13, 39, 47, 798, DateTimeKind.Utc).AddTicks(267));
        }
    }
}
