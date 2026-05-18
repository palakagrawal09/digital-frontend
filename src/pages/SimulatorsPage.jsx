import { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Target, Shield, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const formatImagePath = (img) => {
  if (!img || String(img).trim() === "") return "/assets/placeholder.jpg";
  const value = String(img).trim();
  if (value.startsWith("http") || value.startsWith("data:") || value.startsWith("blob:")) return value;
  if (value.startsWith("/assets/")) return value;
  if (value.startsWith("assets/")) return `/${value}`;
  if (value.startsWith("/uploads/")) return `${API_BASE_URL}${value}`;
  if (value.startsWith("uploads/")) return `${API_BASE_URL}/${value}`;
  if (!value.includes("/")) return `${API_BASE_URL}/uploads/${value}`;
  return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
};

const parseSpecs = (specs) => {
  if (!specs) return [];
  return specs
    .split(/\n|(?=[•●▪◦])|(?<=\w)\s*•/)
    .map((s) => s.trim().replace(/^[•●▪◦\-]\s*/, ""))
    .filter(Boolean);
};

const getImages = (sim) => {
  if (Array.isArray(sim?.images) && sim.images.filter(Boolean).length > 0)
    return sim.images.filter(Boolean);
  if (sim?.image_url) return [sim.image_url];
  if (sim?.image) return [sim.image];
  return [];
};

const Reveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const SimulatorsPage = () => {
  const [simulators, setSimulators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSimulators = async () => {
      try {
        const catRes = await fetch(`${API_BASE_URL}/api/product-categories`);
        const categories = await catRes.json();
        const simCat = categories.find((c) => c.name?.toLowerCase().includes("simulator"));
        if (!simCat) { setSimulators([]); setLoading(false); return; }
        const prodRes = await fetch(`${API_BASE_URL}/api/products?category_id=${simCat.id}&published=true`);
        const products = await prodRes.json();
        setSimulators(Array.isArray(products) ? products : []);
      } catch (err) {
        console.error("Failed to load simulators:", err);
        setError("Unable to load simulators right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchSimulators();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f4ef] text-[#18253a]">
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes softFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .soft-float { animation: softFloat 5s ease-in-out infinite; }
      `}</style>
      <Header />
      <main>

        {/* HERO */}
        <section className="relative overflow-hidden pt-32 pb-20 bg-[#f5f4ef]">
          <div className="absolute left-[-120px] top-16 h-72 w-72 rounded-full bg-[#c59b37]/10 blur-3xl" />
          <div className="absolute right-[-90px] bottom-8 h-80 w-80 rounded-full bg-[#2e4a39]/10 blur-3xl" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-4 sm:gap-5 mb-6">
                  <span className="w-12 sm:w-16 h-px bg-[#c59b37]" />
                  <span className="text-[#c59b37] font-semibold text-sm sm:text-base uppercase tracking-[0.35em]">
                    Simulators & Training
                  </span>
                  <span className="w-12 sm:w-16 h-px bg-[#c59b37]" />
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#13233c] mb-6">
                  Combat Training Systems
                </h1>
                <p className="text-xl sm:text-2xl leading-9 text-[#5e6978] max-w-3xl mx-auto">
                  Realistic and cost-effective simulation platforms for modern combat readiness.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* LOADING */}
        {loading && (
          <section className="py-20 bg-[#f5f4ef]">
            <div className="flex items-center justify-center gap-3 text-[#2e4a39]">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg font-semibold">Loading simulators...</span>
            </div>
          </section>
        )}

        {/* ERROR */}
        {!loading && error && (
          <section className="py-20">
            <p className="text-center text-red-600 text-lg">{error}</p>
          </section>
        )}

        {/* SIMULATORS */}
        {!loading && !error && simulators.length > 0 && (
          <section className="py-16 bg-[#f5f4ef]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

              {/* Section header — same as Defence page */}
              <Reveal>
                <div className="border-b border-[#d8d6cf] pb-8 mb-12">
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#e9ece8] border border-[#d3d8d1] mb-4">
                    <Target className="w-4 h-4 text-[#2e4a39]" />
                    <span className="text-sm font-semibold text-[#2e4a39]">Simulators & Training</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#13233c] mb-3">
                    Combat Training Simulators
                  </h2>
                  <div className="h-px max-w-[180px] bg-[#c59b37] mb-5" />
                  <p className="text-[16px] leading-8 text-[#5e6978] max-w-4xl">
                    100% indigenously developed training simulators for modern defence readiness.
                  </p>
                </div>
              </Reveal>

              <div className="space-y-20">
                {simulators.map((item, index) => {
                  const images = getImages(item);
                  const firstImage = formatImagePath(images[0]);
                  const secondImage = formatImagePath(images[1] || images[0]);
                  const specs = parseSpecs(item.specifications);
                  const isReverse = index % 2 !== 0;

                  return (
                    <Reveal key={item.id} delay={100}>
                      <article>
                        {/* EXACT same layout as DefenceSystemsPage */}
                        <div className={`grid lg:grid-cols-2 gap-10 xl:gap-16 items-start ${isReverse ? "lg:[&>*:first-child]:order-2" : ""}`}>

                          {/* LEFT: title + description + images */}
                          <div>
                            <h3 className="text-2xl sm:text-[38px] font-bold text-[#13233c] mb-4 leading-tight">
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="text-[16px] leading-8 text-[#5e6978] max-w-3xl mb-8">
                                {item.description}
                              </p>
                            )}

                            {/* Images — same as defence page */}
                            {images.length > 1 ? (
                              <div className="grid sm:grid-cols-2 gap-4">
                                {[firstImage, secondImage].map((src, i) => (
                                  <div key={i} className="group overflow-hidden border border-[#d8d6cf] bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                    <img src={src} alt={`${item.name} ${i + 1}`}
                                      className="mx-auto h-auto max-h-[320px] w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/placeholder.jpg"; }} />
                                  </div>
                                ))}
                              </div>
                            ) : images.length === 1 ? (
                              <div className="group overflow-hidden border border-[#d8d6cf] bg-white p-4 max-w-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                <img src={firstImage} alt={item.name}
                                  className="mx-auto h-auto max-h-[380px] w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/placeholder.jpg"; }} />
                              </div>
                            ) : null}
                          </div>

                          {/* RIGHT: specs — same as defence page */}
                          <div className="pt-2">
                            {specs.length > 0 && (
                              <div className="border-l-4 border-[#c59b37] bg-white/60 p-6 shadow-sm">
                                <h4 className="text-[24px] font-semibold text-[#13233c] mb-5">Main Functions</h4>
                                <ul className="space-y-3">
                                  {specs.map((spec, i) => (
                                    <li key={i} className="group flex items-start gap-3 text-[16px] leading-7 text-[#5b6775]">
                                      <span className="w-1.5 h-1.5 bg-[#b38b2a] mt-3 flex-shrink-0 transition-transform group-hover:scale-150" />
                                      <span>{spec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                        {index !== simulators.length - 1 && (
                          <div className="border-b border-[#d8d6cf] mt-16" />
                        )}
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* WHY SIMULATION */}
        <section className="py-16 bg-[#efede6] border-t border-[#d8d6cf]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-3 mb-4">
                  <span className="w-10 h-px bg-[#c59b37]" />
                  <span className="text-[#c59b37] font-semibold text-sm uppercase tracking-[0.3em]">Advantages</span>
                  <span className="w-10 h-px bg-[#c59b37]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#13233c]">Why Simulation Training?</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-12">
                {[
                  "100% indigenously developed system",
                  "Cost-effective alternative to live-fire training",
                  "Weather-independent indoor operation",
                  "Comprehensive performance tracking and scoring",
                  "Realistic weapon dynamics and recoil simulation",
                  "Customizable scenarios for mission-specific preparation",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/60 border border-[#d8d6cf] p-4">
                    <Shield className="w-4 h-4 text-[#2e4a39] mt-1 flex-shrink-0" />
                    <span className="text-sm text-[#5b6775]">{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* CTA — same as defence page */}
            <Reveal>
              <div className="relative overflow-hidden bg-[#1d3654] px-8 py-12 text-center shadow-xl">
                <div className="absolute left-[-70px] top-[-70px] h-40 w-40 rounded-full bg-[#c59b37]/20 blur-2xl soft-float" />
                <div className="absolute right-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-white/10 blur-2xl soft-float" />
                <div className="relative">
                  <h3 className="text-3xl font-bold text-white mb-4">Need a Defence-Grade Solution?</h3>
                  <p className="text-white/80 max-w-2xl mx-auto leading-8 mb-6">
                    Reach out for technical consultation, customized system support, and product guidance for mission-ready deployments.
                  </p>
                  <Link to="/enquiry" className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#c59b37] text-[#13233c] font-semibold hover:opacity-90 transition">
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

export default SimulatorsPage;