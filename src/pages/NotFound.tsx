import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="pt-[76px] min-h-screen bg-[#141414] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="font-['JetBrains_Mono'] text-[#D4A843] text-[72px] sm:text-[96px] font-bold leading-none mb-4">
          404
        </div>
        <h1 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[24px] sm:text-[28px] mb-3">
          Page Not Found
        </h1>
        <p className="text-[#71717A] text-[14px] max-w-[400px] mx-auto mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#D4A843] text-[#141414] px-6 py-3 rounded-lg text-[14px] font-semibold hover:bg-[#C49A3B] transition-all duration-200 hover:-translate-y-0.5"
          >
            <Home size={16} /> Go Home
          </Link>
          <Link
            to="/colleges"
            className="inline-flex items-center gap-2 bg-[#1E1E1E] border border-[#2A2A2A] text-[#A1A1AA] px-6 py-3 rounded-lg text-[14px] font-medium hover:text-[#FAFAFA] hover:border-[#3A3A3A] transition-all duration-200"
          >
            <ArrowLeft size={16} /> Browse Colleges
          </Link>
        </div>
      </div>
    </div>
  );
}
