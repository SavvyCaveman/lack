import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { FloatingChat } from "@/components/FloatingChat";
import { HomePage } from "@/pages/HomePage";
import { EarnPage } from "@/pages/EarnPage";
import { GigsPage } from "@/pages/GigsPage";
import { CareersPage } from "@/pages/CareersPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { HousingPage } from "@/pages/HousingPage";
import { RestorationPage } from "@/pages/RestorationPage";
import { AdminPage } from "@/pages/AdminPage";
import { PrivacyPage } from "@/pages/PrivacyPage";

function SiteFooter() {
  return (
    <footer className="border-t border-white/5 mt-16 py-8 bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-black text-lg">LACK</span>
            <span className="text-zinc-600 text-xs">Local Area Community Kiosk</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500">
            <Link to="/earn" className="hover:text-zinc-300 transition-colors">Earn</Link>
            <Link to="/gigs" className="hover:text-zinc-300 transition-colors">Gigs</Link>
            <Link to="/careers" className="hover:text-zinc-300 transition-colors">Careers</Link>
            <Link to="/housing" className="hover:text-zinc-300 transition-colors">Housing</Link>
            <Link to="/housing/restore" className="hover:text-zinc-300 transition-colors">Restoration Hub</Link>
            <Link to="/profile" className="hover:text-zinc-300 transition-colors">My Profile</Link>
            <Link to="/privacy" className="hover:text-zinc-300 transition-colors font-bold text-zinc-400">Privacy Policy</Link>
          </nav>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 mt-6 pt-4 border-t border-white/5">
          <p className="text-zinc-600 text-xs text-center md:text-left">
            75% of all ad revenue goes directly to users. Zero selling of data without explicit consent.
          </p>
          <p className="text-zinc-700 text-xs">© 2026 LACK · Built for communities</p>
        </div>
      </div>
    </footer>
  );
}

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {!isAdmin && <NavBar />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/earn" element={<EarnPage />} />
          <Route path="/gigs" element={<GigsPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/housing" element={<HousingPage />} />
          <Route path="/housing/restore" element={<RestorationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </div>
      {!isAdmin && <SiteFooter />}
      {!isAdmin && <FloatingChat />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
