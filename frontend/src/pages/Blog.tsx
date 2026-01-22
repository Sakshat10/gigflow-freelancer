
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FadeIn } from "@/components/animations/FadeIn";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";

const Blog: React.FC = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sample blog posts data
  const blogPosts = [
    {
      id: 1,
      title: "10 Tips for Managing Client Expectations as a Freelancer",
      excerpt: "Setting clear expectations with clients is essential for success. Here are 10 strategies to help you navigate client relationships effectively.",
      date: "June 15, 2023",
      readTime: "8 min read",
      category: "Client Management",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "The Ultimate Guide to Creating Professional Invoices",
      excerpt: "Learn how to create invoices that get you paid faster and look professional. Includes templates and best practices for freelancers.",
      date: "July 22, 2023",
      readTime: "6 min read",
      category: "Invoicing",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2022&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "How to Set Your Freelance Rates: A Comprehensive Approach",
      excerpt: "Struggling with how much to charge? This guide walks through different rate strategies and how to calculate your optimal pricing.",
      date: "August 8, 2023",
      readTime: "10 min read",
      category: "Business Growth",
      image: "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "Tax Planning for Freelancers: What You Need to Know",
      excerpt: "Don't let tax season stress you out. Learn about deductions, quarterly payments, and organization systems specifically for freelancers.",
      date: "September 14, 2023",
      readTime: "9 min read",
      category: "Finance",
      image: "https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "Building Your Personal Brand as a Freelancer",
      excerpt: "Your personal brand can be your most valuable asset. Discover strategies to develop and promote your unique professional identity.",
      date: "October 5, 2023",
      readTime: "7 min read",
      category: "Marketing",
      image: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?q=80&w=2032&auto=format&fit=crop"
    },
    {
      id: 6,
      title: "Time Management Techniques for the Busy Freelancer",
      excerpt: "Maximize your productivity with these tested time management strategies designed specifically for independent professionals.",
      date: "November 20, 2023",
      readTime: "5 min read",
      category: "Productivity",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  // Search functionality
  const filteredPosts = searchQuery.trim() === "" 
    ? blogPosts 
    : blogPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">GigFlow Blog</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Insights, tips, and strategies to help you thrive as a freelancer or independent professional.
              </p>
            </div>
            
            {/* Search Section */}
            <div className="mb-12 flex justify-center">
              <div className="relative w-full max-w-xl">
                <Search 
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" 
                  onClick={() => setIsSearchOpen(prev => !prev)}
                />
                <Input 
                  type="text" 
                  placeholder="Search articles..." 
                  className="pl-10 pr-4 py-2 rounded-full border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                />
                
                {isSearchOpen && searchQuery.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
                    <Command className="rounded-lg border shadow-md">
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Articles">
                          {filteredPosts.map((post) => (
                            <CommandItem 
                              key={post.id}
                              onSelect={() => {
                                window.location.href = `/blog/${post.id}`;
                                setIsSearchOpen(false);
                              }}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center">
                                <div className="w-10 h-10 mr-2 rounded overflow-hidden">
                                  <img 
                                    src={post.image} 
                                    alt={post.title} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-medium">{post.title}</div>
                                  <div className="text-xs text-gray-500">{post.category}</div>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                )}
              </div>
            </div>
            
            {/* Featured Post */}
            <div className="mb-16">
              <div className="rounded-xl overflow-hidden shadow-lg border border-blue-50 bg-white">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="h-full">
                    <img 
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                      alt="Featured post" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <div className="text-sm text-blue-600 font-medium mb-2">FEATURED POST</div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">The Future of Freelancing: Trends to Watch in 2024</h2>
                    <p className="text-gray-600 mb-6">
                      The freelance landscape is constantly evolving. From AI integration to new payment systems, 
                      we explore the top trends that will shape independent work in the coming year.
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mb-6">
                      <div className="flex items-center mr-4">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>January 5, 2024</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>12 min read</span>
                      </div>
                    </div>
                    <Link to="/blog/featured">
                      <Button className="w-fit flex items-center gap-2">
                        Read Article <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Blog Post Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow border-blue-50">
                  <div className="h-48 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                  </div>
                  <CardHeader>
                    <div className="text-sm text-blue-600 font-medium">{post.category}</div>
                    <CardTitle className="mt-2">{post.title}</CardTitle>
                    <CardDescription>{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between items-center border-t pt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{post.readTime}</span>
                    </div>
                  </CardFooter>
                  <div className="px-6 pb-6">
                    <Link to={`/blog/${post.id}`}>
                      <Button variant="link" className="flex items-center p-0 text-blue-600">
                        Read Article <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Newsletter Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 md:p-10 text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
              <p className="mb-6 text-blue-100 max-w-2xl mx-auto">
                Get the latest freelancing tips, tools, and insights delivered directly to your inbox. No spam, just valuable content to help your business grow.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-white/20 placeholder:text-white/70 border-white/30 focus:ring-white text-white rounded-md"
                />
                <Button variant="secondary" className="whitespace-nowrap">
                  Subscribe
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;
