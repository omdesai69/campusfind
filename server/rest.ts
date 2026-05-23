import { Hono } from "hono";
import { z } from "zod";
import { and, asc, desc, eq, gte, ilike, inArray, lte, sql, or } from "drizzle-orm";
import { getDb } from "./queries/connection";
import { colleges, courses, predictorMappings, reviews } from "@db/schema";

const restApi = new Hono();

const ownershipSchema = z.enum(["government", "private", "deemed"]);
const sortSchema = z.enum(["relevance", "rating", "fees_asc", "fees_desc", "placement"]);
const examSchema = z.enum(["JEE Main", "NEET", "CAT", "GATE", "BITSAT", "MHT CET"]);
const categorySchema = z.enum(["General", "OBC", "SC", "ST", "EWS"]);

const fallbackFeaturedColleges = [
  {
    slug: "iit-delhi",
    name: "Indian Institute of Technology Delhi",
    location: "New Delhi",
    state: "Delhi NCR",
    established: 1961,
    ownership: "government" as const,
    nirfRank: 2,
    rating: "4.8",
    feesMin: 220000,
    feesMax: 350000,
    placementPercentage: 98,
    avgPackage: 2500000,
    highestPackage: 20000000,
    campusSize: "325 acres",
    totalStudents: 8500,
    totalFaculty: 650,
    totalCourses: 12,
    website: "https://iitd.ac.in",
    description: "IIT Delhi is one of India's premier engineering institutes, known for research, placements, and strong technical programs.",
    imageUrl: "/colleges/iit-delhi.jpg",
  },
  {
    slug: "iit-bombay",
    name: "Indian Institute of Technology Bombay",
    location: "Mumbai",
    state: "Maharashtra",
    established: 1958,
    ownership: "government" as const,
    nirfRank: 3,
    rating: "4.8",
    feesMin: 230000,
    feesMax: 360000,
    placementPercentage: 97,
    avgPackage: 2800000,
    highestPackage: 22000000,
    campusSize: "550 acres",
    totalStudents: 10800,
    totalFaculty: 720,
    totalCourses: 15,
    website: "https://iitb.ac.in",
    description: "IIT Bombay is a top technical institute with deep industry links, strong placements, and a large research ecosystem.",
    imageUrl: "/colleges/iit-bombay.jpg",
  },
  {
    slug: "aiims-delhi",
    name: "All India Institute of Medical Sciences Delhi",
    location: "New Delhi",
    state: "Delhi NCR",
    established: 1956,
    ownership: "government" as const,
    nirfRank: 1,
    rating: "4.9",
    feesMin: 15000,
    feesMax: 25000,
    placementPercentage: 99,
    avgPackage: 1800000,
    highestPackage: 5000000,
    campusSize: "72 acres",
    totalStudents: 2800,
    totalFaculty: 750,
    totalCourses: 8,
    website: "https://aiims.edu",
    description: "AIIMS Delhi is India's flagship medical institution with exceptional clinical exposure and academic reputation.",
    imageUrl: "/colleges/aiims-delhi.jpg",
  },
  {
    slug: "iim-ahmedabad",
    name: "Indian Institute of Management Ahmedabad",
    location: "Ahmedabad",
    state: "Gujarat",
    established: 1961,
    ownership: "government" as const,
    nirfRank: 1,
    rating: "4.9",
    feesMin: 2400000,
    feesMax: 3300000,
    placementPercentage: 100,
    avgPackage: 3500000,
    highestPackage: 120000000,
    campusSize: "102 acres",
    totalStudents: 1200,
    totalFaculty: 110,
    totalCourses: 6,
    website: "https://iima.ac.in",
    description: "IIM Ahmedabad is a leading management school with globally recognized programs and excellent career outcomes.",
    imageUrl: "/colleges/iim-ahmedabad.jpg",
  },
];

const fallbackColleges = [...fallbackFeaturedColleges].map((college, index) => ({
  ...college,
  id: index + 1,
  logoUrl: null,
  createdAt: null,
}));

