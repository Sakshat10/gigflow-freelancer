
import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import PricingSection from "@/components/PricingSection";
import BentoGridSection from "@/components/BentoGridSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { FadeIn } from "@/components/animations/FadeIn";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar />
      
      <main className="flex-1">
        <HeroSection />
        <FeatureSection />
        
        {/* How It Works Section */}
        <HowItWorksSection />
        
        {/* Bento Grid Section */}
        <BentoGridSection />
        
        {/* Pricing Section */}
        <PricingSection />
        
        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-7xl mx-auto">
            <FadeIn>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to take your freelance career to the next level?
                </h2>
                <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                  Join 10,000+ freelancers who are saving time, impressing clients, and earning more with GigFlow.
                </p>
                <NavLink to="/signup">
                  <Button size="lg" variant="secondary" className="rounded-full px-8 py-6 text-primary font-medium hover-translate">
                    Start Now
                  </Button>
                </NavLink>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
