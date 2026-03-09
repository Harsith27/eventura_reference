const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateEventCodes() {
  try {
    const events = await prisma.event.findMany({
      select: {
        id: true,
        eventCode: true,
        title: true,
      },
    });

    console.log(`\nUpdating ${events.length} event(s) to 8-character codes...`);
    
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    
    for (const event of events) {
      // Generate 8-character code
      let newCode = '';
      for (let i = 0; i < 8; i++) {
        newCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Check if unique
      const existing = await prisma.event.findUnique({
        where: { eventCode: newCode },
      });
      
      if (!existing) {
        await prisma.event.update({
          where: { id: event.id },
          data: { eventCode: newCode },
        });
        console.log(`✓ Updated "${event.title}": ${event.eventCode} → ${newCode}`);
      }
    }
    
    console.log('\n✓ All event codes updated!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateEventCodes();
