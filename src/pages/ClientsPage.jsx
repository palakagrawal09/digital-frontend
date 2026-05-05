import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Shield,
  Train,
  GraduationCap,
  Factory,
  FlaskConical,
  Cog,
  Award,
  CheckCircle,
  Loader2,
  Users,
  Building2,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

const fallbackIconMap = {
  Shield,
  Train,
  GraduationCap,
  Factory,
  FlaskConical,
  Cog,
  Building2,
  Users,
};

const fallbackClients = [
  { name: "Indian Army", icon: "Shield", category: "Defence", highlight: true },
  { name: "Indian Railways", icon: "Train", category: "Government", highlight: true },
  { name: "Engineering Colleges", icon: "GraduationCap", category: "Education", highlight: false },
  { name: "Polytechnic Colleges", icon: "GraduationCap", category: "Education", highlight: false },
  { name: "Science Colleges", icon: "FlaskConical", category: "Education", highlight: false },
  { name: "Pipe Manufacturing Plants", icon: "Factory", category: "Manufacturing", highlight: false },
  { name: "Automobile Manufacturing Plants", icon: "Cog", category: "Manufacturing", highlight: false },
  { name: "Research Institutes", icon: "Building2", category: "Research", highlight: false },
];

const testimonials = [
  {
    text: "Digital Integrator has consistently delivered reliable and high-performance engineering solutions for mission-critical applications.",
    source: "Defence Sector Client",
  },
  {
    text: "Their technical expertise, product quality, and long-term support make them a dependable industry partner.",
    source: "Industrial Client",
  },
];

const trustItems = [
  "33+ years of proven engineering expertise",
  "Reliable quality and mission-focused delivery",
  "Strong R&D and product innovation capabilities",
  "Trusted by defence, industry, and institutions",
  "Long-term service and support commitment",
];

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/clients`);

        if (!response.ok) {
          throw new Error("Failed to fetch clients");
        }

        const data = await response.json();

        // optional sorting if sort_order exists
        const sortedClients = Array.isArray(data)
          ? [...data].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          : [];

        // optional published filter if your backend uses it
        const publishedClients = sortedClients.filter((client) =>
          client.published === undefined ? true : client.published === true
        );

        setClients(publishedClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* HERO SECTION */}
        <section className="pt-32 pb-16 bg-sand-dark/50">
          <div className="container-width px-4">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="w-12 h-0.5 bg-brass-gold" />
                <span className="text-brass-gold font-semibold text-sm uppercase tracking-widest">
                  Our Clients
                </span>
                <span className="w-12 h-0.5 bg-brass-gold" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground mt-2 mb-6">
                Trusted by Industry Leaders
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed">
                For over three decades, we have built lasting partnerships with
                defence organizations, government bodies, educational institutions,
                and industrial leaders across India.
              </p>
            </div>
          </div>
        </section>

        {/* CLIENT GRID SECTION */}
        <section className="section-padding bg-sand-dark/30">
          <div className="container-width px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground flex items-center justify-center gap-3">
                <span className="w-8 h-0.5 bg-brass-gold" />
                Our Valued Clientele
                <span className="w-8 h-0.5 bg-brass-gold" />
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : clients.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {clients.map((client) => (
                  <div
                    key={client.id || client.name}
                    className="card-defence p-6 group hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="w-14 h-14 bg-defence-green/10 flex items-center justify-center mb-4 rounded-md overflow-hidden group-hover:bg-brass-gold/15 transition-colors duration-300">
                      {client.logo_url ? (
                        <img
                          src={client.logo_url}
                          alt={client.name}
                          className="w-10 h-10 object-contain"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-defence-green group-hover:text-brass-gold transition-colors duration-300" />
                      )}
                    </div>

                    {client.category && (
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {client.category}
                      </span>
                    )}

                    <h3 className="text-lg font-display font-semibold text-foreground mt-1">
                      {client.name}
                    </h3>

                    {client.description && (
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        {client.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {fallbackClients.map((client) => {
                  const Icon = fallbackIconMap[client.icon] || Users;

                  return (
                    <div
                      key={client.name}
                      className={`card-defence p-6 group hover:-translate-y-1 transition-all duration-300 ${
                        client.highlight ? "border-defence-green/30 bg-defence-green/5" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-defence-green/10 flex items-center justify-center rounded-md group-hover:bg-brass-gold/15 transition-colors duration-300">
                          <Icon className="w-6 h-6 text-defence-green group-hover:text-brass-gold transition-colors duration-300" />
                        </div>

                        {client.highlight && (
                          <span className="text-xs bg-defence-green text-white px-2 py-1 rounded-sm">
                            Key Client
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {client.category}
                      </span>

                      <h3 className="text-lg font-display font-semibold text-foreground mt-1">
                        {client.name}
                      </h3>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* TRUST + TESTIMONIALS */}
        <section className="section-padding bg-background">
          <div className="container-width px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-2 mb-6">
                  A Partner You Can Trust
                </h2>

                <ul className="space-y-4">
                  {trustItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-defence-green flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="card-defence p-6">
                    <Award className="w-8 h-8 text-brass-gold mb-4" />
                    <p className="text-foreground italic mb-4 leading-relaxed">
                      "{testimonial.text}"
                    </p>
                    <p className="text-muted-foreground text-sm">
                      — {testimonial.source}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="section-padding">
          <div className="container-width px-4">
            <div className="p-8 sm:p-12 text-center bg-defence-green rounded-none">
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
                Join Our Growing Client Base
              </h3>

              <p className="text-white/80 mb-6 max-w-xl mx-auto leading-relaxed">
                Discover how our engineering solutions can support your organization
                with reliability, innovation, and long-term value.
              </p>

              <Link to="/contact" className="btn-accent inline-flex items-center gap-2">
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ClientsPage;