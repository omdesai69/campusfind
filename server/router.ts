import { createRouter, publicProcedure } from "./middleware";
import { collegeRouter } from "./collegeRouter";
import { courseRouter } from "./courseRouter";
import { reviewRouter } from "./reviewRouter";
import { compareRouter } from "./compareRouter";
import { predictorRouter } from "./predictorRouter";

export const appRouter = createRouter({
  ping: publicProcedure.query(() => ({ ok: true, ts: Date.now() })),
  college: collegeRouter,
  course: courseRouter,
  review: reviewRouter,
  compare: compareRouter,
  predictor: predictorRouter,
});

export type AppRouter = typeof appRouter;
