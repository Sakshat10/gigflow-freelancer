
import React from "react";
import { NavLink, Link } from "react-router-dom";
import { ExternalLink, FileText, Shield, Info, HelpCircle, Linkedin, Github, Mail } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-16 px-4 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold text-gradient mb-6">GigFlow</h3>
            <p className="text-gray-600 mb-6">
              Streamlining collaboration between freelancers and clients.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.linkedin.com/in/sakshatkumar/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </a>
              <a
                href="https://github.com/Sakshat10"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Info className="h-4 w-4 text-gray-400 mr-2" />
                <Link to="/about" className="text-gray-500 hover:text-gray-800 transition-colors link-underline">About Us</Link>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <Link to="/contact" className="text-gray-500 hover:text-gray-800 transition-colors link-underline">Contact Us</Link>
              </li>
              <li className="flex items-center">
                <HelpCircle className="h-4 w-4 text-gray-400 mr-2" />
                <Link to="/faq" className="text-gray-500 hover:text-gray-800 transition-colors link-underline">FAQ</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Shield className="h-4 w-4 text-gray-400 mr-2" />
                <Link to="/privacy-policy" className="text-gray-500 hover:text-gray-800 transition-colors link-underline">Privacy Policy</Link>
              </li>
              <li className="flex items-center">
                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                <Link to="/return-policy" className="text-gray-500 hover:text-gray-800 transition-colors link-underline">Return Policy</Link>
              </li>
              <li className="flex items-center">
                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                <Link to="/refund-policy" className="text-gray-500 hover:text-gray-800 transition-colors link-underline">Refund Policy</Link>
              </li>
              <li className="flex items-center">
                <ExternalLink className="h-4 w-4 text-gray-400 mr-2" />
                <Link to="/disclaimer" className="text-gray-500 hover:text-gray-800 transition-colors link-underline">Disclaimer</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm space-y-2">
          <p className="text-gray-600">Built for freelancers. No contracts. Cancel anytime.</p>
          <p>© {new Date().getFullYear()} GigFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
