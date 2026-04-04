using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PoultryERP.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SalesModule1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TransactionCategories",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "TransactionCategories",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.UpdateData(
                table: "EggInventories",
                keyColumn: "Id",
                keyValue: 1,
                column: "LastUpdated",
                value: new DateTime(2026, 3, 28, 19, 30, 21, 773, DateTimeKind.Local).AddTicks(1446));

            migrationBuilder.UpdateData(
                table: "EggInventories",
                keyColumn: "Id",
                keyValue: 2,
                column: "LastUpdated",
                value: new DateTime(2026, 3, 28, 19, 30, 21, 773, DateTimeKind.Local).AddTicks(1447));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
        }
    }
}
