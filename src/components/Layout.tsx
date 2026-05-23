import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { path: "/colleges", label: "Colleges" },
  { path: "/compare", label: "Compare" },
  { path: "/predictor", label: "Predictor" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-[60px] transition-all duration-300 ${
          scrolled
            ? "bg-[#141414]/95 backdrop-blur-xl border-b border-[#2A2A2A]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1280px] mx-auto h-full flex items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-[#D4A843] text-sm">&#9670;</span>
            <span className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-lg tracking-tight">
              CampusFind
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-[13px] font-medium transition-colors duration-200 rounded-lg ${
                  location.pathname === link.path
                    ? "text-[#FAFAFA] bg-[#D4A843]/10"
                    : "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1E1E1E]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/predictor"
              className="bg-[#D4A843] text-[#141414] px-5 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#C49A3B] transition-all duration-200 hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-[#A1A1AA] hover:text-[#FAFAFA] p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-[#1E1E1E] shadow-[0_10px_40px_rgba(0,0,0,0.5)] pt-16 px-6">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === link.path
                      ? "text-[#D4A843] bg-[#D4A843]/10"
                      : "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#232323]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
                <Link
                  to="/predictor"
                  className="block w-full text-center bg-[#D4A843] text-[#141414] px-5 py-3 rounded-lg text-sm font-semibold hover:bg-[#C49A3B] transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-[#0F0F0F] pt-16 pb-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#D4A843] text-sm">&#9670;</span>
                <span className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-lg">
                  CampusFind
                </span>
              </div>
              <p className="text-[#71717A] text-[13px] leading-relaxed">
                India's most trusted college discovery platform. Find, compare, and choose the right college for your future.
              </p>
            </div>

            {/* Explore */}
            <div>
              <h4 className="text-[#FAFAFA] font-semibold text-sm mb-4">Explore</h4>
              <div className="flex flex-col gap-2.5">
                <Link to="/colleges" className="text-[#71717A] text-[13px] hover:text-[#FAFAFA] transition-colors">Colleges</Link>
                <Link to="/exams" className="text-[#71717A] text-[13px] hover:text-[#FAFAFA] transition-colors">Exams</Link>
                <Link to="/courses" className="text-[#71717A] text-[13px] hover:text-[#FAFAFA] transition-colors">Courses</Link>
                <Link to="/compare" className="text-[#71717A] text-[13px] hover:text-[#FAFAFA] transition-colors">Compare</Link>
              </div>
            </div>

            {/* Tools */}
            <div>
              <h4 className="text-[#FAFAFA] font-semibold text-sm mb-4">Tools</h4>
              <div className="flex flex-col gap-2.5">
                <Link to="/compare" className="text-[#71717A] text-[13px] hover:text-[#FAFAFA] transition-colors">Compare Colleges</Link>
                <Link to="/predictor" className="text-[#71717A] text-[13px] hover:text-[#FAFAFA] transition-colors">College Predictor</Link>
                <Link to="/reviews" className="text-[#71717A] text-[13px] hover:text-[#FAFAFA] transition-colors">Reviews</Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-[#FAFAFA] font-semibold text-sm mb-4">Company</h4>
              <div className="flex flex-col gap-2.5">
                <Link to="/about" className="text-[#71717A] text-[13px] hover:text-[#FAFAFA] transition-colors">About</Link>
                <Link to="/careers" className="text-[#71717A] text-[13px] hover:text-[#FAFAFA] transition-colors">Careers</Link>
                <Link to="/blog" className="text-[#71717A] text-[13px] hover:text-[#FAFAFA] transition-colors">Blog</Link>
                <Link to="/contact" className="text-[#71717A] text-[13px] hover:text-[#FAFAFA] transition-colors">Contact</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-[#2A2A2A] mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[#71717A] text-[12px]">
              &copy; 2026 CampusFind. All rights reserved.
            </p>
            <div className="flex gap-4 text-[#71717A] text-[12px]">
              <Link to="/terms" className="hover:text-[#FAFAFA] transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-[#FAFAFA] transition-colors">Privacy</Link>
              <Link to="/cookies" className="hover:text-[#FAFAFA] transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
