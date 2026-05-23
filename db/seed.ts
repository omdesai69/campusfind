import { sql } from "drizzle-orm";
import { getDb } from "../server/queries/connection";
import { colleges, courses, reviews, predictorMappings } from "./schema";
import fs from "fs";
import xlsx from "xlsx";
import path from "path";
import "dotenv/config";

const db = getDb();

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const courseTemplates: Record<string, Array<{ name: string; duration: string; fees: number; eligibility: string; degreeType: string; seatIntake: number }>> = {
  "iit-delhi": [
    { name: "B.Tech Computer Science", duration: "4 Years", fees: 250000, eligibility: "JEE Main + JEE Advanced", degreeType: "B.Tech", seatIntake: 120 },
    { name: "B.Tech Electrical Engineering", duration: "4 Years", fees: 250000, eligibility: "JEE Main + JEE Advanced", degreeType: "B.Tech", seatIntake: 90 },
    { name: "B.Tech Mechanical Engineering", duration: "4 Years", fees: 250000, eligibility: "JEE Main + JEE Advanced", degreeType: "B.Tech", seatIntake: 80 },
    { name: "M.Tech Computer Science", duration: "2 Years", fees: 150000, eligibility: "GATE + B.Tech", degreeType: "M.Tech", seatIntake: 50 },
    { name: "B.Tech Civil Engineering", duration: "4 Years", fees: 250000, eligibility: "JEE Main + JEE Advanced", degreeType: "B.Tech", seatIntake: 70 },
    { name: "B.Tech Chemical Engineering", duration: "4 Years", fees: 250000, eligibility: "JEE Main + JEE Advanced", degreeType: "B.Tech", seatIntake: 60 },
  ],
  "iit-bombay": [
    { name: "B.Tech Computer Science", duration: "4 Years", fees: 260000, eligibility: "JEE Main + JEE Advanced", degreeType: "B.Tech", seatIntake: 130 },
    { name: "B.Tech Aerospace Engineering", duration: "4 Years", fees: 260000, eligibility: "JEE Main + JEE Advanced", degreeType: "B.Tech", seatIntake: 50 },
    { name: "B.Tech Metallurgical Engineering", duration: "4 Years", fees: 260000, eligibility: "JEE Main + JEE Advanced", degreeType: "B.Tech", seatIntake: 55 },
    { name: "B.Des", duration: "4 Years", fees: 280000, eligibility: "UCEED", degreeType: "B.Des", seatIntake: 40 },
    { name: "M.Tech CSE", duration: "2 Years", fees: 160000, eligibility: "GATE + B.Tech", degreeType: "M.Tech", seatIntake: 55 },
  ],
  "iit-madras": [
    { name: "B.Tech Computer Science", duration: "4 Years", fees: 240000, eligibility: "JEE Main + JEE Advanced", degreeType: "B.Tech", seatIntake: 110 },
    { name: "B.Tech Engineering Physics", duration: "4 Years", fees: 240000, eligibility: "JEE Main + JEE Advanced", degreeType: "B.Tech", seatIntake: 45 },
    { name: "B.Tech Naval Architecture", duration: "4 Years", fees: 240000, eligibility: "JEE Main + JEE Advanced", degreeType: "B.Tech", seatIntake: 50 },
    { name: "B.Tech Electrical Engineering", duration: "4 Years", fees: 240000, eligibility: "JEE Main + JEE Advanced", degreeType: "B.Tech", seatIntake: 85 },
    { name: "MBA", duration: "2 Years", fees: 350000, eligibility: "CAT", degreeType: "MBA", seatIntake: 60 },
  ],
  "bits-pilani": [
    { name: "B.E. Computer Science", duration: "4 Years", fees: 500000, eligibility: "BITSAT", degreeType: "B.Tech", seatIntake: 150 },
    { name: "B.E. Electronics", duration: "4 Years", fees: 500000, eligibility: "BITSAT", degreeType: "B.Tech", seatIntake: 120 },
    { name: "B.E. Mechanical", duration: "4 Years", fees: 500000, eligibility: "BITSAT", degreeType: "B.Tech", seatIntake: 100 },
    { name: "M.Sc. Economics", duration: "4 Years", fees: 450000, eligibility: "BITSAT", degreeType: "Integrated M.Sc", seatIntake: 80 },
    { name: "M.Sc. Physics", duration: "4 Years", fees: 450000, eligibility: "BITSAT", degreeType: "Integrated M.Sc", seatIntake: 60 },
    { name: "B.Pharm", duration: "4 Years", fees: 480000, eligibility: "BITSAT", degreeType: "B.Pharm", seatIntake: 70 },
  ],
  "vit-vellore": [
    { name: "B.Tech CSE", duration: "4 Years", fees: 220000, eligibility: "VITEEE", degreeType: "B.Tech", seatIntake: 500 },
    { name: "B.Tech IT", duration: "4 Years", fees: 200000, eligibility: "VITEEE", degreeType: "B.Tech", seatIntake: 300 },
    { name: "B.Tech ECE", duration: "4 Years", fees: 210000, eligibility: "VITEEE", degreeType: "B.Tech", seatIntake: 350 },
    { name: "B.Tech Mechanical", duration: "4 Years", fees: 190000, eligibility: "VITEEE", degreeType: "B.Tech", seatIntake: 200 },
    { name: "B.Tech Civil", duration: "4 Years", fees: 180000, eligibility: "VITEEE", degreeType: "B.Tech", seatIntake: 150 },
    { name: "B.Tech Biotech", duration: "4 Years", fees: 200000, eligibility: "VITEEE", degreeType: "B.Tech", seatIntake: 100 },
  ],
  "aiims-delhi": [
    { name: "MBBS", duration: "5.5 Years", fees: 20000, eligibility: "NEET", degreeType: "MBBS", seatIntake: 125 },
    { name: "MD General Medicine", duration: "3 Years", fees: 15000, eligibility: "NEET PG", degreeType: "MD", seatIntake: 30 },
    { name: "MS General Surgery", duration: "3 Years", fees: 15000, eligibility: "NEET PG", degreeType: "MS", seatIntake: 20 },
    { name: "MD Pediatrics", duration: "3 Years", fees: 15000, eligibility: "NEET PG", degreeType: "MD", seatIntake: 15 },
    { name: "B.Sc Nursing", duration: "4 Years", fees: 12000, eligibility: "AIIMS Nursing Entrance", degreeType: "B.Sc", seatIntake: 80 },
  ],
  "cmc-vellore": [
    { name: "MBBS", duration: "5.5 Years", fees: 80000, eligibility: "NEET", degreeType: "MBBS", seatIntake: 100 },
    { name: "B.Sc Nursing", duration: "4 Years", fees: 60000, eligibility: "CMC Entrance", degreeType: "B.Sc", seatIntake: 120 },
    { name: "MD General Medicine", duration: "3 Years", fees: 100000, eligibility: "NEET PG", degreeType: "MD", seatIntake: 25 },
    { name: "M.Sc Nursing", duration: "2 Years", fees: 90000, eligibility: "CMC Entrance", degreeType: "M.Sc", seatIntake: 40 },
  ],
  "iim-ahmedabad": [
    { name: "PGP in Management", duration: "2 Years", fees: 3300000, eligibility: "CAT + WAT + PI", degreeType: "MBA", seatIntake: 400 },
    { name: "PGP in Food and Agri Business", duration: "2 Years", fees: 2500000, eligibility: "CAT + WAT + PI", degreeType: "MBA", seatIntake: 50 },
    { name: "Fellow Programme in Management", duration: "4-5 Years", fees: 1500000, eligibility: "CAT/GMAT/GRE + Research Proposal", degreeType: "PhD", seatIntake: 30 },
    { name: "Executive MBA", duration: "1 Year", fees: 3200000, eligibility: "GMAT + 5 Years Work Exp", degreeType: "MBA", seatIntake: 80 },
  ],
  "iim-bangalore": [
    { name: "PGP in Management", duration: "2 Years", fees: 3100000, eligibility: "CAT + WAT + PI", degreeType: "MBA", seatIntake: 430 },
    { name: "PGP in Business Analytics", duration: "2 Years", fees: 2800000, eligibility: "CAT + WAT + PI", degreeType: "MBA", seatIntake: 55 },
    { name: "Executive MBA", duration: "1 Year", fees: 3000000, eligibility: "GMAT + 5 Years Work Exp", degreeType: "MBA", seatIntake: 75 },
  ],
  "nlu-delhi": [
    { name: "BA LLB (Hons)", duration: "5 Years", fees: 260000, eligibility: "AILET", degreeType: "BA LLB", seatIntake: 120 },
    { name: "LLM", duration: "1 Year", fees: 200000, eligibility: "AILET", degreeType: "LLM", seatIntake: 70 },
    { name: "PhD in Law", duration: "3-5 Years", fees: 150000, eligibility: "AILET + Interview", degreeType: "PhD", seatIntake: 20 },
    { name: "PG Diploma in IP Law", duration: "1 Year", fees: 180000, eligibility: "Graduation + Entrance", degreeType: "PG Diploma", seatIntake: 40 },
  ],
  "nlsiu-bangalore": [
    { name: "BA LLB (Hons)", duration: "5 Years", fees: 240000, eligibility: "NLAT", degreeType: "BA LLB", seatIntake: 240 },
    { name: "LLM in Business Law", duration: "1 Year", fees: 220000, eligibility: "NLAT", degreeType: "LLM", seatIntake: 60 },
    { name: "M.Phil in Law", duration: "2 Years", fees: 180000, eligibility: "NLAT + Interview", degreeType: "M.Phil", seatIntake: 30 },
  ],
  "nit-trichy": [
    { name: "B.Tech CSE", duration: "4 Years", fees: 160000, eligibility: "JEE Main", degreeType: "B.Tech", seatIntake: 180 },
    { name: "B.Tech ECE", duration: "4 Years", fees: 155000, eligibility: "JEE Main", degreeType: "B.Tech", seatIntake: 160 },
    { name: "B.Tech Mechanical", duration: "4 Years", fees: 145000, eligibility: "JEE Main", degreeType: "B.Tech", seatIntake: 140 },
    { name: "B.Tech Civil", duration: "4 Years", fees: 140000, eligibility: "JEE Main", degreeType: "B.Tech", seatIntake: 100 },
    { name: "B.Tech Chemical", duration: "4 Years", fees: 150000, eligibility: "JEE Main", degreeType: "B.Tech", seatIntake: 80 },
    { name: "B.Tech Production", duration: "4 Years", fees: 140000, eligibility: "JEE Main", degreeType: "B.Tech", seatIntake: 70 },
    { name: "MBA", duration: "2 Years", fees: 180000, eligibility: "CAT", degreeType: "MBA", seatIntake: 90 },
  ],
};

