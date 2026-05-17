import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:nop@ssw0rd@localhost:5432/stg_nexworth_db?schema=public"
    }
  }
});

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: 'test@nexworth.net' },
        { email: 'test@nexworth.net' }
      ]
    }
  });
  console.log('User found:', user);
  await prisma.$disconnect();
}

main();
