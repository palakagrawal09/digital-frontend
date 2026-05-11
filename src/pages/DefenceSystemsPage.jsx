import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Shield,
  Search,
  Eye,
  Crosshair,
  AlertTriangle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

const EXCLUDED_CATEGORY_ID = "4c4e41a0-1822-45b8-b148-c9f92e3005fd";
const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || "https://digital-backend-dsn7.onrender.com";

const iconMap = {
  Shield,
  Search,
  Eye,
  Crosshair,
  AlertTriangle,
};

const formatImagePath = (img) => {
  if (!img) return "/assets/placeholder.jpg";

  const value = String(img).trim();

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (value.startsWith("/assets/")) return value;
  if (value.startsWith("assets/")) return `/${value}`;

  if (value.startsWith("/uploads/")) return `${API_BASE_URL}${value}`;
  if (value.startsWith("uploads/")) return `${API_BASE_URL}/${value}`;

  if (value.startsWith("/static/")) return `${API_BASE_URL}${value}`;
  if (value.startsWith("static/")) return `${API_BASE_URL}/${value}`;

  if (!value.includes("/")) return `${API_BASE_URL}/uploads/${value}`;

  return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
};

const slugify = (text = "") =>
  text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const Reveal = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -80px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const DefenceSystemsPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeSection, setActiveSection] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const location = useLocation();

  useEffect(() => {
    const loadDefenceData = async () => {
      try {
        setLoading(true);
        setError("");

        const [categoryRes, productRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/product-categories`),
          fetch(`${API_BASE_URL}/api/products`),
        ]);

        if (!categoryRes.ok || !productRes.ok) {
          throw new Error("Failed to load defence systems data");
        }

        const categoryData = await categoryRes.json();
        const productData = await productRes.json();

        const filteredCategories = (Array.isArray(categoryData)
          ? categoryData
          : []
        ).filter((category) => category.id !== EXCLUDED_CATEGORY_ID);

        const filteredProducts = (Array.isArray(productData)
          ? productData
          : []
        ).filter((product) => product.category_id !== EXCLUDED_CATEGORY_ID);

        setCategories(filteredCategories);
        setProducts(filteredProducts);

        if (filteredCategories.length > 0) {
          setActiveSection(slugify(filteredCategories[0].name));
        }
      } catch (err) {
        console.error("Defence page load error:", err);
        setError("Unable to load defence systems right now.");
      } finally {
        setLoading(false);
      }
    };

    loadDefenceData();
  }, []);

  const navCategories = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      sectionId: slugify(category.name),
    }));
  }, [categories]);

  useEffect(() => {
    if (!location.hash || categories.length === 0) return;

    const id = location.hash.replace("#", "");
    const target = document.getElementById(id);

    if (target) {
      setTimeout(() => {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 180);
    }
  }, [location, categories]);

  useEffect(() => {
    if (!navCategories.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target?.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5],
      }
    );

    navCategories.forEach((category) => {
      const element = document.getElementById(category.sectionId);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [navCategories]);

  const scrollToCategory = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const getCategoryProducts = (categoryId) => {
    return products.filter((product) => product.category_id === categoryId);
  };

  return (
    <div className="min-h-screen bg-[#f5f4ef] text-[#18253a]">
      <style>
        {`
          html {
            scroll-behavior: smooth;
          }

          @keyframes softFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes lineGrow {
            from {
              width: 0;
              opacity: 0;
            }
            to {
              width: 100%;
              opacity: 1;
            }
          }

          .defence-soft-float {
            animation: softFloat 5s ease-in-out infinite;
          }

          .defence-line-grow {
            animation: lineGrow 0.9s ease forwards;
          }
        `}
      </style>

      <Header />

      <main>
        <section className="relative overflow-hidden pt-32 pb-20 bg-[#f5f4ef]">
          <div className="absolute left-[-120px] top-16 h-72 w-72 rounded-full bg-[#c59b37]/10 blur-3xl" />
          <div className="absolute right-[-90px] bottom-8 h-80 w-80 rounded-full bg-[#2e4a39]/10 blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-4 sm:gap-5 mb-6">
                  <span className="w-12 sm:w-16 h-px bg-[#c59b37]" />
                  <span className="text-[#c59b37] font-semibold text-sm sm:text-base uppercase tracking-[0.35em]">
                    Defence Systems
                  </span>
                  <span className="w-12 sm:w-16 h-px bg-[#c59b37]" />
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#13233c] mb-6">
                  Mission-Critical Defence Systems
                </h1>

                <p className="text-xl sm:text-2xl leading-9 text-[#5e6978] max-w-3xl mx-auto">
                  Advanced and reliable defence platforms built for precision,
                  surveillance, safety, and field-ready performance.
                </p>
              </div>
            </Reveal>

            {!loading && navCategories.length > 0 && (
              <Reveal delay={120}>
                <div className="mt-12 flex flex-wrap justify-center gap-3">
                  {navCategories.map((category) => {
                    const Icon = iconMap[category.icon] || Shield;
                    const isActive = activeSection === category.sectionId;

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => scrollToCategory(category.sectionId)}
                        className={`group inline-flex items-center gap-2 border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                          isActive
                            ? "bg-[#2e4a39] text-white border-[#2e4a39] shadow-lg"
                            : "bg-white/70 text-[#2e4a39] border-[#d8d6cf] hover:bg-[#2e4a39] hover:text-white"
                        }`}
                      >
                        <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              </Reveal>
            )}
          </div>
        </section>

        {loading && (
          <section className="py-20 bg-[#f5f4ef]">
            <div className="flex items-center justify-center gap-3 text-[#2e4a39]">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg font-semibold">
                Loading defence systems...
              </span>
            </div>
          </section>
        )}

        {!loading && error && (
          <section className="py-20 bg-[#f5f4ef]">
            <div className="max-w-3xl mx-auto px-4 text-center">
              <p className="text-lg text-red-600">{error}</p>
            </div>
          </section>
        )}

        {!loading &&
          !error &&
          categories.map((category, categoryIndex) => {
            const sectionId = slugify(category.name);
            const Icon = iconMap[category.icon] || Shield;
            const categoryProducts = getCategoryProducts(category.id);

            return (
              <section
                key={category.id}
                id={sectionId}
                className="scroll-mt-28 py-16 bg-[#f5f4ef]"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <Reveal delay={categoryIndex * 80}>
                    <div className="border-b border-[#d8d6cf] pb-8 mb-12">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#e9ece8] border border-[#d3d8d1]">
                          <Icon className="w-4 h-4 text-[#2e4a39]" />
                          <span className="text-sm font-semibold text-[#2e4a39]">
                            {category.name}
                          </span>
                        </div>
                      </div>

                      <h2 className="text-3xl sm:text-4xl font-bold text-[#13233c] mb-3">
                        {category.name}
                      </h2>

                      <div className="h-px max-w-[180px] bg-[#c59b37] defence-line-grow mb-5" />

                      {category.description && (
                        <p className="text-[16px] leading-8 text-[#5e6978] max-w-4xl">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </Reveal>

                  {categoryProducts.length === 0 ? (
                    <Reveal>
                      <p className="text-[#677383]">
                        No products available in this category.
                      </p>
                    </Reveal>
                  ) : (
                    <div className="space-y-20">
                      {categoryProducts.map((item, index) => {
                        const images =
                          Array.isArray(item.images) && item.images.length > 0
                            ? item.images
                            : item.image_url
                            ? [item.image_url]
                            : item.image
                            ? [item.image]
                            : [];

                        const firstImage = formatImagePath(images[0]);
                        const secondImage = formatImagePath(
                          images[1] || images[0]
                        );

                        const specs = item.specifications
                          ? item.specifications
                              .split("\n")
                              .map((line) => line.trim())
                              .filter(Boolean)
                          : [];

                        const sectionReverse = index % 2 !== 0;

                        return (
                          <Reveal key={item.id} delay={100}>
                            <article>
                              <div
                                className={`grid lg:grid-cols-2 gap-10 xl:gap-16 items-start ${
                                  sectionReverse
                                    ? "lg:[&>*:first-child]:order-2"
                                    : ""
                                }`}
                              >
                                <div>
                                  <h3 className="text-2xl sm:text-[38px] font-bold text-[#13233c] mb-4 leading-tight">
                                    {item.name}
                                  </h3>

                                  {item.description && (
                                    <p className="text-[16px] leading-8 text-[#5e6978] max-w-3xl mb-8">
                                      {item.description}
                                    </p>
                                  )}

                                  {images.length > 1 ? (
                                    <div className="grid sm:grid-cols-2 gap-4">
                                      <div className="group overflow-hidden border border-[#d8d6cf] bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                        <img
                                          src={firstImage}
                                          alt={item.name}
                                          className="mx-auto h-auto max-h-[320px] w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                                          onError={(e) => {
                                            e.currentTarget.src =
                                              "/assets/placeholder.jpg";
                                          }}
                                        />
                                      </div>

                                      <div className="group overflow-hidden border border-[#d8d6cf] bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                        <img
                                          src={secondImage}
                                          alt={`${item.name} view`}
                                          className="mx-auto h-auto max-h-[320px] w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                                          onError={(e) => {
                                            e.currentTarget.src =
                                              "/assets/placeholder.jpg";
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="group overflow-hidden border border-[#d8d6cf] bg-white p-4 max-w-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                      <img
                                        src={firstImage}
                                        alt={item.name}
                                        className="mx-auto h-auto max-h-[380px] w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                                        onError={(e) => {
                                          e.currentTarget.src =
                                            "/assets/placeholder.jpg";
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>

                                <div className="pt-2">
                                  {specs.length > 0 && (
                                    <div className="rounded-none border-l-4 border-[#c59b37] bg-white/60 p-6 shadow-sm">
                                      <h4 className="text-[24px] font-semibold text-[#13233c] mb-5">
                                        Main Functions
                                      </h4>

                                      <ul className="space-y-3 mb-2">
                                        {specs.map((spec, i) => (
                                          <li
                                            key={i}
                                            className="group flex items-start gap-3 text-[16px] leading-7 text-[#5b6775]"
                                          >
                                            <span className="w-1.5 h-1.5 bg-[#b38b2a] mt-3 flex-shrink-0 transition-transform group-hover:scale-150" />
                                            <span>
                                              {spec.replace(/^[•●▪◦\-]\s*/, "")}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {(item.short_description ||
                                    item.additional_info) && (
                                    <div className="mt-6 bg-white border border-[#e0ddd6] p-5 shadow-sm transition-all duration-300 hover:shadow-lg">
                                      {item.short_description && (
                                        <div className="mb-4">
                                          <h5 className="font-semibold text-[#13233c] mb-2 text-[18px]">
                                            Overview
                                          </h5>
                                          <p className="text-[15px] leading-7 text-[#5b6775]">
                                            {item.short_description}
                                          </p>
                                        </div>
                                      )}

                                      {item.additional_info && (
                                        <div>
                                          <h5 className="font-semibold text-[#13233c] mb-2 text-[18px]">
                                            Additional Information
                                          </h5>
                                          <p className="text-[15px] leading-7 text-[#5b6775]">
                                            {item.additional_info}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {index !== categoryProducts.length - 1 && (
                                <div className="border-b border-[#d8d6cf] mt-16" />
                              )}
                            </article>
                          </Reveal>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            );
          })}

        <section className="py-16 bg-[#efede6] border-t border-[#d8d6cf]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="relative overflow-hidden bg-[#1d3654] px-8 py-12 text-center shadow-xl">
                <div className="absolute left-[-70px] top-[-70px] h-40 w-40 rounded-full bg-[#c59b37]/20 blur-2xl defence-soft-float" />
                <div className="absolute right-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-white/10 blur-2xl defence-soft-float" />

                <div className="relative">
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Need a Defence-Grade Solution?
                  </h3>

                  <p className="text-white/80 max-w-2xl mx-auto leading-8 mb-6">
                    Reach out for technical consultation, customized system
                    support, and product guidance for mission-ready deployments.
                  </p>

                  <Link
                    to="/enquiry"
                    className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#c59b37] text-[#13233c] font-semibold hover:opacity-90 transition"
                  >
                    Request Technical Consultation
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DefenceSystemsPage;