const fallbackCourses = [
  { name: "B.Tech Computer Science", duration: "4 Years", fees: 220000, eligibility: "Entrance Exam", degreeType: "B.Tech", seatIntake: 120 },
  { name: "B.Tech Electronics", duration: "4 Years", fees: 210000, eligibility: "Entrance Exam", degreeType: "B.Tech", seatIntake: 90 },
  { name: "MBA", duration: "2 Years", fees: 450000, eligibility: "Graduation + Aptitude Test", degreeType: "MBA", seatIntake: 80 },
  { name: "M.Tech Data Science", duration: "2 Years", fees: 180000, eligibility: "GATE / Institute Test", degreeType: "M.Tech", seatIntake: 60 },
];

function fallbackReviews(collegeId: number) {
  return [
    {
      id: collegeId * 10 + 1,
      collegeId,
      reviewerName: "Aarav Sharma",
      courseName: "B.Tech Computer Science",
      rating: 5,
      comment: "Strong placements, helpful faculty, and a practical curriculum. The college comparison data matched my research well.",
      helpful: 14,
      notHelpful: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: collegeId * 10 + 2,
      collegeId,
      reviewerName: "Meera Iyer",
      courseName: "MBA",
      rating: 4,
      comment: "Good academic environment and active clubs. Hostel and admin processes can improve, but overall it is a solid choice.",
      helpful: 8,
      notHelpful: 0,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

function filterFallbackColleges(params: {
  search?: string;
  location?: string[];
  ownership?: Array<"government" | "private" | "deemed">;
  page?: number;
  limit?: number;
  sortBy?: "relevance" | "rating" | "fees_asc" | "fees_desc" | "placement";
}) {
  let result = fallbackColleges;

  if (params.search) {
    const search = params.search.toLowerCase();
    result = result.filter((college) => college.name.toLowerCase().includes(search));
  }
  if (params.location?.length) {
    result = result.filter((college) => params.location?.includes(college.state));
  }
  if ((params as any).city?.length) {
    result = result.filter((college) => (params as any).city?.includes(college.location));
  }
  if (params.ownership?.length) {
    result = result.filter((college) => params.ownership?.includes(college.ownership));
  }

  result = [...result].sort((a, b) => {
    if (params.sortBy === "fees_asc") return a.feesMin - b.feesMin;
    if (params.sortBy === "fees_desc") return b.feesMin - a.feesMin;
    if (params.sortBy === "placement") return (b.placementPercentage || 0) - (a.placementPercentage || 0);
    return Number(b.rating) - Number(a.rating);
  });

  const page = params.page ?? 1;
  const limit = params.limit ?? 24;
  const start = (page - 1) * limit;

  return {
    colleges: result.slice(start, start + limit),
    total: result.length,
    page,
    totalPages: Math.ceil(result.length / limit),
  };
}

function compareFallback(ids: number[]) {
  return fallbackColleges
    .filter((college) => ids.includes(college.id))
    .map((college) => ({
      ...college,
      courses: fallbackCourses.map((course, index) => ({ ...course, id: college.id * 100 + index, collegeId: college.id })),
    }));
}

function winnerFallback(ids: number[]) {
  const selected = compareFallback(ids);
  if (!selected.length) return null;

  const maxFees = Math.max(...selected.map((college) => college.feesMin || 1));
  const maxCourses = Math.max(...selected.map((college) => college.totalCourses || 1));
  const scores = selected
    .map((college) => {
      const score =
        (Number(college.rating) / 5) * 30 +
        ((college.placementPercentage || 0) / 100) * 30 +
        (1 - (college.feesMin || 0) / maxFees) * 20 +
        ((college.totalCourses || 0) / maxCourses) * 20;
      return { collegeId: college.id, name: college.name, score: Math.round(score * 10) / 10 };
    })
    .sort((a, b) => b.score - a.score);

  return {
    winnerId: scores[0].collegeId,
    winnerName: scores[0].name,
    scores,
  };
}

function predictorFallback(input: { exam: string; rank: number; category: string }) {
  return {
    predictions: fallbackColleges.slice(0, 20).map((college, index) => ({
      collegeId: college.id,
      collegeName: college.name,
      collegeSlug: college.slug,
      location: college.location,
      courseName: fallbackCourses[index % fallbackCourses.length].name,
      matchScore: Math.max(55, 96 - index * 2),
      chances: index < 6 ? "high" : index < 14 ? "medium" : "low",
      closingRank: Math.max(input.rank + 500, 1000 + index * 2500),
      feesMin: college.feesMin,
      rating: Number(college.rating),
    })),
    total: 20,
    input: { exam: input.exam, rank: input.rank, category: input.category },
  };
}

function splitQuery(value: string | undefined) {
  if (!value) return undefined;
  const values = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return values.length > 0 ? values : undefined;
}

function numberQuery(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseIds(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);
}

restApi.onError((err, c) => {
  console.warn("Using generated fallback data because the database request failed:", err.message);
  const url = new URL(c.req.url);
  const path = url.pathname.replace(/^\/api/, "");

  if (c.req.method === "GET" && path === "/colleges/popular") {
    const limit = Math.min(Math.max(numberQuery(c.req.query("limit")) ?? 8, 1), 20);
    return c.json([...fallbackColleges].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, limit));
  }

  if (c.req.method === "GET" && path === "/colleges/locations") {
    const counts = new Map<string, number>();
    for (const college of fallbackColleges) {
      counts.set(college.state, (counts.get(college.state) || 0) + 1);
    }
    return c.json(
      [...counts.entries()]
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
    );
  }

  if (c.req.method === "GET" && path === "/colleges/cities") {
    const counts = new Map<string, number>();
    for (const college of fallbackColleges) {
      counts.set(college.location, (counts.get(college.location) || 0) + 1);
    }
    return c.json(
      [...counts.entries()]
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
    );
  }

  if (c.req.method === "GET" && path === "/colleges") {
    const page = Math.max(numberQuery(c.req.query("page")) ?? 1, 1);
    const limit = Math.min(Math.max(numberQuery(c.req.query("limit")) ?? 24, 1), 50);
    return c.json(
      filterFallbackColleges({
        search: c.req.query("search") || undefined,
        location: splitQuery(c.req.query("location")),
        ownership: splitQuery(c.req.query("ownership")) as Array<"government" | "private" | "deemed"> | undefined,
        page,
        limit,
        sortBy: (c.req.query("sortBy") as "relevance" | "rating" | "fees_asc" | "fees_desc" | "placement" | undefined) || "relevance",
      })
    );
  }

  const collegeDetailMatch = path.match(/^\/colleges\/([^/]+)$/);
  if (c.req.method === "GET" && collegeDetailMatch) {
    const college = fallbackColleges.find((item) => item.slug === collegeDetailMatch[1]);
    if (!college) return c.json(null);
    return c.json({
      ...college,
      courses: fallbackCourses.map((course, index) => ({ ...course, id: college.id * 100 + index, collegeId: college.id })),
      similarColleges: fallbackColleges
        .filter((item) => item.state === college.state && item.id !== college.id)
        .slice(0, 4),
    });
  }

  const reviewsMatch = path.match(/^\/colleges\/(\d+)\/reviews$/);
  if (c.req.method === "GET" && reviewsMatch) {
    const collegeId = Number(reviewsMatch[1]);
    const reviews = fallbackReviews(collegeId);
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    return c.json({
      reviews,
      total: reviews.length,
      avgRating: Math.round(avgRating * 10) / 10,
      ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
    });
  }

  if (c.req.method === "POST" && reviewsMatch) {
    return c.json({ success: true, fallback: true }, 201);
  }

  if (c.req.method === "GET" && path === "/compare") {
    const ids = parseIds(c.req.query("ids"));
    return c.json(compareFallback(ids));
  }

  if (c.req.method === "GET" && path === "/compare/winner") {
    const ids = parseIds(c.req.query("ids"));
    return c.json(winnerFallback(ids));
  }

  if (c.req.method === "POST" && path === "/predictor") {
    return c.json(predictorFallback({ exam: "JEE Main", rank: 1, category: "General" }));
  }

  return c.json({ error: "Request failed" }, 500);
});

restApi.get("/health", (c) => c.json({ ok: true, ts: Date.now() }));

restApi.get("/colleges/popular", async (c) => {
  const limit = Math.min(Math.max(numberQuery(c.req.query("limit")) ?? 8, 1), 20);
  const db = getDb();
  const result = await db
    .select()
    .from(colleges)
    .orderBy(desc(colleges.rating), desc(colleges.placementPercentage))
    .limit(limit);

  return c.json(result);
});

restApi.get("/colleges/locations", async (c) => {
  const db = getDb();
  const result = await db
    .select({
      state: colleges.state,
      count: sql<number>`count(*)`,
    })
    .from(colleges)
    .groupBy(colleges.state)
    .orderBy(sql`count(*) DESC`);

  return c.json(result.map((item) => ({ ...item, count: Number(item.count) })));
});

restApi.get("/colleges/cities", async (c) => {
  const db = getDb();
  const result = await db
    .select({
      city: colleges.location,
      count: sql<number>`count(*)`,
    })
    .from(colleges)
    .groupBy(colleges.location)
    .orderBy(sql`count(*) DESC`);

  return c.json(result.map((item) => ({ ...item, count: Number(item.count) })));
});

restApi.get("/colleges/:slug", async (c) => {
  const db = getDb();
  const slug = c.req.param("slug");
  const college = await db.select().from(colleges).where(eq(colleges.slug, slug)).limit(1);

  if (!college[0]) {
    return c.json(null);
  }

  const collegeCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.collegeId, college[0].id))
    .orderBy(asc(courses.fees));

  const similar = await db
    .select()
    .from(colleges)
    .where(and(eq(colleges.state, college[0].state), sql`${colleges.id} != ${college[0].id}`))
    .orderBy(desc(colleges.rating))
    .limit(4);

  return c.json({
    ...college[0],
    courses: collegeCourses,
    similarColleges: similar,
  });
});

