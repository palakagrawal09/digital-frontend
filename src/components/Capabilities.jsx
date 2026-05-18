import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import ScrollReveal from "@/components/ScrollReveal";
import { Shield, Cpu, Wrench, BookOpen, Settings, Zap } from "lucide-react";

const iconList = [Shield, Cpu, Wrench, BookOpen, Settings, Zap];

const safeParseJson = (val, fallback) => {
  try { return JSON.parse(val) || fallback; }
  catch { return fallback; }
};

// content prop comes from Index.jsx (admin homepage CMS)
const Capabilities = ({ content = {} }) => {
  const [services, setServices] = useState([]);

  const subtitle = content.subtitle || "Capabilities";
  const title = content.title || "Our Core Capabilities";
  const description = content.description || "Defence-grade engineering, automation, maintenance and consultancy solutions for mission-critical requirements.";

  useEffect(() => {
    apiClient.getServices()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setServices(data.filter((s) => s.published !== false));
      })
      .catch((err) => console.error("Services fetch error:", err));
  }, []);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header from admin CMS */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-brass-gold mb-2">
            {subtitle}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
        </div>

        {/* Services Grid from backend */}
        {services.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((item, index) => {
              const Icon = iconList[index % iconList.length];
              return (
                <ScrollReveal key={item.id || index} delay={index * 0.1}>
                  <div className="p-6 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-brass-gold/40 transition-all duration-200 bg-white">
                    <div className="w-12 h-12 bg-defence-green/10 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-defence-green" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Loading capabilities...</p>
        )}
      </div>
    </section>
  );
};

export default Capabilities;