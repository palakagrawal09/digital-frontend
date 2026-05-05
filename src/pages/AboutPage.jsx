import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Building2,
  Calendar,
  Users,
  IndianRupee,
  Shield,
  MapPin,
  Award,
  FileCheck,
  CheckCircle,
  Eye,
  Target,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const statIconMap = {
  Calendar,
  Building2,
  Users,
  IndianRupee,
};

const certIconMap = {
  Shield,
  Award,
  FileCheck,
  CheckCircle,
};

const defaultStats = [
  { icon: "Calendar", value: "1990", label: "Established" },
  { icon: "Building2", value: "6000 Sq.Ft", label: "Facility Area" },
  { icon: "Users", value: "200+", label: "Happy Clients" },
  { icon: "IndianRupee", value: "33+", label: "Team of Experts" },
];

const certificationDescriptions = {
  "ISO 9001:2015":
    "Certified Quality Management System ensuring consistent product quality and continuous improvement.",
  "India 5000 Best MSME":
    "Nominated for India 5000 Best MSME Award 2019 for Quality Excellence.",
  "GeM Registered Seller":
    "Registered on the Government e-Marketplace for transparent government procurement.",
  "SIDM MSME Member":
    "Society of Indian Defence Manufacturers (SIDM).",
};

const normalizeImagePath = (path) => {
  if (!path) return "";
  if (Array.isArray(path)) return path[0] || "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/assets/")) return path;
  return `/assets/${path.split("/").pop()}`;
};

const extractOverviewContent = (description = "") => {
  const text = description.replace(/\/n/g, "\n").trim();

  const visionMatch = text.match(/Our Vision\s*([\s\S]*?)(?=Our Mission|$)/i);
  const missionMatch = text.match(/Our Mission\s*([\s\S]*?)$/i);

  const introText = text
    .replace(/Our Vision[\s\S]*?(?=Our Mission|$)/i, "")
    .replace(/Our Mission[\s\S]*$/i, "")
    .trim();

  const introParagraphs = introText
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    introParagraphs,
    vision: visionMatch?.[1]?.trim() || "",
    mission: missionMatch?.[1]?.trim() || "",
  };
};

const parseHighlights = (description = "") => {
  const normalized = description.replace(/\/n/g, "\n");
  const parts = normalized.split(/Key Highlights/i);

  const bio = parts[0]?.trim() || "";
  const achievements = parts[1]
    ? parts[1]
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return { bio, achievements };
};

