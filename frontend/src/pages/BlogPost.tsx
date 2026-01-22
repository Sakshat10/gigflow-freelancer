
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FadeIn } from "@/components/animations/FadeIn";
import { ArrowLeft, Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample blog posts data - in a real app, this would come from an API or database
const blogPosts = [
  {
    id: "featured",
    title: "The Future of Freelancing: Trends to Watch in 2024",
    content: `
      <p class="mb-4">The freelance landscape is constantly evolving. From AI integration to new payment systems, we explore the top trends that will shape independent work in the coming year.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">AI Integration in Freelance Work</h2>
      <p class="mb-4">Artificial intelligence is no longer just a buzzword—it's becoming an essential tool for freelancers across industries. From content creation assistants to automated accounting systems, AI is helping independent professionals work smarter and faster.</p>
      <p class="mb-4">In 2024, we expect to see more specialized AI tools designed specifically for freelance niches. Designers will benefit from AI that can generate initial concepts based on client briefs, while developers may use AI assistants to debug code or suggest optimizations.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">New Payment Systems</h2>
      <p class="mb-4">The financial infrastructure supporting freelance work continues to improve. Cryptocurrency payments are becoming more mainstream, offering lower transaction fees and faster international transfers.</p>
      <p class="mb-4">Meanwhile, platforms like GigFlow are creating integrated payment solutions that manage everything from invoicing to tax documentation. These systems reduce administrative overhead and help freelancers focus on their core work.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Remote Collaboration Tools</h2>
      <p class="mb-4">As distributed teams become the norm, tools that facilitate seamless collaboration are essential. Virtual whiteboarding, asynchronous video messaging, and project management platforms tailored to freelance work are seeing rapid adoption.</p>
      <p class="mb-4">These tools are increasingly focused on creating a cohesive ecosystem rather than solving isolated problems. The ability to integrate different workflows and communication channels will be a key differentiator for successful freelancers.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Skills Marketplaces</h2>
      <p class="mb-4">The way clients and freelancers find each other is evolving beyond traditional job boards. AI-powered matching systems that consider past work, client feedback, and specific expertise are creating more successful partnerships.</p>
      <p class="mb-4">Verification systems that validate freelancer skills through practical assessments rather than self-reported expertise are gaining popularity, creating more trust in the hiring process.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Conclusion</h2>
      <p class="mb-4">The freelance economy continues to mature, with better infrastructure and tools supporting independent professionals. By staying ahead of these trends, freelancers can position themselves for success in an increasingly competitive landscape.</p>
    `,
    date: "January 5, 2024",
    readTime: "12 min read",
    category: "Industry Trends",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
  },
  {
    id: "1",
    title: "10 Tips for Managing Client Expectations as a Freelancer",
    content: `
      <p class="mb-4">Setting clear expectations with clients is essential for success. Here are 10 strategies to help you navigate client relationships effectively.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">1. Start with a Detailed Contract</h2>
      <p class="mb-4">Your contract should clearly outline what you will deliver, by when, and for what price. Include information about revision limits, additional fees for scope changes, and payment terms.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">2. Create a Thorough Onboarding Process</h2>
      <p class="mb-4">Develop a structured process for bringing on new clients that includes questionnaires about their goals, preferences, and communication style. This shows professionalism and gets the relationship off to a good start.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">3. Establish Communication Channels and Frequency</h2>
      <p class="mb-4">Decide upfront how and when you'll communicate. Will you have weekly video calls? Daily email updates? Set these expectations early to prevent clients from feeling ignored or overwhelmed.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">4. Document Everything</h2>
      <p class="mb-4">Keep records of all client communications, especially changes to the project scope or timeline. This prevents misunderstandings and provides a reference if disagreements arise.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">5. Educate Clients About Your Process</h2>
      <p class="mb-4">Many clients have never worked with a freelancer in your field before. Take time to explain your workflow, why certain steps are necessary, and what they can expect at each stage.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">6. Under-Promise and Over-Deliver</h2>
      <p class="mb-4">Build buffer time into your estimates and set delivery dates that you know you can beat. Surprising clients with early delivery is always better than explaining delays.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">7. Address Issues Immediately</h2>
      <p class="mb-4">If you realize you won't meet a deadline or encounter an unexpected problem, communicate this to the client immediately. Propose solutions rather than just presenting the problem.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">8. Use Visual Aids</h2>
      <p class="mb-4">When explaining complex concepts or project plans, use visuals like flowcharts, timelines, or mockups. This helps ensure everyone has the same understanding.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">9. Set Boundaries</h2>
      <p class="mb-4">Be clear about your working hours, response times, and what constitutes an emergency. This prevents clients from expecting 24/7 availability.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">10. Request Regular Feedback</h2>
      <p class="mb-4">Don't wait until the end of a project to find out if the client is satisfied. Build in checkpoints for feedback and make adjustments as needed.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Conclusion</h2>
      <p class="mb-4">Managing client expectations successfully is as much about clear communication as it is about delivering quality work. By implementing these strategies, you'll build stronger client relationships and reduce the stress of misaligned expectations.</p>
    `,
    date: "June 15, 2023",
    readTime: "8 min read",
    category: "Client Management",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "2",
    title: "The Ultimate Guide to Creating Professional Invoices",
    content: `
      <p class="mb-4">Learn how to create invoices that get you paid faster and look professional. Includes templates and best practices for freelancers.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Why Professional Invoices Matter</h2>
      <p class="mb-4">Your invoice is often the last touchpoint in a client project. A professional, clear invoice reinforces your brand and makes it easier for clients to pay you promptly.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Essential Elements Every Invoice Should Include</h2>
      <p class="mb-4">Make sure every invoice contains these key elements:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Your business name and contact information</li>
        <li>Client's name and contact details</li>
        <li>Unique invoice number</li>
        <li>Issue date and payment due date</li>
        <li>Itemized list of services with descriptions</li>
        <li>Cost for each service and total amount due</li>
        <li>Payment terms and accepted payment methods</li>
        <li>Late payment policies or fees</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Designing an Invoice That Reflects Your Brand</h2>
      <p class="mb-4">Your invoice should be an extension of your brand. Use your logo, brand colors, and typography consistently. Keep the layout clean and organized for easy reading.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Writing Clear Service Descriptions</h2>
      <p class="mb-4">Avoid vague descriptions like "Design work" or "Consulting." Be specific about what you delivered, such as "Website homepage redesign" or "2-hour marketing strategy session."</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Setting Payment Terms That Work for You</h2>
      <p class="mb-4">Standard payment terms range from "Due upon receipt" to "Net 30" (payment due within 30 days). Choose terms that balance your cash flow needs with client expectations.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Invoicing Software Options</h2>
      <p class="mb-4">While you can create invoices in Word or Excel, dedicated invoicing software offers advantages like automatic payment reminders, recurring invoices, and payment tracking.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Following Up on Unpaid Invoices</h2>
      <p class="mb-4">Develop a system for following up on unpaid invoices. Start with a friendly reminder a few days before the due date, followed by increasingly direct communications if the invoice remains unpaid.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Conclusion</h2>
      <p class="mb-4">Professional invoicing is a crucial part of a successful freelance business. With clear, well-designed invoices and consistent follow-up, you'll improve your cash flow and demonstrate your professionalism to clients.</p>
    `,
    date: "July 22, 2023",
    readTime: "6 min read",
    category: "Invoicing",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2022&auto=format&fit=crop"
  },
  {
    id: "3",
    title: "How to Set Your Freelance Rates: A Comprehensive Approach",
    content: `
      <p class="mb-4">Struggling with how much to charge? This guide walks through different rate strategies and how to calculate your optimal pricing.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Understanding Different Pricing Models</h2>
      <p class="mb-4">Before setting your rates, decide which pricing model works best for your services:</p>
      <ul class="list-disc pl-6 mb-4">
        <li><strong>Hourly rates:</strong> Charging per hour worked, best for projects with unpredictable scope</li>
        <li><strong>Project-based fees:</strong> Charging a flat fee for the entire project, regardless of time spent</li>
        <li><strong>Value-based pricing:</strong> Setting rates based on the value your work delivers to clients</li>
        <li><strong>Retainer agreements:</strong> Charging a recurring fee for ongoing services</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Calculating Your Minimum Viable Rate</h2>
      <p class="mb-4">To avoid undercharging, calculate the minimum rate you need to cover expenses and earn your target income:</p>
      <ol class="list-decimal pl-6 mb-4">
        <li>Determine your annual target income</li>
        <li>Add business expenses (software, insurance, equipment, etc.)</li>
        <li>Add taxes and benefits you'll need to cover</li>
        <li>Calculate your billable hours (typically 1,000-1,500 per year)</li>
        <li>Divide your total required income by billable hours</li>
      </ol>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Researching Market Rates</h2>
      <p class="mb-4">Research what others in your field with similar experience charge. Sources include:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Industry surveys and reports</li>
        <li>Freelance platforms where rates are visible</li>
        <li>Professional networks and communities</li>
        <li>Direct conversations with peers</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Factoring in Your Experience and Expertise</h2>
      <p class="mb-4">Your rates should reflect your level of expertise. Early-career freelancers typically charge less than veterans, but specialized knowledge in high-demand areas can command premium rates regardless of years of experience.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Strategies for Raising Your Rates</h2>
      <p class="mb-4">As you gain experience and improve your skills, gradually increase your rates:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Raise rates for new clients first</li>
        <li>Give existing clients advance notice of rate increases</li>
        <li>Increase rates annually to account for inflation</li>
        <li>Add premium service tiers rather than raising base rates</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Conclusion</h2>
      <p class="mb-4">Setting the right freelance rates is a balance between market value, your financial needs, and your expertise. Regularly review and adjust your rates as your skills and the market evolve.</p>
    `,
    date: "August 8, 2023",
    readTime: "10 min read",
    category: "Business Growth",
    image: "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "4",
    title: "Tax Planning for Freelancers: What You Need to Know",
    content: `
      <p class="mb-4">Don't let tax season stress you out. Learn about deductions, quarterly payments, and organization systems specifically for freelancers.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Understanding Self-Employment Taxes</h2>
      <p class="mb-4">As a freelancer, you're responsible for both the employer and employee portions of Social Security and Medicare taxes. This is in addition to regular income tax, which is why proper planning is essential.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Making Quarterly Estimated Tax Payments</h2>
      <p class="mb-4">Unlike traditional employees who have taxes withheld from each paycheck, freelancers must make quarterly estimated tax payments. Missing these payments can result in penalties, so mark these deadlines on your calendar:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>April 15 (for income earned January through March)</li>
        <li>June 15 (for income earned April through May)</li>
        <li>September 15 (for income earned June through August)</li>
        <li>January 15 (for income earned September through December)</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Deductions Every Freelancer Should Know</h2>
      <p class="mb-4">One advantage of self-employment is the ability to deduct business expenses. Common deductions include:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Home office (based on square footage used exclusively for business)</li>
        <li>Internet and phone costs (business portion)</li>
        <li>Professional development and education</li>
        <li>Software and subscriptions</li>
        <li>Health insurance premiums</li>
        <li>Retirement plan contributions</li>
        <li>Professional services (accounting, legal)</li>
        <li>Travel and meals (with business purpose)</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Organizing Your Financial Records</h2>
      <p class="mb-4">Develop a system for tracking income and expenses throughout the year. Options include:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Cloud accounting software like QuickBooks Self-Employed or FreshBooks</li>
        <li>Dedicated business bank accounts and credit cards</li>
        <li>Digital receipt management apps</li>
        <li>Monthly bookkeeping sessions to categorize transactions</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Retirement Planning Options</h2>
      <p class="mb-4">Without an employer-sponsored 401(k), you need to create your own retirement savings plan. Consider:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>SEP IRA (higher contribution limits)</li>
        <li>Solo 401(k) (allows you to contribute as both employer and employee)</li>
        <li>Traditional or Roth IRA (lower limits but easier to set up)</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">When to Hire a Tax Professional</h2>
      <p class="mb-4">While many freelancers start by handling their own taxes, consider working with a tax professional if:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Your business structure is complex (LLC, S-Corp)</li>
        <li>You work across multiple states or internationally</li>
        <li>Your annual revenue exceeds $100,000</li>
        <li>You have significant business assets or employees</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Conclusion</h2>
      <p class="mb-4">Proactive tax planning throughout the year leads to fewer surprises and potentially significant savings. Consider taxes part of your regular business operations rather than a once-a-year event.</p>
    `,
    date: "September 14, 2023",
    readTime: "9 min read",
    category: "Finance",
    image: "https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "5",
    title: "Building Your Personal Brand as a Freelancer",
    content: `
      <p class="mb-4">Your personal brand can be your most valuable asset. Discover strategies to develop and promote your unique professional identity.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Understanding Personal Branding for Freelancers</h2>
      <p class="mb-4">Your personal brand is how clients perceive your professional identity. It's the combination of your skills, reputation, and the unique perspective you bring to your work. A strong personal brand helps you:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Command higher rates</li>
        <li>Attract your ideal clients</li>
        <li>Stand out in competitive markets</li>
        <li>Build trust before clients ever work with you</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Defining Your Brand Foundation</h2>
      <p class="mb-4">Before creating brand assets, clarify these foundational elements:</p>
      <ul class="list-disc pl-6 mb-4">
        <li><strong>Value proposition:</strong> What specific problems do you solve?</li>
        <li><strong>Target audience:</strong> Who benefits most from your services?</li>
        <li><strong>Brand personality:</strong> How do you want to be perceived? (e.g., authoritative, approachable, innovative)</li>
        <li><strong>Unique differentiators:</strong> What makes your approach different from competitors?</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Creating Your Visual Identity</h2>
      <p class="mb-4">Visual elements help clients recognize and remember you:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Professional logo (even if simple)</li>
        <li>Consistent color palette (2-3 primary colors)</li>
        <li>Typography system (1-2 fonts used consistently)</li>
        <li>High-quality profile photos</li>
        <li>Consistent design elements across platforms</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Building an Effective Portfolio</h2>
      <p class="mb-4">Your portfolio should showcase your best work while telling a story about your expertise:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Focus on quality over quantity (6-10 excellent examples)</li>
        <li>Include case studies that explain processes and results</li>
        <li>Highlight different skills and project types</li>
        <li>Feature recognizable clients or industries</li>
        <li>Update regularly with new work</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Content Creation Strategies</h2>
      <p class="mb-4">Sharing your expertise builds authority and attracts clients:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Blog posts on your website</li>
        <li>Guest articles on industry publications</li>
        <li>LinkedIn articles and posts</li>
        <li>YouTube tutorials or process videos</li>
        <li>Podcast appearances or hosting</li>
        <li>Email newsletters with valuable insights</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Networking and Relationship Building</h2>
      <p class="mb-4">Your network amplifies your personal brand:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Engage in relevant online communities</li>
        <li>Attend industry events and conferences</li>
        <li>Collaborate with complementary service providers</li>
        <li>Request and display testimonials from satisfied clients</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Conclusion</h2>
      <p class="mb-4">Building a personal brand is an ongoing process rather than a one-time task. Consistently reinforcing your brand through your work, content, and interactions creates a powerful professional identity that attracts opportunities.</p>
    `,
    date: "October 5, 2023",
    readTime: "7 min read",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?q=80&w=2032&auto=format&fit=crop"
  },
  {
    id: "6",
    title: "Time Management Techniques for the Busy Freelancer",
    content: `
      <p class="mb-4">Maximize your productivity with these tested time management strategies designed specifically for independent professionals.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">The Unique Time Management Challenges of Freelancing</h2>
      <p class="mb-4">Freelancers face distinctive challenges when it comes to managing time:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Juggling multiple clients and projects simultaneously</li>
        <li>Handling both billable work and business administration</li>
        <li>Working without external structure or supervision</li>
        <li>Managing irregular workloads and income</li>
        <li>Combating isolation and maintaining motivation</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Time Blocking for Focused Work</h2>
      <p class="mb-4">Time blocking involves dedicating specific chunks of time to particular tasks or projects:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Schedule 90-120 minute blocks for deep, focused work</li>
        <li>Group similar tasks together (batching)</li>
        <li>Include buffer time between blocks for transitions</li>
        <li>Schedule both client work and administrative tasks</li>
        <li>Protect your most productive hours for high-value work</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">The Pomodoro Technique for Sustained Focus</h2>
      <p class="mb-4">This technique involves working in 25-minute intervals with short breaks:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Set a timer for 25 minutes of focused work</li>
        <li>Take a 5-minute break when the timer rings</li>
        <li>After four cycles, take a longer 15-30 minute break</li>
        <li>Track completed cycles to measure productivity</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Prioritization Methods</h2>
      <p class="mb-4">Effective prioritization ensures you're working on the right tasks:</p>
      <ul class="list-disc pl-6 mb-4">
        <li><strong>Eisenhower Matrix:</strong> Sort tasks by importance and urgency</li>
        <li><strong>MIT (Most Important Tasks):</strong> Identify 1-3 critical tasks each day</li>
        <li><strong>Revenue-based priority:</strong> Prioritize work that directly generates income</li>
        <li><strong>Energy matching:</strong> Align tasks with your energy levels throughout the day</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Creating Effective Systems and Processes</h2>
      <p class="mb-4">Documented processes save time and maintain consistency:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Create templates for recurring deliverables</li>
        <li>Develop checklists for common procedures</li>
        <li>Automate repetitive tasks where possible</li>
        <li>Create client onboarding and offboarding systems</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Setting Boundaries with Clients</h2>
      <p class="mb-4">Clear boundaries prevent time leaks and protect your schedule:</p>
      <ul class="list-disc pl-6 mb-4">
        <li>Establish and communicate working hours</li>
        <li>Define expectations for response times</li>
        <li>Create policies for rush requests and scope changes</li>
        <li>Schedule client meetings on specific days</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Conclusion</h2>
      <p class="mb-4">Effective time management as a freelancer isn't about working more hours—it's about maximizing the value of the hours you work. Experiment with these techniques to find the combination that works best for your workflow and personality.</p>
    `,
    date: "November 20, 2023",
    readTime: "5 min read",
    category: "Productivity",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop"
  }
];

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Find the current post and related posts
    const currentPost = blogPosts.find(post => post.id === id);
    
    if (currentPost) {
      setPost(currentPost);
      
      // Find 2-3 related posts (same category or random if not enough)
      const related = blogPosts
        .filter(p => p.id !== id && p.category === currentPost.category)
        .slice(0, 2);
      
      // If we need more related posts, add some random ones
      if (related.length < 2) {
        const randomPosts = blogPosts
          .filter(p => p.id !== id && !related.includes(p))
          .slice(0, 2 - related.length);
        
        setRelatedPosts([...related, ...randomPosts]);
      } else {
        setRelatedPosts(related);
      }
    }
  }, [id]);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p>Post not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <Link to="/blog" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to all articles
            </Link>
            
            <div className="mb-6">
              <div className="text-sm text-blue-600 font-medium mb-2">{post.category}</div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
              
              <div className="flex items-center text-sm text-gray-500 mb-6">
                <div className="flex items-center mr-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
            
            {post.image && (
              <div className="rounded-xl overflow-hidden mb-8">
                <img src={post.image} alt={post.title} className="w-full h-auto" />
              </div>
            )}
            
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
            
            {/* Share section */}
            <div className="border-t border-b py-6 my-10">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4">Share this article</h3>
                <div className="flex justify-center space-x-4">
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19.995 6.89a8 8 0 0 0-1.862-2.133A8.046 8.046 0 0 0 12 2.507a8.046 8.046 0 0 0-6.133 2.25A8 8 0 0 0 3.734 6.89 8.046 8.046 0 0 0 3 12.022c0 1.614.384 3.084 1.141 4.4a8 8 0 0 0 2.992 3.039 8.046 8.046 0 0 0 4.117 1.132V14.25h-2.625v-2.25h2.625v-1.8c0-1.232.287-2.143.87-2.73.58-.592 1.446-.885 2.59-.885.952 0 1.683.053 2.192.16v2.1H14.5c-.687 0-1.143.148-1.375.445-.232.298-.35.736-.35 1.32v1.38h2.5l-.344 2.25h-2.156v6.343a8.046 8.046 0 0 0 4.118-1.132 8 8 0 0 0 2.992-3.038c.758-1.317 1.141-2.787 1.141-4.401a8.046 8.046 0 0 0-.734-5.133Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Related articles */}
            {relatedPosts.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedPosts.map(relatedPost => (
                    <div key={relatedPost.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="h-48 overflow-hidden">
                        <img src={relatedPost.image} alt={relatedPost.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-5">
                        <div className="text-sm text-blue-600 font-medium mb-2">{relatedPost.category}</div>
                        <h4 className="font-bold mb-2">{relatedPost.title}</h4>
                        <Link to={`/blog/${relatedPost.id}`}>
                          <Button variant="link" className="flex items-center p-0 font-medium">
                            Read Article <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </FadeIn>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPost;