const defaultCourses = [
  { name: "B.Tech CSE", duration: "4 Years", fees: 180000, eligibility: "JEE Main", degreeType: "B.Tech", seatIntake: 120 },
  { name: "B.Tech ECE", duration: "4 Years", fees: 175000, eligibility: "JEE Main", degreeType: "B.Tech", seatIntake: 100 },
  { name: "B.Tech Mechanical", duration: "4 Years", fees: 170000, eligibility: "JEE Main", degreeType: "B.Tech", seatIntake: 90 },
  { name: "MBA", duration: "2 Years", fees: 300000, eligibility: "CAT", degreeType: "MBA", seatIntake: 60 },
  { name: "M.Tech CSE", duration: "2 Years", fees: 140000, eligibility: "GATE", degreeType: "M.Tech", seatIntake: 30 },
];

const reviewTemplates = [
  { reviewerName: "Rahul Sharma", courseName: "B.Tech Computer Science", rating: 5, comment: "Amazing campus life and excellent faculty. The placement opportunities are outstanding with top companies visiting every year. Highly recommend for anyone passionate about technology." },
  { reviewerName: "Priya Patel", courseName: "B.Tech CSE", rating: 4, comment: "Great infrastructure and learning environment. The curriculum is industry-relevant and professors are very supportive. Could improve hostel facilities though." },
  { reviewerName: "Amit Kumar", courseName: "B.Tech Electrical", rating: 5, comment: "Best decision of my life! The research opportunities here are unparalleled. Made lifelong friends and got placed at a top MNC with a great package." },
  { reviewerName: "Sneha Gupta", courseName: "MBA", rating: 4, comment: "Rigorous academic program with excellent peer group. The case study methodology prepares you well for real-world business challenges." },
  { reviewerName: "Vikram Singh", courseName: "B.Tech Mechanical", rating: 3, comment: "Good academics but the administrative processes can be slow. Faculty is knowledgeable and labs are well-equipped." },
  { reviewerName: "Ananya Reddy", courseName: "MBBS", rating: 5, comment: "World-class medical education. The clinical exposure from early years is invaluable. Proud to be an alumna!" },
  { reviewerName: "Karthik Menon", courseName: "B.Tech CSE", rating: 5, comment: "The coding culture here is incredible. So many hackathons, tech fests, and workshops. Perfect environment for tech enthusiasts." },
  { reviewerName: "Neha Aggarwal", courseName: "BA LLB", rating: 4, comment: "Challenging but rewarding. The moot court competitions and internships prepare you well for a legal career." },
  { reviewerName: "Rajesh Iyer", courseName: "B.Tech Chemical", rating: 4, comment: "Strong industry connections and great research facilities. Campus life is vibrant with numerous student clubs and activities." },
  { reviewerName: "Divya Nair", courseName: "B.Sc Nursing", rating: 5, comment: "Wonderful learning experience. The faculty mentors are incredibly supportive and the clinical training is top-notch." },
  { reviewerName: "Arjun Verma", courseName: "B.Tech Civil", rating: 3, comment: "Decent college with good academics. Placement could be better for core branches. Overall a satisfactory experience." },
  { reviewerName: "Meera Krishnan", courseName: "PGP Management", rating: 5, comment: "Transformational experience! The diversity of the batch and quality of faculty make this place truly special." },
  { reviewerName: "Suresh Reddy", courseName: "B.Tech IT", rating: 4, comment: "Good balance of academics and extracurriculars. The training and placement cell works very hard for students." },
  { reviewerName: "Pooja Malhotra", courseName: "MBBS", rating: 4, comment: "Intense but fulfilling journey. The patient exposure and hands-on learning are the biggest strengths here." },
  { reviewerName: "Aditya Joshi", courseName: "B.Tech Aerospace", rating: 5, comment: "Dream come true for aerospace enthusiasts! The labs and wind tunnel facilities are state-of-the-art." },
];

