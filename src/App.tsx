import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { FloatingChat } from "@/components/FloatingChat";
import { HomePage } from "@/pages/HomePage";
import { EarnPage } from "@/pages/EarnPage";
import { GigsPage } from "@/pages/GigsPage";
import { CareersPage } from "@/pages/CareersPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { HousingPage } from "@/pages/HousingPage";
import { RestorationPage } from "@/pages/RestorationPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/earn" element={<EarnPage />} />
          <Route path="/gigs" element={<GigsPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/housing" element={<HousingPage />} />
          <Route path="/housing/restore" element={<RestorationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        <FloatingChat />
      </div>
    </BrowserRouter>
  );
}

export default App;
