
import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FadeIn } from "@/components/animations/FadeIn";

const Disclaimer: React.FC = () => {
  // Add useEffect to scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h1 className="text-3xl font-bold mb-8">Disclaimer</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Website Disclaimer</h2>
              <p>
                The information provided on GigFlow is for general informational purposes only. All information on the 
                site is provided in good faith, however, we make no representation or warranty of any kind, express or 
                implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any 
                information on the site.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">No Liability</h2>
              <p>
                Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred 
                as a result of the use of the site or reliance on any information provided on the site. Your use of the 
                site and your reliance on any information on the site is solely at your own risk.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">External Links</h2>
              <p>
                The site may contain links to external websites that are not provided or maintained by or in any way 
                affiliated with GigFlow. Please note that GigFlow does not guarantee the accuracy, relevance, timeliness, 
                or completeness of any information on these external websites.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Errors and Omissions</h2>
              <p>
                While we strive to provide accurate and up-to-date information, the GigFlow platform may contain technical, 
                typographical, or photographic errors. GigFlow reserves the right to make changes and corrections at any 
                time, without prior notice.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Professional Disclaimer</h2>
              <p>
                GigFlow is a platform that facilitates collaboration between freelancers and clients. We do not provide 
                professional advice or services directly. Any reliance you place on information or services arranged 
                through our platform is strictly at your own risk.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p>
                If you have questions about our Disclaimer, please contact our support team at 
                <a href="mailto:support@gigflow.com" className="text-blue-600 hover:underline ml-1">support@gigflow.com</a>.
              </p>
            </div>
          </FadeIn>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Disclaimer;
