import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Stats from "../components/Stats";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      {/* NAVIGATION */}
      <Navbar />

      {/* HERO SECTION */}
      <Hero />

      {/* FEATURES SECTION */}
      <Features />

      {/* STATISTICS SECTION */}
      <Stats />

      {/* FOOTER SECTION */}
      <Footer />
    </div>
  );
}