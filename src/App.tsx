import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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

// ---- Splash Screen ----
// Plays the intro video once per session. On first-ever visit, also shows
// a Picture-in-Picture corner video while the profile page loads.
function SplashScreen({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Max wait 5s even if video doesn't end
    const timeout = setTimeout(() => {
      setFading(true);
      setTimeout(onDone, 600);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [onDone]);

  const handleEnded = () => {
    setFading(true);
    setTimeout(onDone, 600);
  };

  return (
    <div
      className="fixed inset-0 z-[99999] bg-zinc-950 flex items-center justify-center"
      style={{ transition: "opacity 0.6s ease", opacity: fading ? 0 : 1 }}
    >
      <div className="flex flex-col items-center gap-6">
        <video
          ref={videoRef}
          src="/lack-intro.mp4"
          autoPlay
          muted
          playsInline
          onEnded={handleEnded}
          onError={handleEnded}
          className="max-w-xs w-full rounded-2xl shadow-2xl"
        />
        <div className="text-zinc-600 text-xs animate-pulse">Loading LACK...</div>
      </div>
    </div>
  );
}

// ---- Picture-in-picture intro video (corner) ----
// Shows in bottom-right while user fills out profile for first time
export function PipIntroVideo() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="fixed bottom-24 right-6 z-[9990] flex flex-col items-end gap-1">
      <button
        onClick={() => setVisible(false)}
        className="text-zinc-500 hover:text-zinc-300 text-xs self-end mb-0.5"
      >✕ close</button>
      <video
        src="/lack-intro.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="w-40 rounded-xl shadow-2xl border border-white/10"
      />
      <span className="text-zinc-600 text-[10px]">Welcome to LACK</span>
    </div>
  );
}

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

  // Show splash once per session (not on admin pages)
  const [showSplash, setShowSplash] = useState(() => {
    if (isAdmin) return false;
    return !sessionStorage.getItem("lack_splash_shown");
  });

  // Show PiP intro video on profile page if this is first ever visit
  const isFirstEver = !localStorage.getItem("lack_visited");
  const [showPip, setShowPip] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("lack_visited")) {
      localStorage.setItem("lack_visited", "1");
    }
  }, []);

  useEffect(() => {
    // Show PiP on profile page for first-time visitors after splash
    if (!showSplash && isFirstEver && location.pathname === "/profile") {
      setShowPip(true);
    }
  }, [showSplash, location.pathname, isFirstEver]);

  const handleSplashDone = () => {
    sessionStorage.setItem("lack_splash_shown", "1");
    setShowSplash(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {showSplash && !isAdmin && <SplashScreen onDone={handleSplashDone} />}
      {showPip && <PipIntroVideo />}
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