restApi.get("/colleges", async (c) => {
  const querySchema = z.object({
    search: z.string().optional(),
    location: z.array(z.string()).optional(),
    city: z.array(z.string()).optional(),
    ownership: z.array(ownershipSchema).optional(),
    feesMin: z.number().optional(),
    feesMax: z.number().optional(),
    rating: z.number().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(50).default(24),
    sortBy: sortSchema.default("relevance"),
  });

  const parsed = querySchema.safeParse({
    search: c.req.query("search") || undefined,
    location: splitQuery(c.req.query("location")),
    city: splitQuery(c.req.query("city")),
    ownership: splitQuery(c.req.query("ownership")),
    feesMin: numberQuery(c.req.query("feesMin")),
    feesMax: numberQuery(c.req.query("feesMax")),
    rating: numberQuery(c.req.query("rating")),
    page: numberQuery(c.req.query("page")),
    limit: numberQuery(c.req.query("limit")),
    sortBy: c.req.query("sortBy") || undefined,
  });

  if (!parsed.success) {
    return c.json({ error: "Invalid query", issues: parsed.error.issues }, 400);
  }

  const input = parsed.data;
  const db = getDb();
  const conditions = [];

  if (input.search) {
    const searchStr = input.search.trim().toLowerCase();
    const searchConds = [
      ilike(colleges.name, `%${searchStr}%`),
      ilike(colleges.slug, `%${searchStr.replace(/\s+/g, '-')}%`)
    ];
    if (searchStr.length <= 5 && !searchStr.includes(" ")) {
      const fuzzy = `%${searchStr.split("").join("%")}%`;
      searchConds.push(ilike(colleges.slug, fuzzy));
    }
    conditions.push(or(...searchConds));
  }
  if (input.location && input.location.length > 0) {
    conditions.push(inArray(colleges.state, input.location));
  }
  if (input.city && input.city.length > 0) {
    conditions.push(inArray(colleges.location, input.city));
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
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(colleges).where(whereClause);
  const total = Number(countResult[0]?.count || 0);

  // Determine if we need smart relevance re-ranking
  const useSmartRanking = !!input.search && (input.sortBy === "relevance" || !input.sortBy);

  let orderBy;
  if (!useSmartRanking) {
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
  } else {
    // For smart ranking we'll re-sort in JS, but use rating as initial SQL order
    orderBy = desc(colleges.rating);
  }

  const offset = (input.page - 1) * input.limit;
  // Fetch extra results when doing smart ranking so we have enough to re-sort
  const fetchLimit = useSmartRanking ? Math.min(Math.max(input.limit * 3, 50), total) : input.limit;
  let result = await db
    .select()
    .from(colleges)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(fetchLimit)
    .offset(offset);

  // Smart acronym-aware re-ranking
  if (useSmartRanking && input.search) {
    const searchStr = input.search.trim().toLowerCase();
    const slugSearch = searchStr.replace(/\s+/g, '-');
    const skipWords = new Set(["of", "and", "the", "for", "in", "at", "to"]);

    function computeAcronym(name: string): string {
      return name
        .split(/[\s\-\(\)]+/)
        .filter(w => w.length > 0 && !skipWords.has(w.toLowerCase()))
        .map(w => w[0])
        .join("")
        .toLowerCase();
    }

    function scoreCollege(college: typeof result[0]): number {
      const name = college.name.toLowerCase();
      const slug = college.slug.toLowerCase();
      const acronym = computeAcronym(college.name);

      // Tier 0: Exact name match
      if (name === searchStr) return 0;
      // Tier 1: Name starts with search term
      if (name.startsWith(searchStr)) return 1;
      // Tier 2: Exact acronym match (e.g. "pict" = PICT, "iitm" = IITM)
      if (acronym === searchStr) return 2;
      // Tier 3: Acronym starts with search term (e.g. "iit" matches IITD, IITB, IITM...)
      if (acronym.startsWith(searchStr)) return 3;
      // Tier 4: Slug starts with search term
      if (slug.startsWith(slugSearch)) return 4;
      // Tier 5: Name contains search term at a word boundary
      if (name.includes(" " + searchStr)) return 5;
      // Tier 6: Name or slug contains the search term somewhere
      if (name.includes(searchStr) || slug.includes(slugSearch)) return 6;
      // Tier 7: Everything else (fuzzy matches)
      return 7;
    }

    result = result
      .map(college => ({ ...college, _score: scoreCollege(college) }))
      .sort((a, b) => {
        if (a._score !== b._score) return a._score - b._score;
        return Number(b.rating) - Number(a.rating);
      })
      .slice(0, input.limit)
      .map(({ _score, ...college }) => college);
  }

  return c.json({
    colleges: result,
    total,
    page: input.page,
    totalPages: Math.ceil(total / input.limit),
  });
});

restApi.get("/colleges/:id/reviews", async (c) => {
  const collegeId = Number(c.req.param("id"));
  const page = Math.max(numberQuery(c.req.query("page")) ?? 1, 1);
  const limit = Math.min(Math.max(numberQuery(c.req.query("limit")) ?? 10, 1), 50);

  if (!Number.isInteger(collegeId) || collegeId < 1) {
    return c.json({ error: "Invalid college id" }, 400);
  }

  const db = getDb();
  const allReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.collegeId, collegeId))
    .orderBy(desc(reviews.createdAt));

  const offset = (page - 1) * limit;
  const paginatedReviews = allReviews.slice(offset, offset + limit);
  const avgRating =
    allReviews.length > 0 ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length : 0;
  const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const review of allReviews) {
    ratingBreakdown[review.rating] = (ratingBreakdown[review.rating] || 0) + 1;
  }

  return c.json({
    reviews: paginatedReviews,
    total: allReviews.length,
    avgRating: Math.round(avgRating * 10) / 10,
    ratingBreakdown,
  });
});

