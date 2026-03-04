// server/prisma/seed.ts

import { PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// 1. Configure the connection pool (Prisma 7 Requirement)
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 2. Initialize Prisma with the adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Clean existing data
  await prisma.allocation.deleteMany();
  await prisma.requestItem.deleteMany();
  await prisma.surplusInventory.deleteMany();
  await prisma.foodRequest.deleteMany();
  await prisma.message.deleteMany();
  await prisma.logbook.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.user.deleteMany();
  await prisma.foodCategory.deleteMany();

  console.log('🧹 Database cleaned.');

  // 2. Create Canonical Food Categories
  const categories = [
    { name: 'Rice', unit: 'kg' },
    { name: 'Chicken', unit: 'kg' },
    { name: 'Fish', unit: 'kg' },
    { name: 'Beef', unit: 'kg' },
    { name: 'Lentils', unit: 'kg' },
    { name: 'Vegetables', unit: 'kg' },
    { name: 'Milk', unit: 'liter' },
    { name: 'Water', unit: 'liter' },
    { name: 'Bread', unit: 'pieces' },
    { name: 'Eggs', unit: 'pieces' },
  ];

  for (const cat of categories) {
    await prisma.foodCategory.create({
      data: cat,
    });
  }
  console.log(`✅ Created ${categories.length} Food Categories.`);

  // 3. Inject Lead Developer (God Mode)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('DevPass123!', salt);

  const leadDev = await prisma.user.create({
    data: {
      name: 'Lead Developer',
      email: 'dev@project.com',
      passwordHash: hashedPassword,
      role: Role.LEAD_DEV,
      phone: '000-000-0000',
      address: 'Server Room 1',
      city: 'Dhaka',
      badges: ['TITANIUM'],
      totalWeight: 99999,
      totalVolume: 99999,
      totalUnits: 99999,
    },
  });

  console.log(`👑 God Mode User Created: ${leadDev.email}`);
  console.log('🚀 Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });