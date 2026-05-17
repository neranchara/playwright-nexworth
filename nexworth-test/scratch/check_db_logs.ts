import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLogs() {
  console.log('--- Database Integrity Check: ImpersonationLog ---');
  
  const allLogs = await prisma.impersonationLog.findMany({
    include: {
      impersonator: { select: { email: true } }
    }
  });

  console.log(`Total Logs found: ${allLogs.length}`);
  
  allLogs.forEach(log => {
    console.log(`- ID: ${log.id}`);
    console.log(`  Impersonator: ${log.impersonator?.email || 'NOT FOUND'} (ID: ${log.impersonatorId})`);
    console.log(`  Target User ID: ${log.targetUserId}`);
    console.log(`  Ref: ${log.ticketReference}`);
    console.log(`  Started: ${log.startedAt}`);
    console.log('-------------------');
  });

  const testUser = await prisma.user.findUnique({ where: { email: 'test@nexworth.net' } });
  console.log(`Test User (test@nexworth.net) ID: ${testUser?.id}`);
  
  const testAdmin = await prisma.user.findUnique({ where: { email: 'test-admin@nexworth.net' } });
  console.log(`Test Admin (test-admin@nexworth.net) ID: ${testAdmin?.id}`);

  await prisma.$disconnect();
}

checkLogs();
