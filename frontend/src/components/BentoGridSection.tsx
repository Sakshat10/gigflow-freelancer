
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FadeIn } from "@/components/animations/FadeIn";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { motion } from "framer-motion";
import {
  CreditCard,
  FolderSync,
  LayoutDashboard,
  Sparkles,
  Zap,
  ArrowRight,
} from "lucide-react";

const benefits = [
  {
    icon: CreditCard,
    title: "Fewer Payment Follow-ups",
    subtitle:
      "Send invoices directly from the workspace. Clients see them, you get paid faster.",
    colors: ["#3B82F6", "#60A5FA", "#93C5FD"],
  },
  {
    icon: FolderSync,
    title: "No More File Confusion",
    subtitle:
      "Upload once. Clients always see the latest version. No more WhatsApp file hunting.",
    colors: ["#10B981", "#34D399", "#6EE7B7"],
  },
  {
    icon: LayoutDashboard,
    title: "Everything in One Place",
    subtitle:
      "Chat, files, tasks, invoices — all inside one client workspace. No tool switching.",
    colors: ["#F59E0B", "#FBBF24", "#FDE68A"],
  },
  {
    icon: Sparkles,
    title: "Look Professional",
    subtitle:
      "Even if you're working solo, your clients see a clean, organized workspace.",
    colors: ["#8B5CF6", "#A78BFA", "#C4B5FD"],
  },
  {
    icon: Zap,
    title: "Start Free, Scale Up",
    subtitle:
      "One free client workspace. No credit card. Upgrade when you're ready.",
    colors: ["#EC4899", "#F472B6", "#FBCFE8"],
  },
];

const BentoGridSection: React.FC = () => {
  return (
    <section className="py-24 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              Why freelancers{" "}
              <span className="text-gradient">switch to GigFlow</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Stop juggling WhatsApp, email, Drive, and payment reminders.
            </p>
          </div>
        </FadeIn>

        {/* Grid: 3 top, 2 bottom centered */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            // First 3 cards: span 2 cols each. Last 2: offset to center
            const colClass =
              index < 3
                ? "md:col-span-2"
                : index === 3
                  ? "md:col-start-2 md:col-span-2"
                  : "md:col-span-2";

            return (
              <motion.div
                key={benefit.title}
                className={`${colClass} relative overflow-hidden rounded-2xl border border-gray-100 bg-white h-[200px] group hover:shadow-lg transition-shadow duration-300`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Gradient background — subtle, sits behind content */}
                <div className="absolute inset-0 opacity-40">
                  <AnimatedGradient
                    colors={benefit.colors}
                    speed={0.05}
                    blur="medium"
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200/60 flex items-center justify-center mb-4 shadow-sm">
                      <Icon className="h-5 w-5 text-gray-700" strokeWidth={1.8} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                      {benefit.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {benefit.subtitle}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <FadeIn>
          <div className="mt-14 text-center">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2.5 bg-gray-900 text-white px-7 py-3.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors duration-200 shadow-sm"
            >
              Get Started — It's Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-gray-400 text-xs mt-3 tracking-wide">
              No credit card required · 1 free workspace included
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default BentoGridSection;
