import { relations } from "drizzle-orm";
import { colleges, courses, reviews, predictorMappings } from "./schema";

export const collegesRelations = relations(colleges, ({ many }) => ({
  courses: many(courses),
  reviews: many(reviews),
  predictorMappings: many(predictorMappings),
}));

export const coursesRelations = relations(courses, ({ one }) => ({
  college: one(colleges, {
    fields: [courses.collegeId],
    references: [colleges.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  college: one(colleges, {
    fields: [reviews.collegeId],
    references: [colleges.id],
  }),
}));

export const predictorMappingsRelations = relations(predictorMappings, ({ one }) => ({
  college: one(colleges, {
    fields: [predictorMappings.collegeId],
    references: [colleges.id],
  }),
}));