function getCoursesForCollege(slug: string) {
  return courseTemplates[slug] || defaultCourses;
}

function getReviewsForCollege(collegeId: number) {
  const count = 4 + Math.floor(Math.random() * 5); // 4-8 reviews
  const reviews = [];
  const usedTemplates = new Set<number>();
  for (let i = 0; i < count; i++) {
    let templateIdx = Math.floor(Math.random() * reviewTemplates.length);
    while (usedTemplates.has(templateIdx)) {
      templateIdx = Math.floor(Math.random() * reviewTemplates.length);
    }
    usedTemplates.add(templateIdx);
    const t = reviewTemplates[templateIdx];
    const helpfulBase = Math.floor(Math.random() * 50);
    reviews.push({
      collegeId,
      reviewerName: t.reviewerName,
      courseName: t.courseName,
      rating: t.rating,
      comment: t.comment,
      helpful: helpfulBase + Math.floor(Math.random() * 20),
      notHelpful: Math.floor(Math.random() * 10),
    });
  }
  return reviews;
}

const examNames = ["JEE Main", "NEET", "CAT", "GATE", "BITSAT"];
const categories = ["General", "OBC", "SC", "ST", "EWS"];

function getPredictorMappings(collegeId: number, slug: string, examName: string) {
  const mappings = [];
  for (const category of categories) {
    let rankMin: number, rankMax: number, matchScore: number;
    
    if (slug.startsWith("iit-")) {
      if (examName === "JEE Main") {
        if (category === "General") { rankMin = 1; rankMax = 15000; matchScore = 95; }
        else if (category === "OBC") { rankMin = 1; rankMax = 8000; matchScore = 90; }
        else if (category === "SC") { rankMin = 1; rankMax = 4000; matchScore = 92; }
        else if (category === "ST") { rankMin = 1; rankMax = 2000; matchScore = 93; }
        else { rankMin = 1; rankMax = 5000; matchScore = 91; }
      } else if (examName === "GATE") {
        rankMin = 1; rankMax = 3000; matchScore = 88;
      } else continue;
    } else if (slug.startsWith("nit-")) {
      if (examName === "JEE Main") {
        if (category === "General") { rankMin = 5000; rankMax = 50000; matchScore = 80; }
        else if (category === "OBC") { rankMin = 3000; rankMax = 25000; matchScore = 78; }
        else if (category === "SC") { rankMin = 1000; rankMax = 12000; matchScore = 82; }
        else if (category === "ST") { rankMin = 500; rankMax = 6000; matchScore = 83; }
        else { rankMin = 1500; rankMax = 15000; matchScore = 81; }
      } else continue;
    } else if (slug === "bits-pilani") {
      if (examName === "BITSAT") {
        rankMin = 1; rankMax = 10000; matchScore = 85;
      } else if (examName === "JEE Main") {
        rankMin = 10000; rankMax = 60000; matchScore = 70;
      } else continue;
    } else if (slug === "vit-vellore" || slug === "srm-chennai") {
      if (examName === "JEE Main") {
        rankMin = 30000; rankMax = 150000; matchScore = 65;
      } else continue;
    } else if (slug === "aiims-delhi" || slug === "cmc-vellore" || slug === "afmc-pune" || slug === "kgmu-lucknow") {
      if (examName === "NEET") {
        if (slug === "aiims-delhi") {
          if (category === "General") { rankMin = 1; rankMax = 100; matchScore = 98; }
          else if (category === "OBC") { rankMin = 1; rankMax = 80; matchScore = 97; }
          else if (category === "SC") { rankMin = 1; rankMax = 50; matchScore = 97; }
          else if (category === "ST") { rankMin = 1; rankMax = 25; matchScore = 98; }
          else { rankMin = 1; rankMax = 60; matchScore = 97; }
        } else {
          rankMin = 50; rankMax = 5000; matchScore = 85;
        }
      } else continue;
    } else if (slug.startsWith("iim-") || slug === "xlri-jamshedpur" || slug === "spjimr-mumbai") {
      if (examName === "CAT") {
        if (slug === "iim-ahmedabad") { rankMin = 1; rankMax = 200; matchScore = 95; }
        else if (slug === "iim-bangalore") { rankMin = 1; rankMax = 250; matchScore = 93; }
        else { rankMin = 200; rankMax = 3000; matchScore = 75; }
      } else continue;
    } else if (slug.startsWith("nlu-") || slug === "nlsiu-bangalore" || slug === "gnlu-gandhinagar") {
      if (examName === "JEE Main") continue;
      continue; // Law schools use their own exams
    } else {
      if (examName === "JEE Main") {
        rankMin = 50000; rankMax = 200000; matchScore = 55;
      } else continue;
    }

    mappings.push({
      collegeId,
      examName,
      category,
      rankMin,
      rankMax,
      courseName: null,
      matchScore,
      closingRank: rankMax - Math.floor(Math.random() * (rankMax - rankMin) * 0.3),
    });
  }
  return mappings;
}

