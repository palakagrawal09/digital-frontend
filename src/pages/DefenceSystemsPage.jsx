import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Search, Eye, Crosshair, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const EXCLUDED_CATEGORY_ID = "a9946fcb-a184-4597-91c8-cff5f2ac084e";
const API_BASE_URL = "http://127.0.0.1:8000";

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

const Reveal = ({ children, delay = 0 }) => {
  return (
    <div
      className="animate-[fadeUp_0.7s_ease_forwards]"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      {children}
    </div>
  );
};

const DefenceSystemsPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/product-categories")
      .then((res) => res.json())
      .then((data) => {
        const filteredCategories = data.filter(
          (c) => c.id !== EXCLUDED_CATEGORY_ID
        );
        setCategories(filteredCategories);
      })
      .catch((err) => console.error("Category fetch error:", err));

    fetch("http://127.0.0.1:8000/api/products")
      .then((res) => res.json())
      .then((data) => {
        const filteredProducts = data.filter(
          (p) => p.category_id !== EXCLUDED_CATEGORY_ID
        );
        setProducts(filteredProducts);
      })
      .catch((err) => console.error("Product fetch error:", err));
  }, []);

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.replace("#", "");
    const target = document.getElementById(id);

    if (target) {
      setTimeout(() => {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    }
  }, [location, categories]);

  const navCategories = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      sectionId: slugify(category.name),
    }));
  }, [categories]);

  return (
    <div className="min-h-screen bg-[#f5f4ef] text-[#18253a]">
      <style>
        {`
          html {
            scroll-behavior: smooth;
          }

          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(28px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      <Header />

      <main>
        <section className="pt-32 pb-20 bg-[#f5f4ef]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          </div>
        </section>

        {categories.map((category, categoryIndex) => {
          const sectionId = slugify(category.name);
          const Icon = iconMap[category.icon] || Shield;

          const categoryProducts = products.filter(
            (p) => p.category_id === category.id
          );

          return (
            <section
              key={category.id}
              id={sectionId}
              className="scroll-mt-28 py-14 bg-[#f5f4ef]"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Reveal delay={categoryIndex * 80}>
                  <div className="border-b border-[#d8d6cf] pb-8 mb-10">
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
                  <div className="space-y-14">
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
                      const secondImage = formatImagePath(images[1] || images[0]);

                      const specs = item.specifications
                        ? item.specifications
                            .split("\n")
                            .map((line) => line.trim())
                            .filter(Boolean)
                        : [];

                      const sectionReverse = index % 2 !== 0;

                      return (
                        <Reveal key={item.id} delay={80}>
                          <div>
                            <div
                              className={`grid lg:grid-cols-2 gap-10 items-start ${
                                sectionReverse ? "lg:[&>*:first-child]:order-2" : ""
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
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="overflow-hidden border border-[#d8d6cf] bg-white">
                                      <img
                                        src={firstImage}
                                        alt={item.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          e.currentTarget.src = "/assets/placeholder.jpg";
                                        }}
                                      />
                                    </div>

                                    <div className="overflow-hidden border border-[#d8d6cf] bg-white">
                                      <img
                                        src={secondImage}
                                        alt={`${item.name} view`}
                                        className="w-full h-[220px] object-cover hover:scale-[1.03] transition duration-500"
                                        onError={(e) => {
                                          e.currentTarget.src = "/assets/placeholder.jpg";
                                        }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="overflow-hidden border border-[#d8d6cf] bg-white max-w-xl">
                                    <img
                                      src={firstImage}
                                      alt={item.name}
                                      className="w-full h-[280px] object-cover hover:scale-[1.03] transition duration-500"
                                      onError={(e) => {
                                        e.currentTarget.src = "/assets/placeholder.jpg";
                                      }}
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="pt-2">
                                {specs.length > 0 && (
                                  <>
                                    <h4 className="text-[24px] font-semibold text-[#13233c] mb-4">
                                      Main Functions
                                    </h4>

                                    <ul className="space-y-3 mb-6">
                                      {specs.map((spec, i) => (
                                        <li
                                          key={i}
                                          className="flex items-start gap-3 text-[16px] leading-7 text-[#5b6775]"
                                        >
                                          <span className="w-1.5 h-1.5 bg-[#b38b2a] mt-3 flex-shrink-0" />
                                         <span>{spec.replace(/^[•●▪◦\-]\s*/, "")}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </>
                                )}

                                {(item.short_description || item.additional_info) && (
                                  <div className="bg-white border border-[#e0ddd6] p-5">
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
                              <div className="border-b border-[#d8d6cf] mt-12" />
                            )}
                          </div>
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
              <div className="bg-[#1d3654] px-8 py-12 text-center">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Need a Defence-Grade Solution?
                </h3>
                <p className="text-white/80 max-w-2xl mx-auto leading-8 mb-6">
                  Reach out for technical consultation, customized system support,
                  and product guidance for mission-ready deployments.
                </p>
                <Link
                  to="/enquiry"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#c59b37] text-[#13233c] font-semibold hover:opacity-90 transition"
                >
                  Request Technical Consultation
                </Link>
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