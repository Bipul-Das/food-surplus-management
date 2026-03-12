// server/prisma/seed.ts

// 1. FORCE ENV VARS TO LOAD BEFORE ANYTHING ELSE
import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("CRITICAL ERROR: DATABASE_URL is missing or undefined.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  console.log('Sweeping legacy data...');
  // Force TypeScript to ignore its cached types for these cleanup commands
  // @ts-ignore
  await prisma.pledgeItem.deleteMany();
  // @ts-ignore
  await prisma.pledge.deleteMany();
  // @ts-ignore
  await prisma.requestItem.deleteMany();
  // @ts-ignore
  await prisma.foodRequest.deleteMany();
  // @ts-ignore
  await prisma.surplusInventory.deleteMany();

  const categories = [
    { name: 'rice', unit: 'kg' },
    { name: 'chicken', unit: 'kg' },
    { name: 'mutton', unit: 'kg' },
    { name: 'beef', unit: 'kg' },
    { name: 'fish', unit: 'kg' },
    { name: 'milk', unit: 'Liters' },
    { name: 'cooking oil', unit: 'Liters' },
    { name: 'bread', unit: 'Loaves' },
    { name: 'canned beans', unit: 'Cans' },
    { name: 'vegetables', unit: 'kg' },
    { name: 'fruits', unit: 'kg' },
  ];

  console.log('Loading Food Categories...');
  for (const cat of categories) {
    await prisma.foodCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name, unit: cat.unit },
    });
  }

  console.log('Provisioning LEAD_DEV identity...');
  
  const email = 'bipul2@dev.com';
  const plainTextPassword = 'admin123'; 
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(plainTextPassword, salt);

  const leadDev = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      role: 'LEAD_DEV',
      name: 'Bipul Das',
      phone: '+8801700000000',
      address: 'Computer Science Department',
      city: 'Dhaka',
      organization: 'FoodSurplus Core Engineering',
    },
  });

  console.log('\n✅ Database successfully seeded!');
  console.log('====================================');
  console.log('🔐 LEAD DEV CREDENTIALS:');
  console.log(`Email:    ${leadDev.email}`);
  console.log(`Password: ${plainTextPassword}`);
  console.log('====================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });