using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PoultryERP.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EggInventory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FinancialTransactions_Flocks_BatchId",
                table: "FinancialTransactions");

            migrationBuilder.AddColumn<int>(
                name: "DamagedEggCount",
                table: "Production",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DamagedEggsCollected",
                table: "DailyLogs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "MortalityReason",
                table: "DailyLogs",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EggInventories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EggType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CurrentStock = table.Column<int>(type: "int", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EggInventories", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "EggInventories",
                columns: new[] { "Id", "CurrentStock", "EggType", "LastUpdated" },
                values: new object[,]
                {
                    { 1, 0, "Good", new DateTime(2026, 3, 28, 17, 4, 31, 657, DateTimeKind.Local).AddTicks(1263) },
                    { 2, 0, "Damaged", new DateTime(2026, 3, 28, 17, 4, 31, 657, DateTimeKind.Local).AddTicks(1265) }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_FinancialTransactions_Flocks_BatchId",
                table: "FinancialTransactions",
                column: "BatchId",
                principalTable: "Flocks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FinancialTransactions_Flocks_BatchId",
                table: "FinancialTransactions");

            migrationBuilder.DropTable(
                name: "EggInventories");

            migrationBuilder.DropColumn(
                name: "DamagedEggCount",
                table: "Production");

            migrationBuilder.DropColumn(
                name: "DamagedEggsCollected",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "MortalityReason",
                table: "DailyLogs");

            migrationBuilder.AddForeignKey(
                name: "FK_FinancialTransactions_Flocks_BatchId",
                table: "FinancialTransactions",
                column: "BatchId",
                principalTable: "Flocks",
                principalColumn: "Id");
        }
    }
}
