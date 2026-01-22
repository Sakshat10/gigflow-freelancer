
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { FadeIn } from "@/components/animations/FadeIn";
import { renderCanvas } from "@/components/ui/canvas";

const HeroSection: React.FC = () => {
  useEffect(() => {
    renderCanvas();
  }, []);

  const scrollToHowItWorks = () => {
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-28 pb-20 md:pt-36 md:pb-28 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-8 items-center">
        <div className="space-y-8">
          <FadeIn>
            <span className="inline-block bg-blue-50 text-blue-600 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              #1 Client Management Platform for Freelancers
            </span>
          </FadeIn>
          
          <FadeIn delay="100">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Transform your <span className="text-gradient">freelance business</span>
            </h1>
          </FadeIn>
          
          <FadeIn delay="200">
            <p className="text-lg text-gray-600 md:pr-8 leading-relaxed">
              All-in-one platform to manage clients, projects, files, and payments. Save 12+ hours weekly and boost client satisfaction by 92%.
            </p>
          </FadeIn>
          
          <FadeIn delay="300">
            <div className="flex flex-wrap gap-4 pt-2">
              <NavLink to="/signup">
                <Button size="lg" className="rounded-full px-8 py-6 shadow-button hover-translate">
                  Start Free Trial
                </Button>
              </NavLink>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full px-8 py-6 hover-translate"
                onClick={scrollToHowItWorks}
              >
                See How It Works
              </Button>
            </div>
          </FadeIn>
          
          <FadeIn delay="500">
            <div className="pt-6 flex items-center justify-start space-x-6">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 text-xs font-medium">JD</div>
                <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-600 text-xs font-medium">AP</div>
                <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-600 text-xs font-medium">SK</div>
              </div>
              <p className="text-sm text-gray-500">Trusted by 10,000+ successful freelancers</p>
            </div>
          </FadeIn>
        </div>
        
        <div className="relative md:mt-0 mt-8">
          <FadeIn direction="left" delay="200">
            <div className="w-full h-[500px] rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 relative overflow-hidden shadow-card">
              <div className="absolute top-0 left-0 w-full h-full bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-6 flex flex-col">
                <div className="glass-effect rounded-xl p-4 mb-4 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-workspace-purple flex items-center justify-center text-purple-600 text-sm font-medium">AC</div>
                  <div>
                    <h3 className="font-medium">Acme Corp Workspace</h3>
                    <p className="text-xs text-gray-500">Last activity: Today</p>
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="glass-effect rounded-xl p-4 flex flex-col justify-between animate-float">
                    <h4 className="font-medium text-sm">Files</h4>
                    <span className="text-2xl font-bold">12</span>
                  </div>
                  <div className="glass-effect rounded-xl p-4 flex flex-col justify-between animate-float" style={{ animationDelay: "1s"}}>
                    <h4 className="font-medium text-sm">Messages</h4>
                    <span className="text-2xl font-bold">48</span>
                  </div>
                  <div className="glass-effect rounded-xl p-4 col-span-2 flex flex-col h-32 animate-float" style={{ animationDelay: "0.5s"}}>
                    <h4 className="font-medium text-sm mb-2">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">AC</div>
                        <p className="text-xs">Added 3 new files</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">YO</div>
                        <p className="text-xs">Sent an invoice ($850)</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="glass-effect rounded-xl p-4 mt-3 animate-float" style={{ animationDelay: "1.5s"}}>
                  <h4 className="font-medium text-sm mb-2">Upcoming</h4>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-workspace-amber rounded p-1.5">
                        <div className="w-full h-full bg-amber-500/20 rounded"></div>
                      </div>
                      <span className="text-sm">Project Review</span>
                    </div>
                    <span className="text-xs text-gray-500">Tomorrow, 2PM</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
          
          {/* Decorative elements */}
          <div className="absolute -z-10 -top-10 -right-10 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -z-10 bottom-10 -left-10 w-40 h-40 bg-indigo-200/30 rounded-full blur-3xl"></div>
        </div>
      </div>
      
      {/* Canvas for cursor effect */}
      <canvas
        className="pointer-events-none absolute inset-0 z-0"
        id="canvas"
      ></canvas>
    </section>
  );
};

export default HeroSection;
