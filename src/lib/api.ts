import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export type Ownership = "government" | "private" | "deemed";
export type SortBy = "relevance" | "rating" | "fees_asc" | "fees_desc" | "placement";
export type Exam = "JEE Main" | "NEET" | "CAT" | "GATE" | "BITSAT" | "MHT CET";
export type Category = "General" | "OBC" | "SC" | "ST" | "EWS";

export type College = {
  id: number;
  slug: string;
  name: string;
  location: string;
  state: string;
  established: number | null;
  ownership: Ownership;
  nirfRank: number | null;
  rating: string;
  feesMin: number;
  feesMax: number;
  placementPercentage: number | null;
  avgPackage: number | null;
  highestPackage: number | null;
  campusSize: string | null;
  totalStudents: number | null;
  totalFaculty: number | null;
  totalCourses: number;
  website: string | null;
  description: string | null;
  imageUrl: string | null;
  logoUrl: string | null;
  createdAt: string | null;
};

export type Course = {
  id: number;
  collegeId: number;
  name: string;
  duration: string;
  fees: number;
  eligibility: string | null;
  degreeType: string;
  seatIntake: number | null;
};

export type Review = {
  id: number;
  collegeId: number;
  reviewerName: string;
  courseName: string | null;
  rating: number;
  comment: string;
  helpful: number;
  notHelpful: number;
  createdAt: string | null;
};

export type CollegeDetail = College & {
  courses: Course[];
  similarColleges: College[];
};

export type CollegeListResponse = {
  colleges: College[];
  total: number;
  page: number;
  totalPages: number;
};

export type ReviewsResponse = {
  reviews: Review[];
  total: number;
  avgRating: number;
  ratingBreakdown: Record<number, number>;
};

export type CompareCollege = College & {
  courses: Course[];
};

export type WinnerResponse = {
  winnerId: number;
  winnerName: string;
  scores: Array<{ collegeId: number; name: string; score: number }>;
};

export type PredictorResponse = {
  predictions: Array<{
    collegeId: number;
    collegeName: string;
    collegeSlug: string;
    location: string;
    courseName: string;
    matchScore: number;
    chances: "high" | "medium" | "low";
    closingRank: number | null;
    feesMin: number;
    rating: number;
  }>;
  total: number;
  input: { exam: Exam; rank: number; category: Category };
};

export type CollegeListParams = {
  search?: string;
  location?: string[];
  city?: string[];
  ownership?: Ownership[];
  feesMin?: number;
  feesMax?: number;
  rating?: number;
  page?: number;
  limit?: number;
  sortBy?: SortBy;
};

export type ReviewInput = {
  reviewerName: string;
  courseName?: string;
  rating: number;
  comment: string;
};

export type PredictorInput = {
  exam: Exam;
  rank: number;
  category: Category;
  state?: string;
  courseType?: string;
};

function apiUrl(path: string, params?: Record<string, string | number | string[] | undefined>) {
  const url = new URL(`${apiBaseUrl}/api${path}`, window.location.origin);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined) continue;
    url.searchParams.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }

  return `${url.pathname}${url.search}${url.hash}`.startsWith("/api") && !apiBaseUrl
    ? `${url.pathname}${url.search}${url.hash}`
    : url.toString();
}

async function apiRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function usePopularColleges(limit = 8) {
  return useQuery({
    queryKey: ["colleges", "popular", limit],
    queryFn: () => apiRequest<College[]>(apiUrl("/colleges/popular", { limit })),
  });
}

export function useColleges(params: CollegeListParams, enabled = true) {
  return useQuery({
    queryKey: ["colleges", "list", params],
    queryFn: () => apiRequest<CollegeListResponse>(apiUrl("/colleges", params)),
    enabled,
  });
}

export function useLocations() {
  return useQuery({
    queryKey: ["colleges", "locations"],
    queryFn: () => apiRequest<Array<{ state: string; count: number }>>(apiUrl("/colleges/locations")),
  });
}

export function useCities() {
  return useQuery({
    queryKey: ["colleges", "cities"],
    queryFn: () => apiRequest<Array<{ city: string; count: number }>>(apiUrl("/colleges/cities")),
  });
}

export function useCollegeDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["colleges", "detail", slug],
    queryFn: () => apiRequest<CollegeDetail | null>(apiUrl(`/colleges/${slug}`)),
    enabled: !!slug,
  });
}

export function useReviews(collegeId: number | undefined, page = 1, limit = 10) {
  return useQuery({
    queryKey: ["reviews", collegeId, page, limit],
    queryFn: () => apiRequest<ReviewsResponse>(apiUrl(`/colleges/${collegeId}/reviews`, { page, limit })),
    enabled: !!collegeId,
  });
}

export function useCreateReview(collegeId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReviewInput) =>
      apiRequest<{ success: true }>(apiUrl(`/colleges/${collegeId}/reviews`), {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reviews", collegeId] });
    },
  });
}

export function useCompareColleges(ids: number[]) {
  return useQuery({
    queryKey: ["compare", "colleges", ids],
    queryFn: () => apiRequest<CompareCollege[]>(apiUrl("/compare", { ids: ids.join(",") })),
    enabled: ids.length >= 2,
  });
}

export function useCompareWinner(ids: number[]) {
  return useQuery({
    queryKey: ["compare", "winner", ids],
    queryFn: () => apiRequest<WinnerResponse | null>(apiUrl("/compare/winner", { ids: ids.join(",") })),
    enabled: ids.length >= 2,
  });
}

export function usePredictor() {
  return useMutation({
    mutationFn: (input: PredictorInput) =>
      apiRequest<PredictorResponse>(apiUrl("/predictor"), {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}
