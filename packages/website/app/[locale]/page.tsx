import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { Shortcuts } from "@/components/sections/shortcuts";
import { Installation } from "@/components/sections/installation";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Shortcuts />
        <Installation />
      </main>
      <Footer />
    </div>
  );
}
