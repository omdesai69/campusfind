import { useState } from "react";
import { Link } from "react-router-dom";
import { usePredictor, type Category, type Exam } from "@/lib/api";
import {
  ArrowLeft, GraduationCap, AlertCircle,
  MapPin, Star, ChevronRight
} from "lucide-react";

const EXAMS = ["JEE Main", "NEET", "CAT", "GATE", "BITSAT", "MHT CET"] as const;
const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"] as const;

export default function Predictor() {
  const [exam, setExam] = useState<Exam>("JEE Main");
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState<Category>("General");
  const [state, setState] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const predictor = usePredictor();
  const predictions = predictor.data;
  const isLoading = predictor.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rank || isNaN(parseInt(rank)) || parseInt(rank) < 1) return;
    setSubmitted(true);
    predictor.mutate({
      exam,
      rank: parseInt(rank),
      category,
      state: state || undefined,
    });
  };

  const handleReset = () => {
    setSubmitted(false);
    setRank("");
    setState("");
    predictor.reset();
  };

  return (
    <div className="pt-[76px] min-h-screen bg-[#141414]">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
        <Link to="/" className="text-[#A1A1AA] text-[13px] flex items-center gap-1.5 mb-8 hover:text-[#FAFAFA] transition-colors w-fit">
          <ArrowLeft size={14} /> Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-[rgba(212,168,67,0.12)] rounded-xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={28} className="text-[#D4A843]" />
          </div>
          <h1 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[28px]">
            College Predictor
          </h1>
          <p className="text-[#71717A] text-[14px] mt-2">
            Enter your exam details to get personalized college predictions
          </p>
        </div>

        {/* Form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="max-w-[480px] mx-auto">
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] p-6 sm:p-8 space-y-5">
              {/* Exam */}
              <div>
                <label className="text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em] block mb-2">
                  Select Exam *
                </label>
                <select
                  value={exam}
                  onChange={(e) => setExam(e.target.value as Exam)}
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded-lg h-12 px-4 text-[#FAFAFA] text-[14px] outline-none focus:border-[#D4A843] transition-colors appearance-none"
                >
                  {EXAMS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              {/* Rank */}
              <div>
                <label className="text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em] block mb-2">
                  Your Rank *
                </label>
                <input
                  type="number"
                  min={1}
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  placeholder="Enter your rank (e.g., 15000)"
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded-lg h-12 px-4 text-[#FAFAFA] text-[14px] placeholder:text-[#71717A] outline-none focus:border-[#D4A843] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                />
                {rank && (isNaN(parseInt(rank)) || parseInt(rank) < 1) && (
                  <p className="text-[#EF4444] text-[12px] mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} /> Please enter a valid rank (positive number)
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em] block mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded-lg h-12 px-4 text-[#FAFAFA] text-[14px] outline-none focus:border-[#D4A843] transition-colors appearance-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* State Preference (optional) */}
              <div>
                <label className="text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em] block mb-2">
                  Preferred State <span className="text-[#71717A]/60">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g., Maharashtra, Tamil Nadu"
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded-lg h-12 px-4 text-[#FAFAFA] text-[14px] placeholder:text-[#71717A] outline-none focus:border-[#D4A843] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={!rank || isNaN(parseInt(rank)) || parseInt(rank) < 1}
                className="w-full bg-[#D4A843] text-[#141414] h-12 rounded-lg text-[14px] font-semibold hover:bg-[#C49A3B] transition-all duration-200 disabled:opacity-40 mt-2"
              >
                Predict My Colleges
              </button>
            </div>
          </form>
        ) : (
          <div>
            {/* Summary Bar */}
            <div className="bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="bg-[rgba(212,168,67,0.12)] text-[#D4A843] px-3 py-1.5 rounded-lg text-[13px] font-medium">
                  {exam}
                </span>
                <span className="text-[#A1A1AA] text-[13px]">
                  Rank: <span className="text-[#FAFAFA] font-medium">{parseInt(rank).toLocaleString()}</span>
                </span>
                <span className="text-[#A1A1AA] text-[13px]">
                  Category: <span className="text-[#FAFAFA] font-medium">{category}</span>
                </span>
                {state && (
                  <span className="text-[#A1A1AA] text-[13px]">
                    State: <span className="text-[#FAFAFA] font-medium">{state}</span>
                  </span>
                )}
              </div>
              <button
                onClick={handleReset}
                className="text-[#D4A843] text-[13px] font-medium hover:underline"
              >
                New Prediction
              </button>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin-slow w-8 h-8 border-2 border-[#2A2A2A] border-t-[#D4A843] rounded-full" />
              </div>
            )}

            {/* Results */}
            {!isLoading && predictions && (
              <>
                {predictions.total === 0 ? (
                  <div className="text-center py-16">
                    <AlertCircle size={48} className="text-[#71717A] mx-auto mb-4 opacity-50" />
                    <h3 className="text-[#FAFAFA] text-[16px] font-medium mb-2">No colleges found</h3>
                    <p className="text-[#71717A] text-[13px] mb-4">
                      No colleges match your rank and category. Try with a different rank or category.
                    </p>
                    <button
                      onClick={handleReset}
                      className="text-[#D4A843] text-[13px] font-medium hover:underline"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[#71717A] text-[13px] mb-4">
                      Found <span className="text-[#FAFAFA] font-medium">{predictions.total}</span> colleges matching your criteria
                    </p>

                    {predictions.predictions?.map((pred: any, idx: number) => (
                      <Link
                        key={idx}
                        to={`/colleges/${pred.collegeSlug}`}
                        className="flex items-center gap-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 sm:p-5 hover:border-[#3A3A3A] hover:shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-all group"
                      >
                        {/* Match Circle */}
                        <div className="relative w-14 h-14 shrink-0">
                          <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                            <circle cx="18" cy="18" r="15" fill="none" stroke="#2A2A2A" strokeWidth="3" />
                            <circle
                              cx="18" cy="18" r="15" fill="none"
                              stroke="#D4A843" strokeWidth="3"
                              strokeDasharray={`${pred.matchScore} ${100 - pred.matchScore}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="font-['JetBrains_Mono'] text-[#FAFAFA] text-[13px] font-medium">
                              {pred.matchScore}%
                            </span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[#FAFAFA] text-[14px] font-medium truncate group-hover:text-[#D4A843] transition-colors">
                            {pred.collegeName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin size={11} className="text-[#71717A]" />
                            <span className="text-[#71717A] text-[12px]">{pred.location}</span>
                            <span className="text-[#2A2A2A]">|</span>
                            <Star size={11} className="text-[#D4A843] fill-[#D4A843]" />
                            <span className="text-[#A1A1AA] text-[12px]">{pred.rating}</span>
                            <span className="text-[#2A2A2A]">|</span>
                            <span className="text-[#A1A1AA] text-[12px]">
                              ₹{(pred.feesMin / 100000).toFixed(1)}L/yr
                            </span>
                          </div>
                        </div>

                        {/* Chances Badge */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                              pred.chances === "high"
                                ? "bg-[rgba(34,197,94,0.15)] text-[#22C55E]"
                                : pred.chances === "medium"
                                ? "bg-[rgba(245,158,11,0.15)] text-[#F59E0B]"
                                : "bg-[rgba(239,68,68,0.15)] text-[#EF4444]"
                            }`}
                          >
                            {pred.chances === "high" ? "High Chance" : pred.chances === "medium" ? "Medium" : "Low"}
                          </span>
                          {pred.closingRank && (
                            <span className="text-[#71717A] text-[10px]">
                              Closing: {pred.closingRank.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <ChevronRight size={16} className="text-[#71717A] shrink-0 group-hover:text-[#D4A843] transition-colors" />
                      </Link>
                    ))}
                  </div>
                )}

                {/* Disclaimer */}
                <p className="text-[#71717A] text-[12px] text-center mt-8 pt-6 border-t border-[#2A2A2A]">
                  Predictions are based on previous year cutoff data and are indicative only.
                  Actual admissions may vary based on multiple factors.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
