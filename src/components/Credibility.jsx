import { Shield, Users, Calendar, Award } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const iconMap = { Shield, Users, Calendar, Award };

const defaultStats = [
  { icon: "Shield", value: "ISO 9001:2015", label: "Certified Quality Management" },
  { icon: "Users", value: "200+", label: "Happy Clients" },
  { icon: "Calendar", value: "30+", label: "Years of Excellence" },
  { icon: "Award", value: "CII MSME", label: "Member & GeM Registered" },
];

// content comes from Index.jsx → content.credibility (flat key-value from admin CMS)
const Credibility = ({ content = {} }) => {

  // Build stats from individual fields (stat1_icon, stat1_value, stat1_label etc.)
  const buildStats = () => {
    const stats = [1, 2, 3, 4].map((i) => ({
      icon: content[`stat${i}_icon`] || defaultStats[i - 1].icon,
      value: content[`stat${i}_value`] || defaultStats[i - 1].value,
      label: content[`stat${i}_label`] || defaultStats[i - 1].label,
    }));
    // If all values are still default (no admin content yet), return defaults
    return stats;
  };

  const stats = buildStats();

  return (
    <section className="bg-sand-dark/30 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, i) => {
            const Icon = iconMap[stat.icon] || Shield;
            return (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="flex flex-col items-center text-center group">
                  <div className="w-12 h-12 bg-defence-green/10 flex items-center justify-center mb-4 group-hover:bg-brass-gold/15 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-defence-green group-hover:text-brass-gold transition-colors duration-300" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{stat.value}</span>
                  <span className="text-sm text-muted-foreground leading-tight">{stat.label}</span>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Credibility;