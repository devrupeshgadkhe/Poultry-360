using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PoultryERP.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddedCostColumntoVaccination1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Cost",
                table: "Vaccinations",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "FullName", "PasswordHash", "Role" },
                values: new object[] { new DateTime(2026, 3, 15, 11, 19, 12, 723, DateTimeKind.Utc).AddTicks(1507), "", "AQAAAAEAACcQAAAAEJ6f1...", "Staff" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cost",
                table: "Vaccinations");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "FullName", "PasswordHash", "Role" },
                values: new object[] { new DateTime(2026, 3, 15, 8, 27, 40, 249, DateTimeKind.Utc).AddTicks(5582), "System Administrator", "AQAAAAEAACcQAAAAE...", "Admin" });
        }
    }
}
