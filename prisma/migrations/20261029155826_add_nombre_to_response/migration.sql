/*
  Warnings:

  - Added the required column `nombre` to the `Response` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "nombre" VARCHAR(255) NOT NULL;
