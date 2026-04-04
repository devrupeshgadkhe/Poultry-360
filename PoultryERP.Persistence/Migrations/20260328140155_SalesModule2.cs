using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PoultryERP.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SalesModule2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "EggInventories",
                keyColumn: "Id",
                keyValue: 1,
                column: "LastUpdated",
                value: new DateTime(2026, 3, 28, 19, 31, 54, 657, DateTimeKind.Local).AddTicks(9231));

            migrationBuilder.UpdateData(
                table: "EggInventories",
                keyColumn: "Id",
                keyValue: 2,
                column: "LastUpdated",
                value: new DateTime(2026, 3, 28, 19, 31, 54, 657, DateTimeKind.Local).AddTicks(9233));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
    }
}
