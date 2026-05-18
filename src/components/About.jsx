import { Calendar, Users, Heart, Lightbulb, Eye, Target } from "lucide-react";

const iconMap = { Calendar, Users, Heart, Lightbulb, Eye, Target };

const defaultStats = [
  { icon: "Calendar", value: "33+", label: "Years in Business" },
  { icon: "Users", value: "200+", label: "Happy Clients" },
  { icon: "Heart", value: "30+", label: "Team of Experts" },
  { icon: "Lightbulb", value: "ISO 9001", label: "Certified Quality" },
];

const defaultValues = [
  "Agile to Customer Needs",
  "Perfect Team Work",
  "Focused Quality Improvements",
  "Sustained Innovation & Engineering",
];

// content prop comes from Index.jsx → content.about (flat key-value from admin CMS)
const About = ({ content = {} }) => {

  // Build stats from individual fields
  const stats = [1, 2, 3, 4].map((i) => ({
    icon: content[`stat${i}_icon`] || defaultStats[i - 1].icon,
    value: content[`stat${i}_value`] || defaultStats[i - 1].value,
    label: content[`stat${i}_label`] || defaultStats[i - 1].label,
  }));

  // Build values from individual fields
  const values = [1, 2, 3, 4].map((i) =>
    content[`value${i}_text`] || defaultValues[i - 1]
  );

  return (
    <section id="about" className="py-20 md:py-28 bg-[#f8f5ef]">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <p className="text-[#b8860b] uppercase tracking-[4px] font-semibold mb-4">
            {content.subtitle || "About Us"}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1b1b1b] mb-6">
            {content.title || "A Legacy of Excellence"}
          </h2>
          <p className="text-gray-600 leading-8 text-lg">
            {content.intro || ""}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <h3 className="text-3xl font-bold text-[#1b1b1b] mb-6">
              {content.overview_title || "Company Overview"}
            </h3>
            <p className="text-gray-600 leading-8 mb-6">{content.overview || ""}</p>

            <div className="bg-white border border-gray-200 p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-[#b8860b]" />
                <h4 className="text-xl font-semibold text-[#1b1b1b]">Our Vision</h4>
              </div>
              <p className="text-gray-600 leading-7">{content.vision || ""}</p>
            </div>

            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-[#b8860b]" />
                <h4 className="text-xl font-semibold text-[#1b1b1b]">Our Mission</h4>
              </div>
              <p className="text-gray-600 leading-7">{content.mission || ""}</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="overflow-hidden shadow-lg border border-gray-200 bg-white">
              <img
                src={content.team_photo || '/assets/team-photo.png'}
                alt="DIPL Team"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.closest(".overflow-hidden").style.display = "none";
                }}
              />
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">
                  {content.team_photo_caption || 'The DIPL team at our facility in Electronic Complex, Pardeshipura, Indore'}
                </p>
              </div>
            </div>

            {/* Stats grid — individual fields */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((item, index) => {
                const Icon = iconMap[item.icon] || Calendar;
                return (
                  <div key={index} className="bg-white border border-gray-200 p-6 text-center shadow-sm">
                    <div className="w-12 h-12 mx-auto mb-4 bg-green-100 flex items-center justify-center rounded-full">
                      <Icon className="w-6 h-6 text-green-700" />
                    </div>
                    <h4 className="text-2xl font-bold text-[#1b1b1b] mb-1">{item.value}</h4>
                    <p className="text-sm text-gray-600">{item.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Core Values — individual fields */}
            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <h4 className="text-xl font-semibold text-[#1b1b1b] mb-5">Core Values</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {values.map((text, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#b8860b]" />
                    <p className="text-gray-600">{text}</p>
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