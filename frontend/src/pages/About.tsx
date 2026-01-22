
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FadeIn } from "@/components/animations/FadeIn";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, BarChart, Clock, Shield } from "lucide-react";

const About: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold mb-4">About GigFlow</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Streamlining collaboration between freelancers and clients since 2023
              </p>
            </div>
          </FadeIn>
          
          <FadeIn delay="100">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-gray-700 mb-6">
                  At GigFlow, we're on a mission to transform how freelancers and clients work together. 
                  We believe that successful collaboration shouldn't be complicated, which is why we've 
                  built a platform that removes the friction from freelance work.
                </p>
                <p className="text-lg text-gray-700">
                  Our goal is to empower freelancers to focus on what they do best—creating amazing 
                  work—while giving clients the transparency and tools they need to manage projects effectively.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                  alt="Team collaborating"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </FadeIn>
          
          <FadeIn delay="200">
            <div className="mb-20">
              <h2 className="text-3xl font-bold mb-10 text-center">Our Values</h2>
              <div className="grid md:grid-cols-4 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Users size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Community</h3>
                  <p className="text-gray-600">
                    We believe in building strong connections between freelancers and clients based on trust and mutual respect.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <BarChart size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Transparency</h3>
                  <p className="text-gray-600">
                    Clear communication and honest business practices are at the heart of everything we do.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Clock size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Efficiency</h3>
                  <p className="text-gray-600">
                    We're dedicated to creating tools that save time and reduce administrative burden.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Shield size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Security</h3>
                  <p className="text-gray-600">
                    We prioritize the protection of your data and provide secure tools for financial transactions.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
          
          <FadeIn delay="500">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white text-center">
              <h2 className="text-3xl font-bold mb-6">Join Our Journey</h2>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                Whether you're a freelancer looking to streamline your workflow or a business seeking better 
                collaboration tools, we'd love to have you join the GigFlow community.
              </p>
              <NavLink to="/signup">
                <Button size="lg" variant="secondary" className="rounded-full px-8 py-6 text-primary font-medium hover:scale-105 transition-transform">
                  Get Started For Free
                </Button>
              </NavLink>
            </div>
          </FadeIn>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
