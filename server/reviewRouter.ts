import { z } from "zod";
import { createRouter, publicProcedure } from "./middleware";
import { getDb } from "./queries/connection";
import { reviews } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const reviewRouter = createRouter({
  listByCollege: publicProcedure
    .input(
      z.object({
        collegeId: z.number(),
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const offset = (input.page - 1) * input.limit;

      const allReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.collegeId, input.collegeId))
        .orderBy(desc(reviews.createdAt));

      const total = allReviews.length;
      const paginatedReviews = allReviews.slice(offset, offset + input.limit);

      // Calculate avg rating and breakdown
      const avgRating =
        allReviews.length > 0
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
          : 0;

      const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (const r of allReviews) {
        ratingBreakdown[r.rating] = (ratingBreakdown[r.rating] || 0) + 1;
      }

      return {
        reviews: paginatedReviews,
        total,
        avgRating: Math.round(avgRating * 10) / 10,
        ratingBreakdown,
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        collegeId: z.number(),
        reviewerName: z.string().min(1).max(100),
        courseName: z.string().optional(),
        rating: z.number().min(1).max(5),
        comment: z.string().min(10).max(2000),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(reviews).values({
        collegeId: input.collegeId,
        reviewerName: input.reviewerName,
        courseName: input.courseName || null,
        rating: input.rating,
        comment: input.comment,
        helpful: 0,
        notHelpful: 0,
      });
      return { success: true };
    }),
});
