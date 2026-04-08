/* eslint-disable @typescript-eslint/no-explicit-any */
// PrismaClient will be available after `npx prisma generate` is run.
// This pattern prevents build failures before generation.
let prisma: any = null

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require('@prisma/client')
  const globalPrisma = globalThis as Record<string, unknown> & { prismaGlobal?: unknown }
  if (!globalPrisma.prismaGlobal) {
    globalPrisma.prismaGlobal = new PrismaClient()
  }
  prisma = globalPrisma.prismaGlobal
} catch {
  console.warn('[CineVerse] Prisma client not yet generated — run `npx prisma generate` to enable DB features.')
}

export default prisma