async function seed() {
  console.log("Seeding database...");

  // Delete existing data in PostgreSQL way (with CASCADE to ignore foreign keys)
  await db.execute(sql`TRUNCATE TABLE predictor_mappings CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE reviews CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE courses CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE colleges CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE compare_sessions CASCADE;`);
  console.log("Cleared existing data");

  console.log("Reading CSV file...");
  const filePath = path.resolve(process.cwd(), "top_200_india_colleges_deep_research.csv");
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[];

  console.log(`Found ${data.length} records in CSV. Uploading to PostgreSQL...`);

  // Insert colleges
  let count = 0;
  const collegesData: any[] = [];
  for (const row of data) {
    try {
      const collegeName = row["College Name"];
      if (!collegeName) continue;

      const slug = generateSlug(collegeName);
      const state = row["Area"]?.split(",").pop()?.trim() || "Unknown";
      let feesMin = 50000;
      let feesMax = 200000;
      
      if (row["Annual Fees (INR)"]) {
        const fees = parseInt(row["Annual Fees (INR)"].toString().replace(/\D/g, ""));
        if (!isNaN(fees)) {
          feesMin = fees;
          feesMax = fees + 50000;
        }
      }

      collegesData.push({
        slug,
        name: collegeName,
        location: row["Area"] || "Unknown",
        state: state,
        established: parseInt(row["Established"]) || 2000,
        ownership: row["Ownership"]?.toLowerCase().includes("private") ? "private" : "government",
        rating: (parseFloat(row["Rating"]) || 4.0).toString(),
        feesMin: Math.min(feesMin, 2000000000),
        feesMax: Math.min(feesMax, 2000000000),
        placementPercentage: Math.min(parseInt(row["Placement %"]) || 85, 100),
        avgPackage: Math.min(Math.round((parseFloat(row["Avg Package (LPA)"]) * 100000) || 500000), 2000000000),
        description: row["Overview"] || "",
        website: row["Official Website"] || "",
        imageUrl: fs.existsSync(path.join(process.cwd(), "public", "colleges", `${slug}.jpg`)) ? `/colleges/${slug}.jpg` : null,
      });
      count++;
    } catch (err) {
      console.error(`Error processing row ${row["College Name"]}:`, err);
    }
  }

  await db.insert(colleges).values(collegesData).onConflictDoNothing();
  console.log(`Inserted ${count} colleges`);

  // Get all inserted colleges with IDs
  const allColleges = await db.select().from(colleges);

  // Insert courses and reviews for each college
  let coursesData: any[] = [];
  let reviewsData: any[] = [];
  let predictorsData: any[] = [];

  for (const college of allColleges) {
    const collegeCourses = getCoursesForCollege(college.slug);
    for (const course of collegeCourses) {
      coursesData.push({
        collegeId: college.id,
        name: course.name,
        duration: course.duration,
        fees: course.fees,
        eligibility: course.eligibility,
        degreeType: course.degreeType,
        seatIntake: course.seatIntake,
      });
    }

    const collegeReviews = getReviewsForCollege(college.id);
    for (const review of collegeReviews) {
      reviewsData.push(review);
    }

    for (const examName of examNames) {
      const mappings = getPredictorMappings(college.id, college.slug, examName);
      for (const mapping of mappings) {
        predictorsData.push(mapping);
      }
    }
  }

  const chunkSize = 1000;
  
  console.log(`Inserting ${coursesData.length} courses...`);
  for (let i = 0; i < coursesData.length; i += chunkSize) {
    await db.insert(courses).values(coursesData.slice(i, i + chunkSize));
  }

  console.log(`Inserting ${reviewsData.length} reviews...`);
  for (let i = 0; i < reviewsData.length; i += chunkSize) {
    await db.insert(reviews).values(reviewsData.slice(i, i + chunkSize));
  }

  console.log(`Inserting ${predictorsData.length} predictor mappings...`);
  for (let i = 0; i < predictorsData.length; i += chunkSize) {
    await db.insert(predictorMappings).values(predictorsData.slice(i, i + chunkSize));
  }

  console.log(`Inserted ${coursesData.length} courses`);
  console.log(`Inserted ${reviewsData.length} reviews`);
  console.log(`Inserted ${predictorsData.length} predictor mappings`);
  console.log("Seeding complete!");
}

seed().catch(console.error);
