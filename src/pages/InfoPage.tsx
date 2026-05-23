import { Link, useParams } from "react-router-dom";
import { ArrowRight, Mail, Search, ShieldCheck } from "lucide-react";
import NotFound from "./NotFound";

const pageContent: Record<string, { title: string; eyebrow: string; body: React.ReactNode; actions?: Array<{ label: string; to: string }> }> = {
  exams: {
    eyebrow: "Admissions",
    title: "Entrance Exams",
    body: <p>Explore colleges by exams such as JEE Main, NEET, CAT, GATE, BITSAT, and MHT CET through the listing filters and predictor tool.</p>,
    actions: [
      { label: "Try Predictor", to: "/predictor" },
      { label: "Browse Colleges", to: "/colleges" },
    ],
  },
  courses: {
    eyebrow: "Programs",
    title: "Courses",
    body: <p>Find engineering, management, medical, law, design, commerce, data science, and pharmacy programs across the expanded college catalog.</p>,
    actions: [{ label: "Browse Courses", to: "/colleges" }],
  },
  reviews: {
    eyebrow: "Student Voice",
    title: "Reviews",
    body: <p>Open any college detail page and use the Reviews tab to read student feedback or submit your own review.</p>,
    actions: [{ label: "Find a College", to: "/colleges" }],
  },
  about: {
    eyebrow: "Company",
    title: "About CampusFind",
    body: (
      <div className="space-y-4">
        <p>CampusFind helps students search, compare, and shortlist colleges with practical data on fees, courses, placements, ratings, and admission chances.</p>
        <p>Our mission is to democratize education discovery in India. We believe every student deserves access to accurate, transparent data to make one of the most important decisions of their life.</p>
        <p>Built with ❤️ by Om Desai.</p>
      </div>
    ),
    actions: [{ label: "Explore Colleges", to: "/colleges" }],
  },
  careers: {
    eyebrow: "Team",
    title: "Careers",
    body: <p>We are building tools for better education decisions. We are currently looking for passionate individuals to join our product, data, and engineering teams.</p>,
    actions: [{ label: "Contact Us", to: "/contact" }],
  },
  blog: {
    eyebrow: "Guides",
    title: "CampusFind Blog",
    body: (
      <div className="space-y-6">
        <p>Read practical guides on comparing colleges, understanding fees, evaluating placements, and using rank predictors during admissions.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/blog-engineering" className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-5 cursor-pointer hover:border-[#3A3A3A] transition-colors block">
            <h4 className="text-[#FAFAFA] font-medium text-[15px]">How to Choose the Right Engineering College</h4>
            <p className="text-[#71717A] text-[13px] mt-2">A comprehensive guide to evaluating placement stats vs campus life.</p>
            <span className="text-[#D4A843] text-[12px] font-medium mt-4 inline-block">Read More →</span>
          </Link>
          <Link to="/blog-nirf" className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-5 cursor-pointer hover:border-[#3A3A3A] transition-colors block">
            <h4 className="text-[#FAFAFA] font-medium text-[15px]">Understanding NIRF Rankings 2026</h4>
            <p className="text-[#71717A] text-[13px] mt-2">What you need to know about the latest government college rankings.</p>
            <span className="text-[#D4A843] text-[12px] font-medium mt-4 inline-block">Read More →</span>
          </Link>
        </div>
      </div>
    ),
    actions: [{ label: "Start Comparing", to: "/compare" }],
  },
  "blog-engineering": {
    eyebrow: "Blog Post",
    title: "How to Choose the Right Engineering College",
    body: (
      <div className="space-y-5 text-[#A1A1AA]">
        <p>Choosing the right engineering college is one of the most critical decisions a student will make. It determines your academic environment, peer group, and early career opportunities. Here are the top factors you should consider before making a choice.</p>
        
        <h4 className="text-[#FAFAFA] text-[18px] font-medium mt-6">1. Placement Statistics Over the Years</h4>
        <p>Do not just look at the highest package—this is often a single outlier. Instead, look at the median (average) package and the placement percentage. If an institute has a high placement rate and a solid average package, it indicates a strong relationship with recruiters.</p>
        
        <h4 className="text-[#FAFAFA] text-[18px] font-medium mt-6">2. Faculty and Curriculum</h4>
        <p>A great campus is useless without great teachers. Check the college website to see the qualifications of the faculty. Furthermore, look into whether the curriculum is updated regularly. Autonomous colleges and deemed universities often have the flexibility to update their syllabi to match industry standards.</p>

        <h4 className="text-[#FAFAFA] text-[18px] font-medium mt-6">3. Campus Life and Extracurriculars</h4>
        <p>Your college years shouldn't just be about studying. Participating in technical fests, hackathons, and student clubs will help you develop soft skills and leadership qualities. A vibrant campus life is crucial for holistic development.</p>

        <p className="mt-8 italic border-l-2 border-[#D4A843] pl-4">To make your decision easier, use our CampusFind Compare Tool to put up to 4 colleges side by side and evaluate them directly!</p>
      </div>
    ),
    actions: [{ label: "Back to Blog", to: "/blog" }, { label: "Compare Colleges", to: "/compare" }],
  },
  "blog-nirf": {
    eyebrow: "Blog Post",
    title: "Understanding NIRF Rankings 2026",
    body: (
      <div className="space-y-5 text-[#A1A1AA]">
        <p>The National Institutional Ranking Framework (NIRF) is the definitive methodology adopted by the Ministry of Education, Government of India, to rank institutions of higher education in India.</p>

        <h4 className="text-[#FAFAFA] text-[18px] font-medium mt-6">How are the rankings calculated?</h4>
        <p>The rankings are not just about popularity. They are calculated based on five major parameters:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li><strong>Teaching, Learning & Resources (TLR):</strong> Student strength, faculty-student ratio, and financial resources.</li>
          <li><strong>Research and Professional Practice (RP):</strong> Number of publications, quality of publications, and patents.</li>
          <li><strong>Graduation Outcomes (GO):</strong> Placement rates, median salary, and students pursuing higher studies.</li>
          <li><strong>Outreach and Inclusivity (OI):</strong> Diversity among students (women, other states) and facilities for physically challenged students.</li>
          <li><strong>Perception (PR):</strong> Peer and employer perception.</li>
        </ul>

        <h4 className="text-[#FAFAFA] text-[18px] font-medium mt-6">Should you blindly follow NIRF?</h4>
        <p>While NIRF is an excellent baseline, it shouldn't be your only deciding factor. Some newer or private institutes might have exceptional placements but rank lower because they lack long-term research publications. Always cross-check the ranking with actual student reviews and placement data on CampusFind.</p>
      </div>
    ),
    actions: [{ label: "Back to Blog", to: "/blog" }],
  },
  contact: {
    eyebrow: "Support",
    title: "Contact Us",
    body: (
      <div className="space-y-4">
        <p>For admissions guidance, partnerships, or product feedback, reach the CampusFind team through the support channels below.</p>
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 mt-6 max-w-sm">
          <p className="text-[#FAFAFA] font-medium mb-4 text-[16px]">Om Desai</p>
          <div className="space-y-3">
            <a href="mailto:omdesai608@gmail.com" className="flex items-center gap-3 text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors">
              <Mail size={16} className="text-[#D4A843]" /> omdesai608@gmail.com
            </a>
            <a href="tel:+917276197164" className="flex items-center gap-3 text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors">
              <span className="text-[#D4A843] flex items-center justify-center w-4 h-4">📞</span> +91 7276197164
            </a>
          </div>
        </div>
      </div>
    ),
    actions: [{ label: "Email Now", to: "mailto:omdesai608@gmail.com" }],
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms and Conditions",
    body: (
      <div className="space-y-4">
        <p>Welcome to CampusFind. By accessing our platform, you agree to these terms.</p>
        <p><strong>1. Information Accuracy:</strong> CampusFind provides discovery and prediction tools for informational use. Students should verify final admission, fee, and placement details with official college sources.</p>
        <p><strong>2. User Conduct:</strong> Users must not scrape, manipulate, or disrupt the platform's services in any way.</p>
      </div>
    ),
    actions: [{ label: "Browse Colleges", to: "/colleges" }],
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    body: (
      <div className="space-y-4">
        <p>Your privacy is important to us at CampusFind.</p>
        <p><strong>Data Collection:</strong> We store submitted reviews and use entered predictor details only to return college matches.</p>
        <p><strong>Data Protection:</strong> We do not sell your personal data to third parties. Do not submit sensitive personal data in public reviews.</p>
      </div>
    ),
    actions: [{ label: "Try Predictor", to: "/predictor" }],
  },
  cookies: {
    eyebrow: "Legal",
    title: "Cookies",
    body: <p>CampusFind uses basic browser behavior and API requests for navigation and data loading. No advertising cookie workflow is included in this MVP.</p>,
    actions: [{ label: "Go Home", to: "/" }],
  },
};

export default function InfoPage() {
  const { page = "about" } = useParams();
  const content = pageContent[page];

  if (!content) {
    return <NotFound />;
  }

  return (
    <div className="pt-[76px] min-h-screen bg-[#141414]">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-14">
        <p className="text-[#D4A843] text-[11px] font-semibold uppercase tracking-[0.08em] mb-4">
          {content.eyebrow}
        </p>
        <h1 className="font-['Space_Grotesk'] font-medium text-[#FAFAFA] text-[clamp(2rem,5vw,3.4rem)] leading-tight tracking-[-0.04em]">
          {content.title}
        </h1>
        <p className="text-[#A1A1AA] text-[16px] leading-relaxed mt-5 max-w-[680px]">
          {content.body}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
          {[
            { label: "Search", value: "500+ colleges", icon: Search },
            { label: "Decide", value: "Compare 2-4", icon: ShieldCheck },
            { label: "Support", value: "Working routes", icon: Mail },
          ].map((item) => (
            <div key={item.label} className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-5">
              <item.icon size={18} className="text-[#D4A843] mb-3" />
              <div className="text-[#71717A] text-[11px] font-semibold uppercase tracking-[0.08em]">{item.label}</div>
              <div className="text-[#FAFAFA] text-[15px] font-medium mt-1">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-10">
          {(content.actions ?? []).map((action) =>
            action.to.startsWith("mailto:") ? (
              <a
                key={action.label}
                href={action.to}
                className="inline-flex items-center gap-2 bg-[#D4A843] text-[#141414] px-5 py-3 rounded-lg text-[13px] font-semibold hover:bg-[#C49A3B] transition-all"
              >
                {action.label} <ArrowRight size={14} />
              </a>
            ) : (
              <Link
                key={action.label}
                to={action.to}
                className="inline-flex items-center gap-2 bg-[#D4A843] text-[#141414] px-5 py-3 rounded-lg text-[13px] font-semibold hover:bg-[#C49A3B] transition-all"
              >
                {action.label} <ArrowRight size={14} />
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}
