import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, Star, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { type Ownership, type SortBy, useColleges, useLocations, useCities } from "@/lib/api";

const OWNERSHIP_OPTIONS = ["government", "private", "deemed"] as const;
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Rating" },
  { value: "fees_asc", label: "Fees: Low to High" },
  { value: "fees_desc", label: "Fees: High to Low" },
  { value: "placement", label: "Placement %" },
];

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

const CollegeCard = memo(function CollegeCard({ college }: { college: any }) {
  const tags = college.totalCourses > 10
    ? ["Engineering", "Science"]
    : college.feesMin < 100000
    ? ["Medical", "Healthcare"]
    : college.feesMin > 1000000
    ? ["Management", "Business"]
    : ["Engineering", "Technology"];

  return (
    <Link
      to={`/colleges/${college.slug}`}
      className="group bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_2px_6px_rgba(0,0,0,0.35),0_8px_24px_rgba(0,0,0,0.25)] flex flex-col"
    >
      <div className="aspect-[16/10] overflow-hidden shrink-0">
        <img
          src={college.imageUrl || undefined}
          alt={college.name}
          width={600}
          height={375}
          className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
          style={{ filter: "saturate(0.8) brightness(0.95)" }}
          loading="lazy"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[15px] line-clamp-2 min-h-[2.6em]">
          {college.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1.5">
          <MapPin size={12} className="text-[#71717A] shrink-0" />
          <span className="text-[#71717A] text-[12px] truncate">{college.location}, {college.state}</span>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-[#D4A843] fill-[#D4A843]" />
            <span className="text-[#FAFAFA] text-[12px] font-medium">{college.rating}</span>
          </div>
          <div className="text-[#A1A1AA] text-[12px]">
            ₹{(college.feesMin / 100000).toFixed(1)}L/yr
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          {college.placementPercentage && (
            <span className="text-[#22C55E] text-[11px] font-medium">
              {college.placementPercentage}% placed
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="bg-[rgba(212,168,67,0.12)] text-[#D4A843] px-2 py-0.5 rounded-full text-[10px] font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="mt-auto pt-3 text-[#D4A843] text-[12px] font-medium flex items-center gap-1">
          View Details →
        </span>
      </div>
    </Link>
  );
});

// Filter Accordion
const FilterSection = memo(function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#2A2A2A] py-3">
      <button className="w-full flex items-center justify-between cursor-pointer" onClick={() => setOpen(!open)}>
        <span className="text-[#FAFAFA] text-[13px] font-semibold">{title}</span>
        <ChevronDown size={16} className={`text-[#71717A] transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pt-3">{children}</div>}
    </div>
  );
});

export default function CollegeListing() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [selectedOwnership, setSelectedOwnership] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      if (searchInput !== initialSearch) {
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, initialSearch]);

  const { data: collegesData, isLoading, isError } = useColleges({
    search: search || undefined,
    location: selectedStates.length > 0 ? selectedStates : undefined,
    city: selectedCities.length > 0 ? selectedCities : undefined,
    ownership: selectedOwnership.length > 0 ? (selectedOwnership as Ownership[]) : undefined,
    page,
    limit: 24,
    sortBy: sortBy as SortBy,
  });

  const { data: locations } = useLocations();
  const { data: cities } = useCities();

  const toggleState = useCallback((state: string) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
    setPage(1);
  }, []);

  const toggleOwnership = useCallback((o: string) => {
    setSelectedOwnership((prev) =>
      prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]
    );
    setPage(1);
  }, []);

  const toggleCity = useCallback((city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setSelectedStates([]);
    setSelectedCities([]);
    setSelectedOwnership([]);
    setSortBy("relevance");
    setPage(1);
  }, []);

  const hasFilters = search || selectedStates.length > 0 || selectedCities.length > 0 || selectedOwnership.length > 0;

  // Filter sidebar content
  const filterContentNode = useMemo(() => (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#FAFAFA] text-[14px] font-semibold flex items-center gap-2">
          <SlidersHorizontal size={16} /> Filters
        </h3>
        {hasFilters && (
          <button onClick={clearFilters} className="text-[#D4A843] text-[12px] font-medium hover:underline">
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <FilterSection title="Search">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            placeholder="College name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-[#141414] border border-[#2A2A2A] rounded-lg h-9 pl-9 pr-3 text-[13px] text-[#FAFAFA] placeholder:text-[#71717A] outline-none focus:border-[#3A3A3A] focus-visible:ring-1 focus-visible:ring-[#D4A843]"
          />
        </div>
      </FilterSection>

      {/* State */}
      <FilterSection title="State">
        <div className="mb-2">
          <input
            type="text"
            placeholder="Search state..."
            value={stateSearch}
            onChange={(e) => setStateSearch(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded h-8 pl-2 pr-2 text-[12px] text-[#FAFAFA] placeholder:text-[#71717A] outline-none focus:border-[#3A3A3A]"
          />
        </div>
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
          {locations?.filter(loc => loc.state.toLowerCase().includes(stateSearch.toLowerCase())).map((loc) => (
            <label key={loc.state} className="flex items-center gap-2.5 cursor-pointer py-1 group">
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedStates.includes(loc.state)}
                onChange={() => toggleState(loc.state)}
              />
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors group-focus-within:ring-2 group-focus-within:ring-[#D4A843] group-focus-within:ring-offset-1 group-focus-within:ring-offset-[#1E1E1E] ${
                  selectedStates.includes(loc.state)
                    ? "bg-[#D4A843] border-[#D4A843]"
                    : "border-[#3A3A3A]"
                }`}
              >
                {selectedStates.includes(loc.state) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </div>
              <span className="text-[#A1A1AA] text-[12px] flex-1">{loc.state}</span>
              <span className="text-[#71717A] text-[11px]">{loc.count}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* City */}
      <FilterSection title="City">
        <div className="mb-2">
          <input
            type="text"
            placeholder="Search city..."
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded h-8 pl-2 pr-2 text-[12px] text-[#FAFAFA] placeholder:text-[#71717A] outline-none focus:border-[#3A3A3A]"
          />
        </div>
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
          {cities?.filter(c => c.city.toLowerCase().includes(citySearch.toLowerCase())).map((c) => (
            <label key={c.city} className="flex items-center gap-2.5 cursor-pointer py-1 group">
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedCities.includes(c.city)}
                onChange={() => toggleCity(c.city)}
              />
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors group-focus-within:ring-2 group-focus-within:ring-[#D4A843] group-focus-within:ring-offset-1 group-focus-within:ring-offset-[#1E1E1E] ${
                  selectedCities.includes(c.city)
                    ? "bg-[#D4A843] border-[#D4A843]"
                    : "border-[#3A3A3A]"
                }`}
              >
                {selectedCities.includes(c.city) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </div>
              <span className="text-[#A1A1AA] text-[12px] flex-1 truncate">{c.city}</span>
              <span className="text-[#71717A] text-[11px]">{c.count}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Ownership */}
      <FilterSection title="Ownership">
        <div className="space-y-1.5">
          {OWNERSHIP_OPTIONS.map((o) => (
            <label key={o} className="flex items-center gap-2.5 cursor-pointer py-1 group">
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedOwnership.includes(o)}
                onChange={() => toggleOwnership(o)}
              />
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors group-focus-within:ring-2 group-focus-within:ring-[#D4A843] group-focus-within:ring-offset-1 group-focus-within:ring-offset-[#1E1E1E] ${
                  selectedOwnership.includes(o)
                    ? "bg-[#D4A843] border-[#D4A843]"
                    : "border-[#3A3A3A]"
                }`}
              >
                {selectedOwnership.includes(o) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </div>
              <span className="text-[#A1A1AA] text-[12px] capitalize">{o}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  ), [hasFilters, clearFilters, searchInput, stateSearch, locations, selectedStates, toggleState, citySearch, cities, selectedCities, toggleCity, selectedOwnership, toggleOwnership]);

  return (
    <div className="pt-[76px] min-h-screen bg-[#141414]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[24px]">
              All Colleges
            </h1>
            <p className="text-[#71717A] text-[13px] mt-0.5">
              {isLoading
                ? "Loading..."
                : `Showing ${((page - 1) * 24) + 1}-${Math.min(page * 24, collegesData?.total || 0)} of ${collegesData?.total || 0} colleges`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden flex items-center gap-2 bg-[#1E1E1E] border border-[#2A2A2A] text-[#A1A1AA] px-4 py-2 rounded-lg text-[13px]"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#1E1E1E] border border-[#2A2A2A] text-[#FAFAFA] px-3 py-2 rounded-lg text-[13px] outline-none focus:border-[#3A3A3A]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[260px] shrink-0 sticky top-[76px] self-start bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] p-4 max-h-[calc(100vh-100px)] overflow-y-auto">
            {filterContentNode}
          </aside>

          {/* Results Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : isError ? (
              <div className="text-center py-20 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl">
                <h3 className="text-[#FAFAFA] font-medium text-[16px] mb-2">Could not load colleges</h3>
                <p className="text-[#71717A] text-[13px]">Check the API and PostgreSQL connection, then refresh this page.</p>
              </div>
            ) : collegesData?.colleges.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-[#71717A] mb-3">
                  <Search size={48} className="mx-auto opacity-50" />
                </div>
                <h3 className="text-[#FAFAFA] font-medium text-[16px] mb-2">No colleges match your filters</h3>
                <p className="text-[#71717A] text-[13px] mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearFilters}
                  className="text-[#D4A843] text-[13px] font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {collegesData?.colleges.map((college) => (
                    <CollegeCard key={college.id} college={college} />
                  ))}
                </div>

                {/* Pagination */}
                {collegesData && collegesData.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg text-[13px] text-[#A1A1AA] disabled:opacity-40 hover:border-[#3A3A3A] transition-colors"
                    >
                      Prev
                    </button>
                    {(() => {
                      let start = Math.max(1, page - 2);
                      let end = Math.min(collegesData.totalPages, start + 4);
                      if (end - start < 4) {
                        start = Math.max(1, end - 4);
                      }
                      return Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-lg text-[13px] font-medium transition-colors ${
                            page === p
                              ? "bg-[#D4A843] text-[#141414]"
                              : "bg-[#1E1E1E] border border-[#2A2A2A] text-[#A1A1AA] hover:border-[#3A3A3A]"
                          }`}
                        >
                          {p}
                        </button>
                      ));
                    })()}
                    <button
                      onClick={() => setPage((p) => Math.min(collegesData.totalPages, p + 1))}
                      disabled={page === collegesData.totalPages}
                      className="px-4 py-2 bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg text-[13px] text-[#A1A1AA] disabled:opacity-40 hover:border-[#3A3A3A] transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-[#1E1E1E] shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#FAFAFA] font-semibold">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-[#71717A] hover:text-[#FAFAFA]">
                <X size={20} />
              </button>
            </div>
            {filterContentNode}
          </div>
        </div>
      )}
    </div>
  );
}
