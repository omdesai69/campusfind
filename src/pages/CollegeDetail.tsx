import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { type Review, useCollegeDetail, useCreateReview, useReviews } from "@/lib/api";
import {
  MapPin, Star, Calendar, Building2, Globe, Users, BookOpen,
  Award, ArrowLeft, ThumbsUp, ThumbsDown,
  TrendingUp, DollarSign
} from "lucide-react";

const TABS = ["Overview", "Courses", "Placements", "Reviews"] as const;

export default function CollegeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Overview");
  const [reviewerName, setReviewerName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittedReviews, setSubmittedReviews] = useState<Review[]>([]);
  const [reviewVotes, setReviewVotes] = useState<Record<number, { helpful: number; notHelpful: number }>>({});
  const [cooldown, setCooldown] = useState(false);

  const { data: college, isLoading } = useCollegeDetail(slug);
  const { data: reviewsData } = useReviews(college?.id, 1, 10);
  const createReview = useCreateReview(college?.id);

  const submitReview = (event: React.FormEvent) => {
    event.preventDefault();
    if (cooldown || !college || !reviewerName.trim() || reviewComment.trim().length < 10) return;

    createReview.mutate(
      {
        reviewerName: reviewerName.trim(),
        courseName: courseName.trim() || undefined,
        rating: reviewRating,
        comment: reviewComment.trim(),
      },
      {
        onSuccess: () => {
          setSubmittedReviews((current) => [
            {
              id: Date.now(),
              collegeId: college.id,
              reviewerName: reviewerName.trim(),
              courseName: courseName.trim() || null,
              rating: reviewRating,
              comment: reviewComment.trim(),
              helpful: 0,
              notHelpful: 0,
              createdAt: new Date().toISOString(),
            },
            ...current,
          ]);
          setReviewerName("");
          setCourseName("");
          setReviewRating(5);
          setReviewComment("");
          setCooldown(true);
          setTimeout(() => setCooldown(false), 60000);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="pt-[76px] min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin-slow w-8 h-8 border-2 border-[#2A2A2A] border-t-[#D4A843] rounded-full" />
      </div>
    );
  }

  if (!college) {
    return (
      <div className="pt-[76px] min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-[#FAFAFA] text-xl font-medium mb-2">College not found</h2>
          <Link to="/colleges" className="text-[#D4A843] hover:underline">Browse all colleges</Link>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "NIRF Rank", value: college.nirfRank ? `#${college.nirfRank}` : "N/A", icon: Award },
    { label: "Avg Fees", value: `₹${(college.feesMin / 100000).toFixed(1)}L`, icon: DollarSign },
    { label: "Placement", value: college.placementPercentage ? `${college.placementPercentage}%` : "N/A", icon: TrendingUp },
    { label: "Rating", value: `${college.rating}/5`, icon: Star },
  ];
  const visibleReviews = [...submittedReviews, ...(reviewsData?.reviews ?? [])];
  const reviewTotal = (reviewsData?.total ?? 0) + submittedReviews.length;

  const highlights = [
    { label: "Campus Size", value: college.campusSize || "N/A", icon: Building2 },
    { label: "Total Students", value: college.totalStudents?.toLocaleString() || "N/A", icon: Users },
    { label: "Total Faculty", value: college.totalFaculty?.toLocaleString() || "N/A", icon: BookOpen },
    { label: "Established", value: college.established?.toString() || "N/A", icon: Calendar },
    { label: "Ownership", value: college.ownership.charAt(0).toUpperCase() + college.ownership.slice(1), icon: Building2 },
    { label: "Website", value: college.website ? "Visit Site" : "N/A", icon: Globe, link: college.website },
  ];

  return (
    <div className="pt-[60px] min-h-screen bg-[#141414]">
      {/* Header Band */}
      <div className="bg-[#1E1E1E] border-b border-[#2A2A2A]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
          <Link to="/colleges" className="text-[#A1A1AA] text-[13px] flex items-center gap-1.5 mb-5 hover:text-[#FAFAFA] transition-colors w-fit">
            <ArrowLeft size={14} /> Back to colleges
          </Link>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-[200px] h-[130px] rounded-xl overflow-hidden shrink-0">
              <img
                src={college.imageUrl || undefined}
                alt={college.name}
                className="w-full h-full object-cover"
                style={{ filter: "saturate(0.8) brightness(0.95)" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[clamp(1.25rem,3vw,1.75rem)] leading-tight">
                {college.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[#71717A] text-[13px]">
                <span className="flex items-center gap-1"><MapPin size={13} /> {college.location}, {college.state}</span>
                <span className="text-[#2A2A2A]">|</span>
                <span>ESTD {college.established}</span>
                <span className="text-[#2A2A2A]">|</span>
                <span className="capitalize">{college.ownership}</span>
              </div>
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={15}
                      className={s <= Math.round(parseFloat(college.rating?.toString() || "0")) ? "text-[#D4A843] fill-[#D4A843]" : "text-[#2A2A2A]"}
                    />
                  ))}
                </div>
                <span className="text-[#FAFAFA] text-[13px] font-medium">{college.rating}/5</span>
                <span className="text-[#71717A] text-[12px]">({reviewTotal} reviews)</span>
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                <Link
                  to={`/compare?ids=${college.id}`}
                  className="bg-[#D4A843] text-[#141414] px-5 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#C49A3B] transition-all"
                >
                  Add to Compare
                </Link>
                <a
                  href={college.website || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[#2A2A2A] text-[#A1A1AA] px-5 py-2 rounded-lg text-[13px] hover:border-[#3A3A3A] hover:text-[#FAFAFA] transition-all"
                >
                  Visit Website
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[60px] bg-[#141414] border-b border-[#2A2A2A] z-30">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "text-[#FAFAFA] border-[#D4A843]"
                  : "text-[#71717A] border-transparent hover:text-[#A1A1AA]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {/* Overview */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            <div>
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat) => (
                  <div key={stat.label} className="bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] p-4 text-center">
                    <stat.icon size={18} className="text-[#D4A843] mx-auto mb-2" />
                    <div className="font-['JetBrains_Mono'] text-[#D4A843] text-[22px]">{stat.value}</div>
                    <div className="text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em] mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* About */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] p-5 mb-6">
                <h3 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[16px] mb-3">
                  About {college.name}
                </h3>
                <p className="text-[#A1A1AA] text-[14px] leading-relaxed">{college.description}</p>
              </div>

              {/* Highlights */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] p-5">
                <h3 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[16px] mb-4">
                  Key Highlights
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {highlights.map((h) => (
                    <div key={h.label} className="flex items-start gap-3">
                      <h.icon size={16} className="text-[#D4A843] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em]">
                          {h.label}
                        </div>
                        {h.link ? (
                          <a href={h.link} target="_blank" rel="noopener noreferrer" className="text-[#D4A843] text-[13px] hover:underline">
                            {h.value}
                          </a>
                        ) : (
                          <div className="text-[#FAFAFA] text-[13px] font-medium">{h.value}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Similar Colleges */}
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] p-5">
                <h3 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[15px] mb-4">
                  Similar Colleges
                </h3>
                <div className="space-y-3">
                  {college.similarColleges?.map((similar: any) => (
                    <Link
                      key={similar.id}
                      to={`/colleges/${similar.slug}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#232323] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <img src={similar.imageUrl || undefined} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#FAFAFA] text-[13px] font-medium truncate">{similar.name}</p>
                        <p className="text-[#71717A] text-[11px]">{similar.location}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star size={11} className="text-[#D4A843] fill-[#D4A843]" />
                        <span className="text-[#FAFAFA] text-[11px]">{similar.rating}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Courses */}
        {activeTab === "Courses" && (
          <div className="bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  <th className="text-left text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em] px-5 py-3">Course</th>
                  <th className="text-left text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em] px-5 py-3">Duration</th>
                  <th className="text-left text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em] px-5 py-3">Fees (1st Yr)</th>
                  <th className="text-left text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em] px-5 py-3">Eligibility</th>
                  <th className="text-left text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em] px-5 py-3">Seats</th>
                </tr>
              </thead>
              <tbody>
                {college.courses?.map((course: any, idx: number) => (
                  <tr key={course.id} className={`border-b border-[#2A2A2A] ${idx % 2 === 1 ? "bg-[#1A1A1A]" : ""} hover:bg-[#232323] transition-colors`}>
                    <td className="px-5 py-3.5 text-[#FAFAFA] text-[13px] font-medium">{course.name}</td>
                    <td className="px-5 py-3.5 text-[#A1A1AA] text-[13px]">{course.duration}</td>
                    <td className="px-5 py-3.5 text-[#FAFAFA] text-[13px]">
                      ₹{(course.fees / 100000).toFixed(1)}L
                      {idx === 0 && <span className="ml-2 bg-[rgba(34,197,94,0.15)] text-[#22C55E] text-[10px] font-semibold px-1.5 py-0.5 rounded">Lowest</span>}
                    </td>
                    <td className="px-5 py-3.5 text-[#A1A1AA] text-[13px]">{course.eligibility}</td>
                    <td className="px-5 py-3.5 text-[#FAFAFA] text-[13px]">{course.seatIntake}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Placements */}
        {activeTab === "Placements" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Highest Package", value: college.highestPackage ? `₹${(college.highestPackage / 100000).toFixed(0)}L` : "N/A", color: "#22C55E" },
                { label: "Average Package", value: college.avgPackage ? `₹${(college.avgPackage / 100000).toFixed(0)}L` : "N/A", color: "#D4A843" },
                { label: "Placement Rate", value: college.placementPercentage ? `${college.placementPercentage}%` : "N/A", color: "#3B82F6" },
                { label: "Total Students", value: college.totalStudents?.toLocaleString() || "N/A", color: "#A855F7" },
              ].map((s) => (
                <div key={s.label} className="bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] p-5 text-center">
                  <div className="font-['JetBrains_Mono'] text-[22px]" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em] mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Placement bar chart visualization */}
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] p-6">
              <h3 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[16px] mb-6">
                Placement Statistics
              </h3>
              <div className="space-y-4">
                {[100, 90, 80, 70].map((val, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-[#71717A] text-[12px] w-16 text-right">{2021 + i}</span>
                    <div className="flex-1 bg-[#2A2A2A] rounded-full h-5 overflow-hidden">
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{
                          width: `${val}%`,
                          background: `linear-gradient(90deg, #D4A843, #C49A3B)`,
                        }}
                      >
                        <span className="text-[#141414] text-[10px] font-semibold">{val}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews */}
        {activeTab === "Reviews" && (
          <div className="space-y-6">
            <form onSubmit={submitReview} className="bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                <div>
                  <h3 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[16px]">
                    Write a Review
                  </h3>
                  <p className="text-[#71717A] text-[12px] mt-1">
                    Share what helped you judge this college.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewRating(rating)}
                      className="p-1 text-[#2A2A2A] hover:text-[#D4A843] transition-colors"
                      aria-label={`${rating} star rating`}
                    >
                      <Star
                        size={20}
                        className={rating <= reviewRating ? "text-[#D4A843] fill-[#D4A843]" : "text-[#3A3A3A]"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em] block mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(event) => setReviewerName(event.target.value)}
                    maxLength={100}
                    className="w-full bg-[#141414] border border-[#2A2A2A] rounded-lg h-11 px-3 text-[#FAFAFA] text-[14px] placeholder:text-[#71717A] outline-none focus:border-[#D4A843] transition-colors"
                    placeholder="Name"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em] block mb-2">
                    Course
                  </label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(event) => setCourseName(event.target.value)}
                    maxLength={255}
                    className="w-full bg-[#141414] border border-[#2A2A2A] rounded-lg h-11 px-3 text-[#FAFAFA] text-[14px] placeholder:text-[#71717A] outline-none focus:border-[#D4A843] transition-colors"
                    placeholder="B.Tech CSE, MBA..."
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em] block mb-2">
                  Comment *
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded-lg px-3 py-3 text-[#FAFAFA] text-[14px] placeholder:text-[#71717A] outline-none focus:border-[#D4A843] transition-colors resize-none"
                  placeholder="Write at least 10 characters..."
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                <div className="min-h-5">
                  {createReview.isError && (
                    <p className="text-[#EF4444] text-[12px]">{createReview.error.message}</p>
                  )}
                  {createReview.isSuccess && (
                    <p className="text-[#22C55E] text-[12px]">Review submitted. Please wait 60s before submitting again.</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={cooldown || createReview.isPending || !reviewerName.trim() || reviewComment.trim().length < 10}
                  className="bg-[#D4A843] text-[#141414] px-6 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-[#C49A3B] transition-all disabled:opacity-40 disabled:hover:bg-[#D4A843]"
                >
                  {cooldown ? "Cooldown..." : createReview.isPending ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>

            {/* Rating Summary */}
            {reviewsData && (
              <div className="bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="text-center">
                    <div className="font-['JetBrains_Mono'] text-[#D4A843] text-[48px] leading-none">
                      {reviewsData.avgRating}
                    </div>
                    <div className="flex justify-center mt-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={16}
                          className={s <= Math.round(reviewsData.avgRating) ? "text-[#D4A843] fill-[#D4A843]" : "text-[#2A2A2A]"}
                        />
                      ))}
                    </div>
                    <p className="text-[#71717A] text-[12px] mt-1">{reviewTotal} reviews</p>
                  </div>
                  <div className="flex-1 w-full space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviewsData.ratingBreakdown[star] || 0;
                      const pct = reviewsData.total > 0 ? (count / reviewsData.total) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-[#71717A] text-[11px] w-3">{star}</span>
                          <Star size={10} className="text-[#D4A843] fill-[#D4A843]" />
                          <div className="flex-1 bg-[#2A2A2A] rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-[#D4A843] rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[#71717A] text-[11px] w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Review Cards */}
            {visibleReviews.map((review) => {
              const votes = reviewVotes[review.id] ?? { helpful: review.helpful, notHelpful: review.notHelpful };
              return (
              <div key={review.id} className="bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#232323] flex items-center justify-center font-['Space_Grotesk'] font-medium text-[#D4A843] text-[16px]">
                      {review.reviewerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[#FAFAFA] text-[14px] font-medium">{review.reviewerName}</p>
                      <p className="text-[#71717A] text-[12px]">
                        {review.courseName} · {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Recently"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={s <= review.rating ? "text-[#D4A843] fill-[#D4A843]" : "text-[#2A2A2A]"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[#A1A1AA] text-[14px] leading-relaxed mt-3">{review.comment}</p>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#2A2A2A]">
                  <button
                    className="flex items-center gap-1.5 text-[#71717A] text-[12px] hover:text-[#FAFAFA] transition-colors"
                    onClick={() =>
                      setReviewVotes((current) => ({
                        ...current,
                        [review.id]: { helpful: votes.helpful + 1, notHelpful: votes.notHelpful },
                      }))
                    }
                  >
                    <ThumbsUp size={13} /> {votes.helpful}
                  </button>
                  <button
                    className="flex items-center gap-1.5 text-[#71717A] text-[12px] hover:text-[#FAFAFA] transition-colors"
                    onClick={() =>
                      setReviewVotes((current) => ({
                        ...current,
                        [review.id]: { helpful: votes.helpful, notHelpful: votes.notHelpful + 1 },
                      }))
                    }
                  >
                    <ThumbsDown size={13} /> {votes.notHelpful}
                  </button>
                  {votes.helpful >= 10 && (
                    <span className="bg-[rgba(34,197,94,0.15)] text-[#22C55E] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Helpful
                    </span>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
