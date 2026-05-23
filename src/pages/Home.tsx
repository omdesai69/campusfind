import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Star, ArrowRight, CheckCircle, GraduationCap, Trophy, X } from "lucide-react";
import { usePopularColleges, useColleges, useCities } from "@/lib/api";
import ParticleWave from "@/components/ParticleWave";
import { useState, useEffect, useRef, memo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// College Card Component
const CollegeCard = memo(function CollegeCard({ college }: { college: any }) {
  const tags = college.totalCourses > 10
    ? ["Engineering", "Science", "Research"]
    : college.feesMin < 100000
    ? ["Medical", "Healthcare"]
    : college.feesMin > 1000000
    ? ["Management", "Business"]
    : ["Engineering", "Technology"];

  return (
    <Link
      to={`/colleges/${college.slug}`}
      className="group bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_2px_6px_rgba(0,0,0,0.35),0_8px_24px_rgba(0,0,0,0.25)]"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={college.imageUrl || undefined}
          alt={college.name}
          className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
          style={{ filter: "saturate(0.8) brightness(0.95)" }}
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[15px] truncate">
          {college.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1.5">
          <MapPin size={13} className="text-[#71717A] shrink-0" />
          <span className="text-[#71717A] text-[12px]">{college.location}, {college.state}</span>
        </div>
        <div className="flex items-center gap-4 mt-2.5">
          <div className="flex items-center gap-1">
            <Star size={13} className="text-[#D4A843] fill-[#D4A843]" />
            <span className="text-[#FAFAFA] text-[12px] font-medium">{college.rating}</span>
          </div>
          <div className="text-[#A1A1AA] text-[12px]">
            ₹{(college.feesMin / 100000).toFixed(1)}L - ₹{(college.feesMax / 100000).toFixed(1)}L
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="bg-[rgba(212,168,67,0.12)] text-[#D4A843] px-2.5 py-0.5 rounded-full text-[11px] font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2A2A2A]">
          <span className="text-[#D4A843] text-[12px] font-medium flex items-center gap-1 group-hover:gap-1.5 transition-all">
            View Details <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
});

// Skeleton Card
const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] overflow-hidden">
      <div className="aspect-[16/10] animate-shimmer" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 animate-shimmer rounded w-3/4" />
        <div className="h-3 animate-shimmer rounded w-1/2" />
        <div className="flex gap-4 mt-2">
          <div className="h-3 animate-shimmer rounded w-12" />
          <div className="h-3 animate-shimmer rounded w-16" />
        </div>
        <div className="flex gap-1.5 mt-2">
          <div className="h-5 animate-shimmer rounded-full w-16" />
          <div className="h-5 animate-shimmer rounded-full w-14" />
        </div>
      </div>
    </div>
  );
});

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { data: popularColleges, isLoading, isError } = usePopularColleges(8);

  const heroRef = useRef<HTMLDivElement>(null);
  const popularRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const predictorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(
        ".hero-content",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.3 }
      );

      // Stats animation
      gsap.fromTo(
        ".hero-stat",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.15, delay: 0.6 }
      );

      // Scroll-triggered sections
      [popularRef, compareRef, predictorRef].forEach((ref) => {
        if (!ref.current) return;
        const items = ref.current.querySelectorAll(".reveal-item");
        gsap.set(items, { opacity: 0, y: 20 });
        ScrollTrigger.create({
          trigger: ref.current,
          start: "top 85%",
          onEnter: () => {
            gsap.to(items, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.08 });
          },
          once: true,
        });
      });
    });

    return () => ctx.revert();
  }, [popularColleges]);

  const handleSearch = (query = searchQuery) => {
    if (query.trim()) {
      navigate(`/colleges?search=${encodeURIComponent(query)}`);
    }
  };

  const { data: searchResults } = useColleges(
    { search: searchQuery, limit: 10 },
    searchQuery.trim().length > 1
  );

  const { data: allCollegesData } = useColleges({ limit: 1 });
  const { data: citiesData } = useCities();

  const totalColleges = allCollegesData?.total || 0;
  const totalCities = citiesData?.length || 0;

  const quickTags = ["IIT", "NIT", "Private", "Medical", "MBA"];

  return (
    <div>
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[100dvh] flex items-end pb-16 sm:pb-20 overflow-x-clip">
        <ParticleWave />

        {/* Gradient overlay for text readability */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(20,20,20,0.95) 0%, rgba(20,20,20,0.7) 40%, transparent 70%)",
          }}
        />

        <div className="relative z-[2] w-full max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="hero-content max-w-[600px] relative z-50">
            <p className="text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em] mb-4">
              FIND YOUR PERFECT COLLEGE
            </p>
            <h1 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] leading-[1.05] tracking-[-0.04em] text-[clamp(2.2rem,5vw,3.8rem)]">
              Discover. <span className="text-[#D4A843]">Compare.</span> Decide.
            </h1>
            <p className="text-[#A1A1AA] text-[15px] leading-relaxed mt-4 max-w-[500px]">
              Search from 30+ top colleges across India. Filter by rank, fees, location, and placement. Make the right choice with data.
            </p>

            {/* Search Bar */}
            <div className="mt-8 relative max-w-[540px] z-50">
              <div className="bg-[rgba(30,30,30,0.95)] border border-[#2A2A2A] rounded-xl h-14 flex items-center px-4 gap-3 focus-within:border-[#3A3A3A] transition-colors">
                <Search size={20} className="text-[#71717A] shrink-0" />
                <input
                  type="text"
                  placeholder="Search colleges, courses, exams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 bg-transparent border-none outline-none text-[#FAFAFA] text-[15px] placeholder:text-[#71717A]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-[#71717A] hover:text-[#FAFAFA] p-1 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleSearch()}
                  className="bg-[#D4A843] text-[#141414] px-6 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#C49A3B] transition-all duration-200 shrink-0"
                >
                  Search
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {searchQuery.trim().length > 1 && searchResults?.colleges && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl shadow-2xl overflow-hidden z-50">
                  {searchResults.colleges.length > 0 ? (
                    <>
                      <ul className="max-h-[400px] overflow-y-auto">
                        {searchResults.colleges.map((college) => (
                          <li key={college.id}>
                            <button
                              onClick={() => {
                                setSearchQuery(college.name);
                                navigate(`/colleges/${college.slug}`);
                              }}
                              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2A] transition-colors border-b border-[#2A2A2A] last:border-0"
                            >
                              <img 
                                src={college.imageUrl || undefined} 
                                alt={college.name}
                                className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-[#FAFAFA] text-[14px] font-medium truncate">{college.name}</p>
                                <p className="text-[#71717A] text-[12px] truncate">{college.location}, {college.state}</p>
                              </div>
                              {college.nirfRank && (
                                <span className="text-[#D4A843] text-[11px] font-semibold bg-[rgba(212,168,67,0.12)] px-2 py-0.5 rounded-full shrink-0">
                                  #{college.nirfRank}
                                </span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                      {searchResults.total > searchResults.colleges.length && (
                        <button
                          onClick={() => handleSearch()}
                          className="w-full text-center px-4 py-3 text-[#D4A843] text-[13px] font-medium hover:bg-[#2A2A2A] transition-colors border-t border-[#2A2A2A]"
                        >
                          View all {searchResults.total} results →
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-4 text-[#A1A1AA] text-[13px] text-center">
                      No colleges found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/colleges?search=${tag}`)}
                  className="bg-[rgba(212,168,67,0.12)] border border-[rgba(212,168,67,0.25)] text-[#D4A843] px-3.5 py-1.5 rounded-full text-[12px] font-medium hover:bg-[rgba(212,168,67,0.2)] transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-8 sm:gap-12 mt-12 sm:mt-16">
            {[
              { value: totalColleges > 0 ? totalColleges.toString() : "200", label: "Colleges Listed" },
              { value: totalCities > 0 ? totalCities.toString() : "90", label: "Cities Covered" },
              { value: "98%", label: "Data Accuracy" },
            ].map((stat, i) => (
              <div key={i} className="hero-stat">
                <div className="font-['JetBrains_Mono'] text-[#D4A843] text-[clamp(1.5rem,3vw,1.75rem)]">
                  {stat.value}
                </div>
                <div className="text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em] mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Colleges Section */}
      <section ref={popularRef} className="py-20 bg-[#141414]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10 reveal-item">
            <div>
              <h2 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[1.75rem] tracking-[-0.03em]">
                Popular Colleges
              </h2>
              <p className="text-[#71717A] text-[13px] mt-1">Most searched institutions this month</p>
            </div>
            <Link
              to="/colleges"
              className="text-[#D4A843] text-[13px] font-medium hover:underline flex items-center gap-1 shrink-0"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : isError ? (
              <div className="col-span-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 text-center reveal-item">
                <p className="text-[#FAFAFA] text-[15px] font-medium">College data is not connected yet.</p>
                <p className="text-[#71717A] text-[13px] mt-1">Set a PostgreSQL DATABASE_URL and seed the database, then refresh.</p>
              </div>
            ) : (
              popularColleges?.map((college) => (
                <div key={college.id} className="reveal-item">
                  <CollegeCard college={college} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Compare CTA Section */}
      <section ref={compareRef} className="py-16 bg-gradient-to-b from-[#1E1E1E] to-[#232323]">
        <div className="max-w-[640px] mx-auto px-4 sm:px-6 text-center">
          <div className="reveal-item">
            <Trophy size={40} className="text-[#D4A843] mx-auto mb-5" />
            <h2 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[1.75rem] tracking-[-0.03em]">
              Can't Decide? Compare Side-by-Side
            </h2>
            <p className="text-[#A1A1AA] text-[15px] leading-relaxed mt-4">
              Select up to 4 colleges and see a detailed comparison of fees, placements, rankings, and facilities.
            </p>
            <Link
              to="/compare"
              className="inline-block mt-6 bg-[#D4A843] text-[#141414] px-8 py-3.5 rounded-lg text-[14px] font-semibold hover:bg-[#C49A3B] transition-all duration-200 hover:-translate-y-0.5"
            >
              Start Comparing
            </Link>
          </div>
        </div>
      </section>

      {/* Predictor Teaser Section */}
      <section ref={predictorRef} className="py-20 bg-[#141414]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="reveal-item">
              <h2 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[1.75rem] tracking-[-0.03em]">
                Know Your Chances
              </h2>
              <p className="text-[#A1A1AA] text-[15px] leading-relaxed mt-4">
                Enter your exam rank and category to predict which colleges you can get into. Our algorithm analyzes cutoff data to give you personalized recommendations.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Supports JEE Main, NEET, CAT, GATE, BITSAT",
                  "Category-wise predictions (General, OBC, SC, ST, EWS)",
                  "Closing rank analysis for realistic expectations",
                  "Personalized college list sorted by match score",
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 reveal-item">
                    <CheckCircle size={18} className="text-[#22C55E] shrink-0 mt-0.5" />
                    <span className="text-[#A1A1AA] text-[14px]">{feature}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/predictor"
                className="inline-block mt-8 bg-[#D4A843] text-[#141414] px-8 py-3.5 rounded-lg text-[14px] font-semibold hover:bg-[#C49A3B] transition-all duration-200 hover:-translate-y-0.5"
              >
                Try Predictor
              </Link>
            </div>

            <div className="reveal-item">
              <div className="bg-[#1E1E1E] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.2)] border border-[#2A2A2A]">
                <div className="flex items-center gap-3 mb-5">
                  <GraduationCap size={24} className="text-[#D4A843]" />
                  <h3 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[16px]">
                    College Predictor
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[#71717A] text-[12px] font-semibold uppercase tracking-[0.08em] block mb-1.5">
                      Select Exam
                    </label>
                    <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg h-11 px-3 flex items-center text-[#A1A1AA] text-[14px]">
                      JEE Main
                    </div>
                  </div>
                  <div>
                    <label className="text-[#71717A] text-[12px] font-semibold uppercase tracking-[0.08em] block mb-1.5">
                      Your Rank
                    </label>
                    <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg h-11 px-3 flex items-center text-[#A1A1AA] text-[14px]">
                      15,000
                    </div>
                  </div>
                  <div>
                    <label className="text-[#71717A] text-[12px] font-semibold uppercase tracking-[0.08em] block mb-1.5">
                      Category
                    </label>
                    <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg h-11 px-3 flex items-center text-[#A1A1AA] text-[14px]">
                      General
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/predictor")}
                    className="w-full bg-[#D4A843] text-[#141414] h-11 rounded-lg text-[14px] font-semibold"
                  >
                    Predict My Colleges
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
