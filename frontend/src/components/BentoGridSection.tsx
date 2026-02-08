
import React, { useState, useEffect } from "react";
import { BentoCard } from "@/components/ui/bento-card";
import { FadeIn } from "@/components/animations/FadeIn";
import { fetchBentoCardData } from "@/services/api";
import { BentoCardData } from "@/types";

const BentoGridSection: React.FC = () => {
  const [cards, setCards] = useState<BentoCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchBentoCardData();
        setCards(data);
      } catch (error) {
        // Removed console.error
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <p>Loading stats...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Why freelancers <span className="text-gradient">switch to GigFlow</span>
          </h2>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <ul className="text-gray-600 text-lg space-y-2">
              <li>✓ Fewer payment follow-ups</li>
              <li>✓ No more "latest file kaunsa hai?" messages</li>
              <li>✓ Everything stays inside one client workspace</li>
              <li>✓ Look professional even if you're working solo</li>
            </ul>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[800px]">
          {cards.length >= 5 && (
            <>
              <div className="md:col-span-2 h-[250px] md:h-auto">
                <BentoCard
                  title={cards[0].title}
                  value={cards[0].value}
                  subtitle={cards[0].subtitle}
                  colors={cards[0].colors}
                  delay={0.2}
                />
              </div>
              <div className="h-[250px] md:h-auto">
                <BentoCard
                  title={cards[1].title}
                  value={cards[1].value}
                  subtitle={cards[1].subtitle}
                  colors={cards[1].colors}
                  delay={0.4}
                />
              </div>
              <div className="h-[250px] md:h-auto">
                <BentoCard
                  title={cards[2].title}
                  value={cards[2].value}
                  subtitle={cards[2].subtitle}
                  colors={cards[2].colors}
                  delay={0.6}
                />
              </div>
              <div className="md:col-span-2 h-[250px] md:h-auto">
                <BentoCard
                  title={cards[3].title}
                  value={cards[3].value}
                  subtitle={cards[3].subtitle}
                  colors={cards[3].colors}
                  delay={0.8}
                />
              </div>
              <div className="md:col-span-3 h-[250px] md:h-auto">
                <BentoCard
                  title={cards[4].title}
                  value={cards[4].value}
                  subtitle={cards[4].subtitle}
                  colors={cards[4].colors}
                  delay={1}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default BentoGridSection;
