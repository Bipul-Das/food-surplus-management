-- CreateEnum
CREATE TYPE "Role" AS ENUM ('LEAD_DEV', 'COORDINATOR', 'DONOR', 'RECEIVER', 'DELIVERY_MAN');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('ONGOING', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('NEW', 'VIEWED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "website" TEXT,
    "avatar" TEXT,
    "badges" TEXT[],
    "totalWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalUnits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "FoodCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurplusInventory" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "currentQuantity" DOUBLE PRECISION NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurplusInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodRequest" (
    "id" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "urgency" "Urgency" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'ONGOING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestItem" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "quantityNeeded" DOUBLE PRECISION NOT NULL,
    "quantityFulfilled" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "RequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Allocation" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "requestItemId" TEXT NOT NULL,
    "allocatedQuantity" DOUBLE PRECISION NOT NULL,
    "deliveryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Allocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "deliveryManId" TEXT,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "pickupAddress" TEXT NOT NULL,
    "dropAddress" TEXT NOT NULL,
    "pickupTime" TIMESTAMP(3),
    "deliveredTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Logbook" (
    "id" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lunchEstimated" INTEGER NOT NULL,
    "dinnerEstimated" INTEGER,
    "lunchServed" INTEGER,
    "dinnerServed" INTEGER,
    "isLunchComplete" BOOLEAN NOT NULL DEFAULT false,
    "isDinnerComplete" BOOLEAN NOT NULL DEFAULT false,
    "dailyShortage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Logbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FoodCategory_name_key" ON "FoodCategory"("name");

-- AddForeignKey
ALTER TABLE "SurplusInventory" ADD CONSTRAINT "SurplusInventory_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurplusInventory" ADD CONSTRAINT "SurplusInventory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FoodCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodRequest" ADD CONSTRAINT "FoodRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestItem" ADD CONSTRAINT "RequestItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "FoodRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestItem" ADD CONSTRAINT "RequestItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FoodCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "SurplusInventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_requestItemId_fkey" FOREIGN KEY ("requestItemId") REFERENCES "RequestItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_deliveryManId_fkey" FOREIGN KEY ("deliveryManId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logbook" ADD CONSTRAINT "Logbook_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