restApi.post("/colleges/:id/reviews", async (c) => {
  const collegeId = Number(c.req.param("id"));
  if (!Number.isInteger(collegeId) || collegeId < 1) {
    return c.json({ error: "Invalid college id" }, 400);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = z
    .object({
      reviewerName: z.string().trim().min(1).max(100),
      courseName: z.string().trim().optional(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().trim().min(10).max(2000),
    })
    .safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid review", issues: parsed.error.issues }, 400);
  }

  const db = getDb();
  await db.insert(reviews).values({
    collegeId,
    reviewerName: parsed.data.reviewerName,
    courseName: parsed.data.courseName || null,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    helpful: 0,
    notHelpful: 0,
  });

  return c.json({ success: true }, 201);
});

restApi.get("/compare", async (c) => {
  const ids = parseIds(c.req.query("ids"));
  if (ids.length < 2 || ids.length > 4) {
    return c.json({ error: "Select 2 to 4 colleges" }, 400);
  }

  const db = getDb();
  const collegeData = await db.select().from(colleges).where(inArray(colleges.id, ids));
  const collegeCourses = await db.select().from(courses).where(inArray(courses.collegeId, ids));

  return c.json(
    collegeData.map((college) => ({
      ...college,
      courses: collegeCourses.filter((course) => course.collegeId === college.id),
    }))
  );
});

restApi.get("/compare/winner", async (c) => {
  const ids = parseIds(c.req.query("ids"));
  if (ids.length < 2 || ids.length > 4) {
    return c.json({ error: "Select 2 to 4 colleges" }, 400);
  }

  const db = getDb();
  const collegeData = await db.select().from(colleges).where(inArray(colleges.id, ids));
  if (collegeData.length === 0) {
    return c.json(null);
  }

  const maxNirf = Math.max(...collegeData.map((college) => college.nirfRank || 999));
  const maxFees = Math.max(...collegeData.map((college) => college.feesMin || 0));
  const maxCourses = Math.max(...collegeData.map((college) => college.totalCourses || 0));

  const scores = collegeData
    .map((college) => {
      const ratingScore = (parseFloat(college.rating?.toString() || "0") / 5) * 25;
      const placementScore = ((college.placementPercentage || 0) / 100) * 25;
      const nirfScore = ((maxNirf - (college.nirfRank || maxNirf)) / maxNirf) * 20;
      const feesScore = (1 - (college.feesMin || 0) / (maxFees || 1)) * 15;
      const coursesScore = ((college.totalCourses || 0) / (maxCourses || 1)) * 15;
      const totalScore = ratingScore + placementScore + nirfScore + feesScore + coursesScore;

      return {
        collegeId: college.id,
        name: college.name,
        score: Math.round(totalScore * 10) / 10,
      };
    })
    .sort((a, b) => b.score - a.score);

  return c.json({
    winnerId: scores[0].collegeId,
    winnerName: scores[0].name,
    scores,
  });
});

restApi.post("/predictor", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = z
    .object({
      exam: examSchema,
      rank: z.number().int().min(1),
      category: categorySchema,
      state: z.string().optional(),
      courseType: z.string().optional(),
    })
    .safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid prediction input", issues: parsed.error.issues }, 400);
  }

  const input = parsed.data;
  try {
    const db = getDb();
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
      return c.json({
        predictions: [],
        total: 0,
        input: { exam: input.exam, rank: input.rank, category: input.category },
      });
    }

    const collegeIds = [...new Set(mappings.map((mapping) => mapping.collegeId))];
    const collegeData = await db.select().from(colleges).where(inArray(colleges.id, collegeIds));

    const predictions = mappings
      .map((mapping) => {
        const college = collegeData.find((item) => item.id === mapping.collegeId);
        if (!college) return null;

        let matchScore = mapping.matchScore;
        if (input.state && college.state.toLowerCase().includes(input.state.toLowerCase())) {
          matchScore = Math.min(100, matchScore + 20);
        }

        const chances = matchScore >= 85 ? "high" : matchScore >= 60 ? "medium" : "low";
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
      })
      .filter((prediction) => prediction !== null)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);

    return c.json({
      predictions,
      total: predictions.length,
      input: { exam: input.exam, rank: input.rank, category: input.category },
    });
  } catch (error) {
    console.warn("Using generated predictor fallback because the database request failed:", error);
    return c.json(predictorFallback(input));
  }
});

export default restApi;
