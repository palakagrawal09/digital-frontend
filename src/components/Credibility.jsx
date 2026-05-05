import { useEffect, useMemo, useState } from "react";
import { Shield, Users, Calendar, Award } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { apiClient } from "@/lib/api";

const iconMap = {
  Shield,
  Users,
  Calendar,
  Award,
};

const defaultStats = [
  {
    icon: "Shield",
    value: "ISO 9001:2015",
    label: "Certified Quality Management",
  },
  {
    icon: "Users",
    value: "200+",
    label: "Happy Clients",
  },
  {
    icon: "Calendar",
    value: "30+",
    label: "Years of Excellence",
  },
  {
    icon: "Award",
    value: "CII MSME",
    label: "Member & GeM Registered",
  },
];

const normalizeIconName = (value = "") => {
  const cleaned = String(value).trim().toLowerCase();

  if (cleaned === "shield") return "Shield";
  if (cleaned === "users") return "Users";
  if (cleaned === "calendar") return "Calendar";
  if (cleaned === "award") return "Award";

  return "Shield";
};

const Credibility = () => {
  const [pageContent, setPageContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCredibilityContent = async () => {
      try {
        setLoading(true);

        const response = await apiClient.getPageContent("home");
        const records = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];

        setPageContent(records);
      } catch (error) {
        console.error("Failed to load home page content:", error);
        setPageContent([]);
      } finally {
        setLoading(false);
      }
    };

    loadCredibilityContent();
  }, []);

  const stats = useMemo(() => {
    const certificateRecords = pageContent.filter(
      (item) =>
        String(item.page || "").toLowerCase() === "home" &&
        String(item.section || "").toLowerCase() === "certificate" &&
        item.published !== false
    );

    if (!certificateRecords.length) {
      return defaultStats;
    }

    const contentMap = {};
    certificateRecords.forEach((item) => {
      const key = String(item.content_key || "").trim();
      const value = String(item.content_value || "").trim();

      if (key) {
        contentMap[key] = value;
      }
    });

    const dynamicStats = [1, 2, 3, 4]
      .map((index) => {
        const value = contentMap[`stat_${index}_value`] || "";
        const label = contentMap[`stat_${index}_label`] || "";
        const icon = normalizeIconName(contentMap[`stat_${index}_icon`] || "");

        if (!value && !label) return null;

        return {
          icon,
          value,
          label,
        };
      })
      .filter(Boolean);

    return dynamicStats.length ? dynamicStats : defaultStats;
  }, [pageContent]);

  const visibleStats = loading ? defaultStats : stats;

  return (
    <section className="bg-sand-dark/30 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {visibleStats.map((stat, i) => {
            const Icon = iconMap[stat.icon] || Shield;

            return (
              <ScrollReveal key={`${stat.label}-${i}`} delay={i * 0.1}>
                <div className="flex flex-col items-center text-center group">
                  <div className="w-12 h-12 bg-defence-green/10 flex items-center justify-center mb-4 group-hover:bg-brass-gold/15 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-defence-green group-hover:text-brass-gold transition-colors duration-300" />
                  </div>

                  <span className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </span>

                  <span className="text-sm text-muted-foreground leading-tight">
                    {stat.label}
                  </span>
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