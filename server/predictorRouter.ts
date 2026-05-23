import { z } from "zod";
import { createRouter, publicProcedure } from "./middleware";
import { getDb } from "./queries/connection";
import { predictorMappings, colleges } from "@db/schema";
import { and, eq, lte, gte, inArray } from "drizzle-orm";

export const predictorRouter = createRouter({
  predict: publicProcedure
    .input(
      z.object({
        exam: z.enum(["JEE Main", "NEET", "CAT", "GATE", "BITSAT", "MHT CET"]),
        rank: z.number().min(1),
        category: z.enum(["General", "OBC", "SC", "ST", "EWS"]),
        state: z.string().optional(),
        courseType: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();

      // Find predictor mappings matching exam, category, and rank range
      const mappings = await db
        .select()
        .from(predictorMappings)
        .where(
          and(
            eq(predictorMappings.examName, input.exam),
            eq(predictorMappings.category, input.category),
            lte(predictorMappings.rankMin, input.rank),
            gte(predictorMappings.rankMax, input.rank)
          )
        );

      if (mappings.length === 0) {
        return {
          predictions: [],
          total: 0,
          input: { exam: input.exam, rank: input.rank, category: input.category },
        };
      }

      // Get college details for the matched mappings
      const collegeIds = [...new Set(mappings.map((m) => m.collegeId))];
      const collegeData = await db
        .select()
        .from(colleges)
        .where(inArray(colleges.id, collegeIds));

      // Build predictions with match scores
      let predictions = mappings.map((mapping) => {
        const college = collegeData.find((c) => c.id === mapping.collegeId);
        if (!college) return null;

        let matchScore = mapping.matchScore;

        // Boost score for state preference match
        if (input.state && college.state.toLowerCase().includes(input.state.toLowerCase())) {
          matchScore = Math.min(100, matchScore + 20);
        }

        // Determine chances
        let chances: "high" | "medium" | "low";
        if (matchScore >= 85) chances = "high";
        else if (matchScore >= 60) chances = "medium";
        else chances = "low";

        return {
          collegeId: college.id,
          collegeName: college.name,
          collegeSlug: college.slug,
          location: college.location,
          courseName: mapping.courseName || "General",
          matchScore,
          chances,
          closingRank: mapping.closingRank,
          feesMin: college.feesMin,
          rating: parseFloat(college.rating?.toString() || "0"),
        };
      }).filter(Boolean);

      // Sort by match score descending
      predictions.sort((a, b) => (b?.matchScore || 0) - (a?.matchScore || 0));

      // Take top 20
      predictions = predictions.slice(0, 20);

      return {
        predictions,
        total: predictions.length,
        input: { exam: input.exam, rank: input.rank, category: input.category },
      };
    }),
});