const SectionTitle = ({ eyebrow, title, centered = true }) => {
  if (centered) {
    return (
      <div className="text-center mb-16 md:mb-20">
        {eyebrow ? (
          <div className="inline-flex items-center gap-4 mb-5">
            <span className="w-14 h-[1px] bg-brass-gold/80" />
            <span className="text-brass-gold font-semibold text-sm uppercase tracking-[0.18em]">
              {eyebrow}
            </span>
            <span className="w-14 h-[1px] bg-brass-gold/80" />
          </div>
        ) : null}

        <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
          {title}
        </h2>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground flex items-center gap-3 leading-tight">
        <span className="w-10 h-[2px] bg-brass-gold" />
        {title}
      </h2>
    </div>
  );
};

const AboutPage = () => {
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError("");

        const [categoriesRes, sectionsRes, contactRes] = await Promise.all([
          fetch(`${API_BASE_URL}/about-categories`),
          fetch(`${API_BASE_URL}/about-sections`),
          fetch(`${API_BASE_URL}/contact`),
        ]);

        if (!categoriesRes.ok) {
          throw new Error("Failed to fetch about categories");
        }
        if (!sectionsRes.ok) {
          throw new Error("Failed to fetch about sections");
        }
        if (!contactRes.ok) {
          throw new Error("Failed to fetch contact data");
        }

        const categoriesData = await categoriesRes.json();
        const sectionsData = await sectionsRes.json();
        const contactApiData = await contactRes.json();

        setCategories(categoriesData);
        setSections(sectionsData);
        setContactData(contactApiData);
      } catch (err) {
        console.error("About page fetch error:", err);
        setError("Failed to load About page data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, []);

  const getCategoryId = (name) =>
    categories.find(
      (item) => item.name?.trim().toLowerCase() === name.trim().toLowerCase()
    )?.id;

  const directorCategoryId = getCategoryId("Director");
  const advisoryCategoryId = getCategoryId("Advisory");
  const companyOverviewCategoryId = getCategoryId("Company Overview");

  const directors = useMemo(() => {
    return sections
      .filter((item) => item.category_id === directorCategoryId)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((item) => {
        const { bio, achievements } = parseHighlights(
          item.content || item.description || ""
        );

        return {
          id: item.id,
          name: item.title,
          designation: item.designation || "",
          photo: normalizeImagePath(item.image_url),
          bio,
          achievements,
        };
      });
  }, [sections, directorCategoryId]);

  const advisors = useMemo(() => {
    return sections
      .filter((item) => item.category_id === advisoryCategoryId)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((item) => ({
        id: item.id,
        name: item.title,
        designation: item.designation || "",
        photo: normalizeImagePath(item.image_url),
        bio: item.content || item.description || "",
      }));
  }, [sections, advisoryCategoryId]);

  const companyOverview = useMemo(() => {
    const item = sections
      .filter((section) => section.category_id === companyOverviewCategoryId)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];

    if (!item) return null;

    const content = extractOverviewContent(
      item.content || item.description || ""
    );

    return {
      title: item.title,
      image: normalizeImagePath(item.image_url),
      introParagraphs: content.introParagraphs,
      vision: content.vision,
      mission: content.mission,
    };
  }, [sections, companyOverviewCategoryId]);

  const certifications = useMemo(() => {
    const apiCerts = contactData?.certifications || [];
    return apiCerts.map((title) => ({
      title,
      icon:
        title === "ISO 9001:2015"
          ? "Shield"
          : title === "India 5000 Best MSME"
          ? "Award"
          : title === "GeM Registered Seller"
          ? "FileCheck"
          : title === "SIDM MSME Member"
          ? "CheckCircle"
          : "Shield",
      description:
        certificationDescriptions[title] ||
        "Recognized certification or compliance credential associated with DIPL operations.",
    }));
  }, [contactData]);

  const registeredAddr = useMemo(() => {
    const office = contactData?.registered_office;
    if (!office) return "No address available";
    return [office.address_line_1, office.address_line_2, office.address_line_3]
      .filter(Boolean)
      .join("\n");
  }, [contactData]);

  const corporateAddr = useMemo(() => {
    const office = contactData?.corporate_office;
    if (!office) return "No address available";
    return [office.address_line_1, office.address_line_2, office.address_line_3]
      .filter(Boolean)
      .join("\n");
  }, [contactData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-24">
          <div className="container-width px-4 text-center">
            <p className="text-lg font-medium text-foreground">
              Loading About Page...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-24">
          <div className="container-width px-4 text-center">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="pt-32 pb-18 bg-sand-dark/50">
          <div className="container-width px-4">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-4 mb-5">
                <span className="w-14 h-[1px] bg-brass-gold/80" />
                <span className="text-brass-gold font-semibold text-sm uppercase tracking-[0.18em]">
                  About DIPL
                </span>
                <span className="w-14 h-[1px] bg-brass-gold/80" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
                33+ Years of Innovation
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed">
                An ISO 9001:2015 Company established in 1990-91 by IT Industry
                professionals — providing complete solutions for Defence,
                Industrial Automation & Controls.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-background">
          <div className="container-width">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {defaultStats.map((stat) => {
                const Icon = statIconMap[stat.icon] || Calendar;
                return (
                  <div
                    key={stat.label}
                    className="card-defence p-6 text-center group h-full flex flex-col items-center justify-center"
                  >
                    <div className="w-12 h-12 mx-auto mb-4 bg-defence-green/10 flex items-center justify-center group-hover:bg-brass-gold/15 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-defence-green group-hover:text-brass-gold transition-colors duration-300" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-sand-dark/30">
          <div className="container-width">
            <div className="grid lg:grid-cols-2 gap-14 items-start">
              <div className="space-y-6">
                <SectionTitle title="Company Overview" centered={false} />

                {companyOverview?.introParagraphs?.length ? (
                  companyOverview.introParagraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-muted-foreground leading-8 text-[16px]"
                    >
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    No company overview content found.
                  </p>
                )}

                {companyOverview?.vision ? (
                  <div className="bg-card border border-gunmetal/15 p-5">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-[20px]">
                      <Eye className="w-5 h-5 text-brass-gold" />
                      Our Vision
                    </h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {companyOverview.vision}
                    </p>
                  </div>
                ) : null}

                {companyOverview?.mission ? (
                  <div className="bg-card border border-gunmetal/15 p-5">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-[20px]">
                      <Target className="w-5 h-5 text-brass-gold" />
                      Our Mission
                    </h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {companyOverview.mission}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="space-y-6 pt-1">
                <div className="card-defence overflow-hidden">
                  <img
                    src={companyOverview?.image || "/assets/team-photo.png"}
                    alt={companyOverview?.title || "DIPL Team"}
                    className="w-full h-auto object-cover"
                  />
                  <div className="p-4 text-center bg-card">
                    <p className="text-muted-foreground text-sm">
                      The DIPL team at our facility in Electronic Complex,
                      Pardeshipura, Indore
                    </p>
                  </div>
                </div>

                <div className="card-defence overflow-hidden">
                  <img
                    src="/assets/msme-award.jpg"
                    alt="India 5000 Best MSME Award"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="leadership" className="py-20 md:py-24 bg-background">
          <div className="container-width">
            <SectionTitle eyebrow="Leadership" title="Our Directors" />

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">
              {directors.length > 0 ? (
                directors.map((director) => (
                  <div
                    key={director.id}
                    className="card-defence p-6 h-full flex flex-col"
                  >
                    <div className="flex items-start gap-5 mb-5 min-h-[118px]">
                      <img
                        src={director.photo || "/assets/director-sunil-vyas.jpg"}
                        alt={director.name}
                        className="w-24 h-28 object-cover object-top border border-gunmetal/15 flex-shrink-0"
                      />
                      <div className="flex-1 pt-1">
                        <h3 className="text-[22px] md:text-[24px] leading-tight font-display font-semibold text-foreground mb-2">
                          {director.name}
                        </h3>

                        {director.designation && (
                          <p className="text-brass-gold font-medium text-[15px] leading-snug">
                            {director.designation}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-muted-foreground text-[15px] leading-8 mb-5 flex-1 whitespace-pre-line">
                      {director.bio}
                    </p>

                    {director.achievements?.length > 0 ? (
                      <div className="pt-4 border-t border-gunmetal/15 mt-auto">
                        <p className="text-[11px] font-semibold text-foreground mb-2 uppercase tracking-[0.18em]">
                          Key Highlights
                        </p>
                        <ul className="space-y-2">
                          {director.achievements.map((item, index) => (
                            <li
                              key={index}
                              className="text-[12px] text-muted-foreground flex items-start gap-2 leading-relaxed"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-defence-green mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground col-span-full">
                  No directors found.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-sand-dark/30">
          <div className="container-width">
            <SectionTitle eyebrow="Advisors" title="Advisory Board" />

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
              {advisors.length > 0 ? (
                advisors.map((advisor) => (
                  <div
                    key={advisor.id}
                    className="card-defence p-6 text-center h-full flex flex-col items-center"
                  >
                    <img
                      src={advisor.photo || "/assets/advisor-satyevir-yadav.jpg"}
                      alt={advisor.name}
                      className="w-24 h-28 object-cover object-top mx-auto mb-5 border border-gunmetal/15"
                    />

                    <h3 className="text-[22px] leading-tight font-display font-semibold text-foreground min-h-[56px] flex items-center justify-center">
                      {advisor.name}
                    </h3>

                    {advisor.designation && (
                      <p className="text-brass-gold font-medium text-sm mt-2 mb-4 leading-relaxed min-h-[48px]">
                        {advisor.designation}
                      </p>
                    )}

                    <p className="text-muted-foreground text-sm leading-7 whitespace-pre-line flex-1">
                      {advisor.bio}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground col-span-full">
                  No advisory members found.
                </p>
              )}
            </div>
          </div>
        </section>

        <section id="certifications" className="py-20 md:py-24 bg-background">
          <div className="container-width">
            <SectionTitle
              eyebrow="Quality & Compliance"
              title="Certifications & Compliance"
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {certifications.length > 0 ? (
                certifications.map((cert) => {
                  const CertIcon = certIconMap[cert.icon] || Shield;
                  return (
                    <div
                      key={cert.title}
                      className="card-defence p-6 text-center group h-full flex flex-col items-center"
                    >
                      <div className="w-14 h-14 mx-auto mb-5 bg-defence-green/10 flex items-center justify-center group-hover:bg-brass-gold/15 transition-colors duration-300">
                        <CertIcon className="w-7 h-7 text-defence-green group-hover:text-brass-gold transition-colors duration-300" />
                      </div>

                      <h3 className="text-lg font-display font-semibold text-foreground mb-3 min-h-[56px] flex items-center justify-center">
                        {cert.title}
                      </h3>

                      <p className="text-muted-foreground text-sm leading-7 flex-1 max-w-[240px] mx-auto">
                        {cert.description}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground col-span-full">
                  No certifications found.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-sand-dark/30">
          <div className="container-width">
            <SectionTitle title="Our Locations" />

            <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
              <div className="card-defence p-6 h-full">
                <div className="flex items-center gap-3 mb-5 min-h-[40px]">
                  <div className="w-10 h-10 bg-defence-green/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-defence-green" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {contactData?.registered_office?.title || "Registered Office"}
                  </h3>
                </div>
                <address className="not-italic text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {registeredAddr}
                </address>
              </div>

              <div className="card-defence p-6 h-full">
                <div className="flex items-center gap-3 mb-5 min-h-[40px]">
                  <div className="w-10 h-10 bg-brass-gold/15 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-brass-gold" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {contactData?.corporate_office?.title || "Corporate Office"}
                  </h3>
                </div>
                <address className="not-italic text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {corporateAddr}
                </address>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;