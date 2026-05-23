import { z } from "zod";
import { createRouter, publicProcedure } from "./middleware";
import { getDb } from "./queries/connection";
import { colleges, courses } from "@db/schema";
import { inArray } from "drizzle-orm";

export const compareRouter = createRouter({
  getColleges: publicProcedure
    .input(
      z.object({
        ids: z.array(z.number()).min(2).max(4),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const collegeData = await db
        .select()
        .from(colleges)
        .where(inArray(colleges.id, input.ids));

      const collegeCourses = await db
        .select()
        .from(courses)
        .where(inArray(courses.collegeId, input.ids));

      return collegeData.map((college) => ({
        ...college,
        courses: collegeCourses.filter((c) => c.collegeId === college.id),
      }));
    }),

  getWinner: publicProcedure
    .input(
      z.object({
        ids: z.array(z.number()).min(2).max(4),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const collegeData = await db
        .select()
        .from(colleges)
        .where(inArray(colleges.id, input.ids));

      if (collegeData.length === 0) return null;

      // Score each college: rating (25%), placement (25%), NIRF (20%, inverted), fees (15%, lower=better), courses (15%)
      const maxNirf = Math.max(...collegeData.map((c) => c.nirfRank || 999));
      const maxFees = Math.max(...collegeData.map((c) => c.feesMin || 0));
      const maxCourses = Math.max(...collegeData.map((c) => c.totalCourses || 0));

      const scored = collegeData.map((college) => {
        const ratingScore = (parseFloat(college.rating?.toString() || "0") / 5) * 25;
        const placementScore = ((college.placementPercentage || 0) / 100) * 25;
        const nirfScore = ((maxNirf - (college.nirfRank || maxNirf)) / maxNirf) * 20;
        const feesScore = (1 - ((college.feesMin || 0) / (maxFees || 1))) * 15;
        const coursesScore = ((college.totalCourses || 0) / (maxCourses || 1)) * 15;

        const totalScore = ratingScore + placementScore + nirfScore + feesScore + coursesScore;

        return {
          collegeId: college.id,
          name: college.name,
          score: Math.round(totalScore * 10) / 10,
        };
      });

      scored.sort((a, b) => b.score - a.score);

      return {
        winnerId: scored[0].collegeId,
        winnerName: scored[0].name,
        scores: scored,
      };
    }),
});
