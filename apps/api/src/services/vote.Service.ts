import type { VoteRequest } from '@repo/shared'
import { getDb } from '../db/client'
import { ratings, users } from '../db/schema'
import { eq, count } from 'drizzle-orm'

export const submitVote = async (
  db: D1Database,
  userId: string,
  vote: VoteRequest
) => {
  const { stallId, rating } = vote
  const ormDb = getDb(db)

  try {
    // 1. Ensure the user exists in our local 'users' table
    await ormDb.insert(users).values({ id: userId }).onConflictDoNothing()

    // 2. Now proceed with the vote
    await ormDb.insert(ratings).values({ userId, stallId, rating })
  } catch (e: any) {
    if (e.message && e.message.includes('UNIQUE constraint failed')) {
      throw new Error('Already voted')
    }
    console.error('Database insertion error:', e)
    throw new Error('Internal Server Error')
  }

  try {
    const countResult = await ormDb
      .select({ count: count() })
      .from(ratings)
      .where(eq(ratings.userId, userId))

    const progressCount = countResult[0]?.count || 1

    if (progressCount >= 15) {
      await ormDb
        .update(users)
        .set({ isCompleted: true })
        .where(eq(users.id, userId))
    }

    return progressCount
  } catch (e: any) {
    console.error('Database query/update error:', e)
    throw new Error('Internal Server Error')
  }
}
