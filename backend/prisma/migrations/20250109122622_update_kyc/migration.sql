-- AlterTable
ALTER TABLE "Kyc" ADD COLUMN     "email" VARCHAR(256),
ADD COLUMN     "gender" VARCHAR(10),
ADD COLUMN     "municipality" VARCHAR(30),
ADD COLUMN     "verificationCode" VARCHAR(6);
