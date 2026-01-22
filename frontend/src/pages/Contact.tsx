
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FadeIn } from "@/components/animations/FadeIn";
import { Card } from "@/components/ui/card";
import { Mail, Phone, Clock } from "lucide-react";

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Have questions or feedback? We'd love to hear from you.
              </p>
            </div>
          </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
            <FadeIn delay="100">
              <Card className="p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                    <Mail size={20} />
                  </div>
                  <h3 className="text-lg font-semibold">Email Us</h3>
                </div>
                <p className="text-gray-600 mb-2">General Inquiries:</p>
                <a href="mailto:info@gigflow.com" className="text-blue-600 hover:underline block mb-3">
                  info@gigflow.com
                </a>
                <p className="text-gray-600 mb-2">Support:</p>
                <a href="mailto:support@gigflow.com" className="text-blue-600 hover:underline block">
                  support@gigflow.com
                </a>
              </Card>
            </FadeIn>
            
            <FadeIn delay="200">
              <Card className="p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 text-green-600 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                    <Phone size={20} />
                  </div>
                  <h3 className="text-lg font-semibold">Call Us</h3>
                </div>
                <p className="text-gray-600 mb-2">Customer Service:</p>
                <a href="tel:+1-555-123-4567" className="text-blue-600 hover:underline block mb-3">
                  +1 (555) 123-4567
                </a>
                <p className="text-gray-600 mb-2">Sales:</p>
                <a href="tel:+1-555-987-6543" className="text-blue-600 hover:underline block">
                  +1 (555) 987-6543
                </a>
              </Card>
            </FadeIn>
            
            <FadeIn delay="300">
              <Card className="p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                    <Clock size={20} />
                  </div>
                  <h3 className="text-lg font-semibold">Business Hours</h3>
                </div>
                <p className="text-gray-600 mb-2">Monday - Friday:</p>
                <p className="font-medium mb-3">9:00 AM - 6:00 PM EST</p>
                <p className="text-gray-600 mb-2">Saturday - Sunday:</p>
                <p className="font-medium">Closed</p>
              </Card>
            </FadeIn>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
