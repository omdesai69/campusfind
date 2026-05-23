import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const CollegeListing = lazy(() => import("./pages/CollegeListing"));
const CollegeDetail = lazy(() => import("./pages/CollegeDetail"));
const Compare = lazy(() => import("./pages/Compare"));
const Predictor = lazy(() => import("./pages/Predictor"));
const NotFound = lazy(() => import("./pages/NotFound"));
const InfoPage = lazy(() => import("./pages/InfoPage"));

// A minimal loading fallback matching the dark theme
const PageLoader = () => (
  <div className="pt-[76px] min-h-screen bg-[#141414] flex items-center justify-center">
    <div className="animate-spin-slow w-8 h-8 border-2 border-[#2A2A2A] border-t-[#D4A843] rounded-full" />
  </div>
);

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/colleges" element={<CollegeListing />} />
          <Route path="/colleges/:slug" element={<CollegeDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/predictor" element={<Predictor />} />
          <Route path="/:page" element={<InfoPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
