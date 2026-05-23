import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useColleges, useCompareColleges, useCompareWinner } from "@/lib/api";
import {
  ArrowLeft, X, Plus, Star, Trophy, MapPin, Calendar,
  Building2, DollarSign, TrendingUp, Users, BookOpen
} from "lucide-react";

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Parse IDs from URL
  useEffect(() => {
    const idsParam = searchParams.get("ids");
    if (idsParam) {
      const ids = idsParam.split(",").map(Number).filter(Boolean).slice(0, 4);
      setSelectedIds(ids);
    }
  }, [searchParams]);

  // Update URL when selection changes
  const updateSelection = (ids: number[]) => {
    setSelectedIds(ids);
    if (ids.length > 0) {
      setSearchParams({ ids: ids.join(",") });
    } else {
      setSearchParams({});
    }
  };

  const addCollege = (id: number) => {
    if (selectedIds.length < 4 && !selectedIds.includes(id)) {
      updateSelection([...selectedIds, id]);
    }
    setShowSelector(false);
  };

  const removeCollege = (id: number) => {
    updateSelection(selectedIds.filter((x) => x !== id));
  };

  const { data: compareData } = useCompareColleges(selectedIds);

  const { data: winnerData } = useCompareWinner(selectedIds);

  const { data: searchResults } = useColleges(
    {
      search: searchQuery || undefined,
      limit: 20,
    },
    showSelector && searchQuery.length > 0
  );

  const { data: allColleges } = useColleges({ limit: 30 }, showSelector || selectedIds.length > 0);

  const displayColleges = showSelector && searchQuery.length > 0 ? searchResults?.colleges : allColleges?.colleges;

  // Comparison rows
  const comparisonRows = [
    { label: "Location", key: "location", icon: MapPin, format: (v: any) => `${v.location}, ${v.state}` },
    { label: "Established", key: "established", icon: Calendar, format: (v: any) => v.established || "N/A" },
    { label: "Ownership", key: "ownership", icon: Building2, format: (v: any) => v.ownership ? v.ownership.charAt(0).toUpperCase() + v.ownership.slice(1) : "N/A" },
    { label: "NIRF Rank", key: "nirfRank", icon: Trophy, format: (v: any) => v.nirfRank ? `#${v.nirfRank}` : "N/A" },
    { label: "Rating", key: "rating", icon: Star, format: (v: any) => `${v.rating}/5` },
    { label: "Fees (Min)", key: "feesMin", icon: DollarSign, format: (v: any) => `₹${(v.feesMin / 100000).toFixed(1)}L` },
    { label: "Placement %", key: "placementPercentage", icon: TrendingUp, format: (v: any) => v.placementPercentage ? `${v.placementPercentage}%` : "N/A" },
    { label: "Avg Package", key: "avgPackage", icon: DollarSign, format: (v: any) => v.avgPackage ? `₹${(v.avgPackage / 100000).toFixed(0)}L` : "N/A" },
    { label: "Highest Package", key: "highestPackage", icon: DollarSign, format: (v: any) => v.highestPackage ? `₹${(v.highestPackage / 100000).toFixed(0)}L` : "N/A" },
    { label: "Students", key: "totalStudents", icon: Users, format: (v: any) => v.totalStudents?.toLocaleString() || "N/A" },
    { label: "Faculty", key: "totalFaculty", icon: Users, format: (v: any) => v.totalFaculty?.toLocaleString() || "N/A" },
    { label: "Courses", key: "totalCourses", icon: BookOpen, format: (v: any) => v.totalCourses || "N/A" },
    { label: "Campus", key: "campusSize", icon: Building2, format: (v: any) => v.campusSize || "N/A" },
  ];

  const getBestValue = (row: any, colleges: any[]) => {
    if (!colleges.length) return null;
    if (row.key === "feesMin") {
      return colleges.reduce((best, c) => (!best || c.feesMin < best.feesMin) ? c : best, null)?.id;
    }
    if (row.key === "nirfRank") {
      return colleges.reduce((best, c) => (!best || (c.nirfRank || 999) < (best.nirfRank || 999)) ? c : best, null)?.id;
    }
    if (row.key === "rating" || row.key === "placementPercentage" || row.key === "totalCourses" || row.key === "totalStudents" || row.key === "totalFaculty") {
      return colleges.reduce((best, c) => (!best || (c[row.key] || 0) > (best[row.key] || 0)) ? c : best, null)?.id;
    }
    return null;
  };

  // Selection view
  if (selectedIds.length < 2) {
    return (
      <div className="pt-[76px] min-h-screen bg-[#141414]">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-10">
          <Link to="/colleges" className="text-[#A1A1AA] text-[13px] flex items-center gap-1.5 mb-8 hover:text-[#FAFAFA] transition-colors w-fit">
            <ArrowLeft size={14} /> Back to colleges
          </Link>

          <div className="text-center mb-10">
            <h1 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[28px]">
              Compare Colleges
            </h1>
            <p className="text-[#71717A] text-[14px] mt-2">
              Select 2 to 4 colleges to see a detailed side-by-side comparison
            </p>
          </div>

          {/* Selected colleges */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-8 justify-center">
              {selectedIds.map((id) => {
                const college = allColleges?.colleges.find((c) => c.id === id);
                return college ? (
                  <div key={id} className="flex items-center gap-2 bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-4 py-2.5">
                    <img src={college.imageUrl || undefined} alt="" className="w-8 h-8 rounded object-cover" />
                    <span className="text-[#FAFAFA] text-[13px] font-medium">{college.name}</span>
                    <button onClick={() => removeCollege(id)} className="text-[#71717A] hover:text-[#EF4444] ml-1">
                      <X size={14} />
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}

          {/* Add button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowSelector(true)}
              disabled={selectedIds.length >= 4}
              className="flex items-center gap-2 bg-[#D4A843] text-[#141414] px-6 py-3 rounded-lg text-[14px] font-semibold hover:bg-[#C49A3B] transition-all disabled:opacity-40"
            >
              <Plus size={16} /> Add College ({selectedIds.length}/4)
            </button>
          </div>

          {/* Selector Modal */}
          {showSelector && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowSelector(false)} />
              <div className="relative bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] w-full max-w-[500px] max-h-[70vh] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <div className="p-4 border-b border-[#2A2A2A]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[#FAFAFA] font-medium">Select College</h3>
                    <button onClick={() => setShowSelector(false)} className="text-[#71717A] hover:text-[#FAFAFA]">
                      <X size={18} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Search colleges..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#141414] border border-[#2A2A2A] rounded-lg h-10 px-3 text-[#FAFAFA] text-[13px] placeholder:text-[#71717A] outline-none focus:border-[#3A3A3A]"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto max-h-[50vh]">
                  {displayColleges?.map((college) => (
                    <button
                      key={college.id}
                      onClick={() => addCollege(college.id)}
                      disabled={selectedIds.includes(college.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#232323] transition-colors border-b border-[#2A2A2A] last:border-0 ${
                        selectedIds.includes(college.id) ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                    >
                      <img src={college.imageUrl || undefined} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[#FAFAFA] text-[13px] font-medium truncate">{college.name}</p>
                        <p className="text-[#71717A] text-[11px]">{college.location}</p>
                      </div>
                      {selectedIds.includes(college.id) && <span className="text-[#22C55E] text-[11px] font-medium">Added</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <p className="text-center text-[#71717A] text-[13px]">
            Select at least 2 colleges to start comparing
          </p>
        </div>
      </div>
    );
  }

  // Comparison view
  return (
    <div className="pt-[76px] min-h-screen bg-[#141414]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/colleges" className="text-[#A1A1AA] text-[13px] flex items-center gap-1.5 mb-3 hover:text-[#FAFAFA] transition-colors w-fit">
              <ArrowLeft size={14} /> Back
            </Link>
            <h1 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[24px]">
              College Comparison
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSelector(true)}
              disabled={selectedIds.length >= 4}
              className="flex items-center gap-1.5 bg-[#1E1E1E] border border-[#2A2A2A] text-[#A1A1AA] px-4 py-2 rounded-lg text-[13px] hover:border-[#3A3A3A] disabled:opacity-40 transition-colors"
            >
              <Plus size={14} /> Add ({selectedIds.length}/4)
            </button>
          </div>
        </div>

        {/* Winner Banner */}
        {winnerData && (
          <div className="bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] rounded-lg px-5 py-4 mb-6 flex items-center gap-3">
            <Trophy size={20} className="text-[#22C55E]" />
            <span className="text-[#22C55E] text-[14px] font-medium">
              Best Overall: <span className="font-bold">{winnerData.winnerName}</span>
              <span className="text-[#22C55E]/70 ml-2">(Score: {winnerData.scores[0]?.score}/100)</span>
            </span>
          </div>
        )}

        {/* Comparison Table */}
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="text-left py-4 px-4 bg-[#141414] sticky left-0 z-10 w-[160px]">
                  <span className="text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em]">Attribute</span>
                </th>
                {compareData?.map((college) => (
                  <th key={college.id} className="text-center py-4 px-4 min-w-[180px]">
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={college.imageUrl || undefined}
                        alt=""
                        className="w-14 h-10 rounded object-cover"
                      />
                      <span className="text-[#FAFAFA] text-[13px] font-medium line-clamp-1 max-w-[160px]">{college.name}</span>
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-[#D4A843] fill-[#D4A843]" />
                        <span className="text-[#FAFAFA] text-[11px]">{college.rating}</span>
                      </div>
                      <button
                        onClick={() => removeCollege(college.id)}
                        className="text-[#71717A] text-[11px] hover:text-[#EF4444] transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, idx) => {
                const bestId = compareData ? getBestValue(row, compareData) : null;
                return (
                  <tr key={row.key} className={idx % 2 === 0 ? "bg-[#141414]" : "bg-[#1A1A1A]"}>
                    <td className="py-3.5 px-4 bg-[#141414] sticky left-0 z-10">
                      <span className="text-[#71717A] text-[12px] font-semibold flex items-center gap-1.5">
                        <row.icon size={13} /> {row.label}
                      </span>
                    </td>
                    {compareData?.map((college) => (
                      <td key={college.id} className="py-3.5 px-4 text-center">
                        <span className={`text-[13px] ${bestId === college.id ? "text-[#22C55E] font-medium" : "text-[#FAFAFA]"}`}>
                          {row.format(college)}
                        </span>
                        {bestId === college.id && (
                          <span className="ml-1.5 bg-[rgba(34,197,94,0.15)] text-[#22C55E] text-[10px] font-semibold px-1.5 py-0.5 rounded">
                            Best
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selector Modal */}
        {showSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowSelector(false)} />
            <div className="relative bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] w-full max-w-[500px] max-h-[70vh] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              <div className="p-4 border-b border-[#2A2A2A]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[#FAFAFA] font-medium">Select College</h3>
                  <button onClick={() => setShowSelector(false)} className="text-[#71717A] hover:text-[#FAFAFA]">
                    <X size={18} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Search colleges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded-lg h-10 px-3 text-[#FAFAFA] text-[13px] placeholder:text-[#71717A] outline-none focus:border-[#3A3A3A]"
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto max-h-[50vh]">
                {displayColleges?.map((college) => (
                  <button
                    key={college.id}
                    onClick={() => addCollege(college.id)}
                    disabled={selectedIds.includes(college.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#232323] transition-colors border-b border-[#2A2A2A] last:border-0 ${
                      selectedIds.includes(college.id) ? "opacity-40 cursor-not-allowed" : ""
                    }`}
                  >
                    <img src={college.imageUrl || undefined} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[#FAFAFA] text-[13px] font-medium truncate">{college.name}</p>
                      <p className="text-[#71717A] text-[11px]">{college.location}</p>
                    </div>
                    {selectedIds.includes(college.id) && <span className="text-[#22C55E] text-[11px] font-medium">Added</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
