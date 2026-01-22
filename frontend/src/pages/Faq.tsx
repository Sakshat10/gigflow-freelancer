
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FadeIn } from "@/components/animations/FadeIn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Faq: React.FC = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // FAQ items
  const faqItems = [
    {
      question: "What is GigFlow?",
      answer: "GigFlow is an all-in-one platform designed to help freelancers and independent professionals manage client relationships, projects, invoices, and communications in one place. Our goal is to streamline your freelance business operations so you can focus on what you do best."
    },
    {
      question: "How does the free trial work?",
      answer: "Our free trial gives you full access to all GigFlow features for 14 days, with no credit card required. After your trial ends, you can choose from our flexible pricing plans to continue using the platform that best suits your needs."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. If you cancel, you'll still have access to GigFlow until the end of your current billing cycle. We don't offer refunds for partial months of service."
    },
    {
      question: "Is my data secure on GigFlow?",
      answer: "Absolutely. We take security seriously and implement industry-standard encryption and security practices to protect your data. All information is stored securely and we never share your data with third parties without your consent."
    },
    {
      question: "How do I share work with my clients?",
      answer: "GigFlow makes client collaboration easy with dedicated workspaces for each client. You can share files, discuss projects, and manage invoices all in one place. Clients receive secure access links to view only what you've specifically shared with them."
    },
    {
      question: "Can I customize my invoices?",
      answer: "Yes, GigFlow offers customizable invoice templates. You can add your logo, change colors, and modify layouts to match your brand identity. All invoices are professional and can be sent directly through the platform."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards including Visa, Mastercard, American Express, and Discover. For annual plans, we can also accommodate payment via bank transfer - contact our support team for details."
    },
    {
      question: "Is there a limit to how many clients I can manage?",
      answer: "Our Starter plan allows up to 5 client workspaces. The Professional plan increases this to 15 clients, and our Business plan offers unlimited client workspaces. You can upgrade or downgrade your plan at any time as your business needs change."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Frequently Asked Questions</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Find answers to the most common questions about GigFlow and how it can help streamline your freelance business.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-blue-50 p-6 md:p-8 mb-10">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium text-gray-800 hover:text-primary">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6 md:p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
              <p className="text-gray-600 mb-6">
                Our support team is ready to help you with any other questions you might have.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/contact" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Contact Support
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Faq;
