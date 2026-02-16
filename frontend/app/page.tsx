import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { FeaturedCars } from "@/components/FeaturedCars";
import { GoogleReviews } from "@/components/GoogleReviews";
import { Articles } from "@/components/Articles";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Services />
      <FeaturedCars />
      <GoogleReviews />
      <Articles />
      <Footer />
    </main>
  );
}
