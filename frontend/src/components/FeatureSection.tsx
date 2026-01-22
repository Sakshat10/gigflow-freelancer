
import React, { useState, useEffect } from "react";
import { FadeIn } from "@/components/animations/FadeIn";
import { 
  KeyRound, 
  Upload, 
  MessageSquare, 
  FileText, 
  Bell, 
  CreditCard,
  LucideIcon
} from "lucide-react";
import { fetchFeatures } from "@/services/api";
import { Feature } from "@/types";

const FeatureSection: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const featuresData = await fetchFeatures();
        setFeatures(featuresData);
      } catch (error) {
        // Removed console.error
      } finally {
        setLoading(false);
      }
    };

    loadFeatures();
  }, []);

  // Map icon names to actual icon components
  const getIconForFeature = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      KeyRound: <KeyRound className="h-6 w-6 text-blue-500" />,
      Upload: <Upload className="h-6 w-6 text-purple-500" />,
      MessageSquare: <MessageSquare className="h-6 w-6 text-green-500" />,
      FileText: <FileText className="h-6 w-6 text-amber-500" />,
      Bell: <Bell className="h-6 w-6 text-rose-500" />,
      CreditCard: <CreditCard className="h-6 w-6 text-indigo-500" />,
    };
    
    return iconMap[iconName] || <KeyRound className="h-6 w-6 text-blue-500" />;
  };

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <p>Loading features...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful tools to <span className="text-gradient">grow your freelance business</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Eliminate admin hassles and focus on what you do best: delivering exceptional work to your clients.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FadeIn 
              key={index} 
              delay={(index * 100 > 500 ? "500" : (index * 100).toString()) as any}
              fullWidth
            >
              <div className="glass-effect rounded-2xl p-6 h-full hover-translate">
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-4`}>
                  {getIconForFeature(feature.icon as string)}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
