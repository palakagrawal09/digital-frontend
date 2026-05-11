import { useEffect, useState } from "react";
import { Calendar, Users, Heart, Lightbulb, Eye, Target } from "lucide-react";

const API_BASE_URL =
  `${import.meta.env.VITE_BACKEND_URL || "https://digital-backend-dsn7.onrender.com"}/api`;

const iconMap = {
  Calendar,
  Users,
  Heart,
  Lightbulb,
  Eye,
  Target,
};

const buildContentMap = (items = []) => {
  return items.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = {};
    acc[item.section][item.content_key] = item.content_value;
    return acc;
  }, {});
};

const safeJson = (value, fallback = []) => {
  try {
    return JSON.parse(value || "[]");
  } catch {
    return fallback;
  }
};

const About = () => {
  const [about, setAbout] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAbout = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/page-content?page=homepage`);
        const data = await res.json();

        const items = Array.isArray(data) ? data : data?.data || [];
        const contentMap = buildContentMap(items);

        setAbout(contentMap.about || {});
      } catch (error) {
        console.error("Homepage about fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAbout();
  }, []);

  const stats = safeJson(about.stats_json, []);
  const values = safeJson(about.values_json, []);

  if (loading) {
    return (
      <section id="about" className="py-20 bg-[#f8f5ef] text-center">
        <p>Loading About...</p>
      </section>
    );
  }

  return (
    <section id="about" className="py-20 md:py-28 bg-[#f8f5ef]">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <p className="text-[#b8860b] uppercase tracking-[4px] font-semibold mb-4">
            {about.subtitle || "About Us"}
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-[#1b1b1b] mb-6">
            {about.title || "A Legacy of Excellence"}
          </h2>

          <p className="text-gray-600 leading-8 text-lg">
            {about.intro}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <h3 className="text-3xl font-bold text-[#1b1b1b] mb-6">
              {about.overview_title || "Company Overview"}
            </h3>

            <p className="text-gray-600 leading-8 mb-6">
              {about.overview}
            </p>

            <div className="bg-white border border-gray-200 p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-[#b8860b]" />
                <h4 className="text-xl font-semibold text-[#1b1b1b]">
                  Our Vision
                </h4>
              </div>
              <p className="text-gray-600 leading-7">{about.vision}</p>
            </div>

            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-[#b8860b]" />
                <h4 className="text-xl font-semibold text-[#1b1b1b]">
                  Our Mission
                </h4>
              </div>
              <p className="text-gray-600 leading-7">{about.mission}</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="overflow-hidden shadow-lg border border-gray-200 bg-white">
              <img
                src="/assets/team-photo.png"
                alt="DIPL Team"
                className="w-full h-auto object-cover"
              />
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">
                  The DIPL team at our facility in Electronic Complex, Pardeshipura, Indore
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((item, index) => {
                const Icon = iconMap[item.icon] || Calendar;

                return (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 p-6 text-center shadow-sm"
                  >
                    <div className="w-12 h-12 mx-auto mb-4 bg-green-100 flex items-center justify-center rounded-full">
                      <Icon className="w-6 h-6 text-green-700" />
                    </div>
                    <h4 className="text-2xl font-bold text-[#1b1b1b] mb-1">
                      {item.value}
                    </h4>
                    <p className="text-sm text-gray-600">{item.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <h4 className="text-xl font-semibold text-[#1b1b1b] mb-5">
                Core Values
              </h4>

              <div className="grid sm:grid-cols-2 gap-3">
                {values.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#b8860b]" />
                    <p className="text-gray-600">
                      {item.text || item.value || item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;