import prisma from '@/lib/prisma';

/**
 * Generates the next sequential unique return reference: RET-YYYY-XXXX
 * e.g. RET-2026-0001
 */
export async function generateReturnReference() {
  const currentYear = new Date().getFullYear();
  const prefix = `RET-${currentYear}-`;

  try {
    // Find highest existing reference for the current year
    const latestRequest = await prisma.returnRequest.findFirst({
      where: {
        reference: {
          startsWith: prefix,
        },
      },
      orderBy: {
        reference: 'desc',
      },
      select: {
        reference: true,
      },
    });

    if (!latestRequest || !latestRequest.reference) {
      return `${prefix}0001`;
    }

    const currentNumberPart = latestRequest.reference.replace(prefix, '');
    const currentNum = parseInt(currentNumberPart, 10);

    if (isNaN(currentNum)) {
      // Fallback
      const count = await prisma.returnRequest.count();
      return `${prefix}${String(count + 1).padStart(4, '0')}`;
    }

    const nextNum = currentNum + 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  } catch (error) {
    // Robust fallback if database count query fails
    const timestampSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${timestampSuffix}`;
  }
}

