import { z } from "zod";
import { createRouter, publicProcedure } from "./middleware";
import { getDb } from "./queries/connection";
import { colleges, courses } from "@db/schema";
import { eq, and, like, gte, lte, inArray, sql, asc, desc } from "drizzle-orm";

export const collegeRouter = createRouter({
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        location: z.array(z.string()).optional(),
        courseType: z.array(z.string()).optional(),
        feesMin: z.number().optional(),
        feesMax: z.number().optional(),
        rating: z.number().optional(),
        ownership: z.array(z.enum(["government", "private", "deemed"])).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(24),
        sortBy: z.enum(["relevance", "rating", "fees_asc", "fees_desc", "placement"]).default("relevance"),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input.search) {
        conditions.push(like(colleges.name, `%${input.search}%`));
      }
      if (input.location && input.location.length > 0) {
        conditions.push(inArray(colleges.state, input.location));
      }
      if (input.ownership && input.ownership.length > 0) {
        conditions.push(inArray(colleges.ownership, input.ownership));
      }
      if (input.feesMin !== undefined) {
        conditions.push(gte(colleges.feesMin, input.feesMin));
      }
      if (input.feesMax !== undefined) {
        conditions.push(lte(colleges.feesMax, input.feesMax));
      }
      if (input.rating !== undefined) {
        conditions.push(gte(colleges.rating, input.rating.toString()));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(colleges)
        .where(whereClause);
      const total = Number(countResult[0]?.count || 0);

      // Build order by
      let orderBy;
      switch (input.sortBy) {
        case "rating":
          orderBy = desc(colleges.rating);
          break;
        case "fees_asc":
          orderBy = asc(colleges.feesMin);
          break;
        case "fees_desc":
          orderBy = desc(colleges.feesMin);
          break;
        case "placement":
          orderBy = desc(colleges.placementPercentage);
          break;
        default:
          orderBy = desc(colleges.rating);
      }

      const offset = (input.page - 1) * input.limit;

      const result = await db
        .select()
        .from(colleges)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(input.limit)
        .offset(offset);

      return {
        colleges: result,
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const college = await db
        .select()
        .from(colleges)
        .where(eq(colleges.slug, input.slug))
        .limit(1);

      if (!college[0]) return null;

      const collegeCourses = await db
        .select()
        .from(courses)
        .where(eq(courses.collegeId, college[0].id));

      // Get similar colleges (same state or similar rating)
      const similar = await db
        .select()
        .from(colleges)
        .where(
          and(
            eq(colleges.state, college[0].state),
            sql`${colleges.id} != ${college[0].id}`
          )
        )
        .orderBy(desc(colleges.rating))
        .limit(4);

      return {
        ...college[0],
        courses: collegeCourses,
        similarColleges: similar,
      };
    }),

  getPopular: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(8),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(colleges)
        .orderBy(desc(colleges.rating), desc(colleges.placementPercentage))
        .limit(input.limit);
    }),

  getSimilar: publicProcedure
    .input(
      z.object({
        collegeId: z.number(),
        limit: z.number().default(4),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const college = await db
        .select()
        .from(colleges)
        .where(eq(colleges.id, input.collegeId))
        .limit(1);

      if (!college[0]) return [];

      return db
        .select()
        .from(colleges)
        .where(
          and(
            eq(colleges.state, college[0].state),
            sql`${colleges.id} != ${input.collegeId}`
          )
        )
        .orderBy(desc(colleges.rating))
        .limit(input.limit);
    }),

  getLocations: publicProcedure.query(async () => {
    const db = getDb();
    const result = await db
      .select({
        state: colleges.state,
        count: sql<number>`count(*)`,
      })
      .from(colleges)
      .groupBy(colleges.state)
      .orderBy(sql`count(*) DESC`);
    return result;
  }),
});
