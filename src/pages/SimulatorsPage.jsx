import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollReveal from "../components/ScrollReveal";
import { Target, Shield } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const resolveImageUrl = (path) => {
  if (!path) return "";
  const value = String(path).trim();
  if (!value) return "";
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) return value;
  if (value.startsWith("/assets/")) return value;
  if (value.startsWith("assets/")) return `/${value}`;
  if (value.startsWith("/uploads/")) return `${API_BASE_URL}${value}`;
  if (value.startsWith("uploads/")) return `${API_BASE_URL}/${value}`;
  if (value.startsWith("/static/")) return `${API_BASE_URL}${value}`;
  if (value.startsWith("static/")) return `${API_BASE_URL}/${value}`;
  if (!value.includes("/")) return `/${value}`;
  return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
};

const getSimulatorImages = (sim) => {
  if (Array.isArray(sim?.images) && sim.images.length > 0) return sim.images;
  const fallbackImage = sim?.image_url || sim?.image || "";
  return fallbackImage ? [fallbackImage] : [];
};

const SimulatorsPage = () => {
  const [simulators, setSimulators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimulators = async () => {
      try {
        // Step 1: Fetch all product categories and find the "Simulators" one dynamically
        const catRes = await fetch(`${API_BASE_URL}/api/product-categories`);
        const categories = await catRes.json();
        const simulatorCategory = categories.find(
          (c) => c.name?.toLowerCase().includes("simulator")
        );

        if (!simulatorCategory) {
          setSimulators([]);
          setLoading(false);
          return;
        }

        // Step 2: Fetch products filtered by that category
        const prodRes = await fetch(
          `${API_BASE_URL}/api/products?category_id=${simulatorCategory.id}&published=true`
        );
        const products = await prodRes.json();
        setSimulators(Array.isArray(products) ? products : []);
      } catch (err) {
        console.error("Failed to load simulators:", err);
        setSimulators([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimulators();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* HERO */}
        <section className="pt-28 pb-14 bg-gradient-to-b from-sand-dark/50 via-sand-dark/30 to-background relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brass-gold/10 blur-3xl rounded-full" />
          </div>

          <div className="container-width px-4 text-center max-w-2xl mx-auto relative z-10">
            <ScrollReveal>
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="w-10 h-px bg-brass-gold" />
                <span className="text-brass-gold uppercase tracking-[0.25em] text-xs font-semibold">
                  Simulators & Training
                </span>
                <span className="w-10 h-px bg-brass-gold" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 leading-tight text-foreground">
                Combat Training Systems
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
                Realistic and cost-effective simulation platforms for modern
                combat readiness.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="section-padding bg-background">
          <div className="container-width space-y-16">
            {loading ? (
              <p className="text-center text-muted-foreground py-12">Loading simulators...</p>
            ) : simulators.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No simulators found.</p>
            ) : (
              simulators.map((sim, index) => {
                const images = getSimulatorImages(sim)
                  .map((img) => resolveImageUrl(img))
                  .filter(Boolean)
                  .slice(0, 2);

                return (
                  <ScrollReveal key={sim.id}>
                    <div
                      className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                        index % 2 !== 0
                          ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"
                          : ""
                      }`}
                    >
                      {/* TEXT */}
                      <div className="space-y-4 max-w-lg">
                        <div className="inline-flex items-center gap-2 bg-defence-green/10 px-3 py-1.5 border border-defence-green/20 rounded-sm w-fit shadow-sm">
                          <Target className="w-3.5 h-3.5 text-defence-green" />
                          <span className="text-xs text-defence-green font-medium tracking-wide">
                            Simulator
                          </span>
                        </div>

                        <h2 className="text-3xl font-semibold leading-snug text-foreground">
                          {sim.name}
                        </h2>

                        <p className="text-base text-muted-foreground leading-7">
                          {sim.description}
                        </p>

                        {sim.specifications && (
                          <ul className="space-y-2 text-sm text-muted-foreground pt-2">
                            {sim.specifications
                              .split("\n")
                              .map((item) => item.trim())
                              .filter(Boolean)
                              .map((item, i) => (
                                <li
                                  key={i}
                                  className="flex gap-2 items-start transition-transform duration-300 hover:translate-x-1"
                                >
                                  <Shield className="w-3.5 h-3.5 text-defence-green mt-1 flex-shrink-0" />
                                  <span>{item.replace(/^[•●▪◦\-]\s*/, "")}</span>
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>

                      {/* IMAGES */}
                      <div className="flex justify-center">
                        {images.length > 0 ? (
                          <div
                            className={`grid ${
                              images.length > 1 ? "grid-cols-2" : "grid-cols-1"
                            } gap-3 w-full max-w-md`}
                          >
                            {images.map((img, i) => (
                              <div
                                key={i}
                                className="relative h-[220px] w-full rounded-lg border border-gunmetal/10 bg-white shadow-md flex items-center justify-center overflow-hidden"
                              >
                                <img
                                  src={img}
                                  alt={`${sim.name} ${i + 1}`}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="w-full max-w-md h-[220px] rounded-lg border border-gunmetal/10 bg-sand-dark/20 flex items-center justify-center">
                            <Target className="w-16 h-16 text-defence-green/30" />
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })
            )}
          </div>
        </section>

        {/* WHY SECTION */}
        <section className="section-padding bg-gradient-to-b from-sand-dark/20 via-sand-dark/30 to-sand-dark/40">
          <div className="container-width max-w-2xl mx-auto text-center">
            <ScrollReveal>
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-brass-gold" />
                <span className="text-brass-gold uppercase tracking-[0.22em] text-xs font-semibold">
                  Advantages
                </span>
                <span className="w-8 h-px bg-brass-gold" />
              </div>

              <h2 className="text-2xl font-semibold mb-6 text-foreground">
                Why Simulation Training?
              </h2>

              <ul className="space-y-3 text-sm text-left text-muted-foreground bg-white/40 backdrop-blur-sm border border-gunmetal/10 rounded-xl p-6 shadow-sm">
                {[
                  "100% indigenously developed system",
                  "Cost-effective alternative to live-fire training",
                  "Weather-independent indoor operation",
                  "Comprehensive performance tracking and scoring",
                  "Realistic weapon dynamics and recoil simulation",
                  "Customizable scenarios for mission-specific preparation",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-3 items-start transition-all duration-300 hover:translate-x-1 hover:text-foreground"
                  >
                    <Shield className="w-4 h-4 text-defence-green mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SimulatorsPage;