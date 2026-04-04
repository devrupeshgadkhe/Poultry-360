using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PoultryERP.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class nbjbbbjb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FoodFormationId",
                table: "Inventory",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsFinishedGood",
                table: "Inventory",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 17, 13, 39, 47, 798, DateTimeKind.Utc).AddTicks(267));

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_FoodFormationId",
                table: "Inventory",
                column: "FoodFormationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Inventory_FoodFormations_FoodFormationId",
                table: "Inventory",
                column: "FoodFormationId",
                principalTable: "FoodFormations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inventory_FoodFormations_FoodFormationId",
                table: "Inventory");

            migrationBuilder.DropIndex(
                name: "IX_Inventory_FoodFormationId",
                table: "Inventory");

            migrationBuilder.DropColumn(
                name: "FoodFormationId",
                table: "Inventory");

            migrationBuilder.DropColumn(
                name: "IsFinishedGood",
                table: "Inventory");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 17, 11, 48, 29, 193, DateTimeKind.Utc).AddTicks(2166));
        }
    }
}
