import { z } from "zod";
import { createRouter, publicProcedure } from "./middleware";
import { getDb } from "./queries/connection";
import { courses } from "@db/schema";
import { eq, asc } from "drizzle-orm";

export const courseRouter = createRouter({
  listByCollege: publicProcedure
    .input(z.object({ collegeId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(courses)
        .where(eq(courses.collegeId, input.collegeId))
        .orderBy(asc(courses.fees));
    }),
});
