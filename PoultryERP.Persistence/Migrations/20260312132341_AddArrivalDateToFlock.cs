using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PoultryERP.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddArrivalDateToFlock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Flocks",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "Flocks",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Flocks",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "PurchasePrice",
                table: "Flocks",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDate",
                table: "Flocks",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 12, 13, 23, 41, 180, DateTimeKind.Utc).AddTicks(7620));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "Flocks");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Flocks");

            migrationBuilder.DropColumn(
                name: "PurchasePrice",
                table: "Flocks");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "Flocks");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Flocks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 12, 8, 57, 59, 368, DateTimeKind.Utc).AddTicks(3396));
        }
    }
}
