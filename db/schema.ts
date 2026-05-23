import {
  pgTable,
  pgEnum,
  integer,
  varchar,
  text,
  timestamp,
  numeric,
  json,
  index,
} from "drizzle-orm/pg-core";

export const ownershipEnum = pgEnum("ownership", ["government", "private", "deemed"]);

export const colleges = pgTable(
  "colleges",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    established: integer("established"),
    ownership: ownershipEnum("ownership").notNull(),
    nirfRank: integer("nirf_rank"),
    rating: numeric("rating", { precision: 2, scale: 1 }).notNull().default("0.0"),
    feesMin: integer("fees_min").notNull(),
    feesMax: integer("fees_max").notNull(),
    placementPercentage: integer("placement_percentage"),
    avgPackage: integer("avg_package"),
    highestPackage: integer("highest_package"),
    campusSize: varchar("campus_size", { length: 50 }),
    totalStudents: integer("total_students"),
    totalFaculty: integer("total_faculty"),
    totalCourses: integer("total_courses").notNull().default(0),
    website: varchar("website", { length: 255 }),
    description: text("description"),
    imageUrl: varchar("image_url", { length: 500 }),
    logoUrl: varchar("logo_url", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("colleges_slug_idx").on(table.slug),
    index("colleges_state_idx").on(table.state),
    index("colleges_rating_idx").on(table.rating),
    index("colleges_fees_min_idx").on(table.feesMin),
    index("colleges_ownership_idx").on(table.ownership),
  ]
);

export const courses = pgTable(
  "courses",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    collegeId: integer("college_id")
      .notNull()
      .references(() => colleges.id),
    name: varchar("name", { length: 255 }).notNull(),
    duration: varchar("duration", { length: 50 }).notNull(),
    fees: integer("fees").notNull(),
    eligibility: varchar("eligibility", { length: 500 }),
    degreeType: varchar("degree_type", { length: 100 }).notNull(),
    seatIntake: integer("seat_intake"),
  },
  (table) => [
    index("courses_college_idx").on(table.collegeId),
    index("courses_degree_type_idx").on(table.degreeType),
  ]
);

export const reviews = pgTable(
  "reviews",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    collegeId: integer("college_id")
      .notNull()
      .references(() => colleges.id),
    reviewerName: varchar("reviewer_name", { length: 255 }).notNull(),
    courseName: varchar("course_name", { length: 255 }),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull(),
    helpful: integer("helpful").notNull().default(0),
    notHelpful: integer("not_helpful").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("reviews_college_idx").on(table.collegeId),
  ]
);

export const predictorMappings = pgTable(
  "predictor_mappings",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    collegeId: integer("college_id")
      .notNull()
      .references(() => colleges.id),
    examName: varchar("exam_name", { length: 50 }).notNull(),
    category: varchar("category", { length: 20 }).notNull(),
    rankMin: integer("rank_min").notNull(),
    rankMax: integer("rank_max").notNull(),
    courseName: varchar("course_name", { length: 255 }),
    matchScore: integer("match_score").notNull().default(0),
    closingRank: integer("closing_rank"),
  },
  (table) => [
    index("predictor_exam_idx").on(table.examName),
    index("predictor_category_idx").on(table.category),
    index("predictor_rank_idx").on(table.rankMin, table.rankMax),
    index("predictor_college_idx").on(table.collegeId),
  ]
);

export const compareSessions = pgTable("compare_sessions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  collegeIds: json("college_ids").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Types
export type College = typeof colleges.$inferSelect;
export type InsertCollege = typeof colleges.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type PredictorMapping = typeof predictorMappings.$inferSelect;
export type CompareSession = typeof compareSessions.$inferSelect;

