import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

// Resolves both /assets/ (public folder) and /uploads/ (backend) paths
const resolveImageUrl = (path) => {
  if (!path) return "/assets/hero-bg.jpg";
  const value = String(path).trim();
  if (!value) return "/assets/hero-bg.jpg";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/assets/")) return value;
  if (value.startsWith("/uploads/")) return `${API_BASE_URL}${value}`;
  if (value.startsWith("uploads/")) return `${API_BASE_URL}/${value}`;
  return value;
};

const Hero = ({ content = {} }) => {
  // content is already a flat key-value object from Index.jsx buildContentMap
  const hero = content || {};

  const badge        = hero.badge        || "Est. 1990 • ISO 9001:2015 Certified";
  const headline     = hero.title        || hero.headline || "Mission-Critical Defence Electronics & Automation";
  const description  = hero.description  || "Organisation dedicated to product development. Complete solutions for Defence, Industrial Automation, Simulators & Training Systems since 1990.";
  const primaryText  = hero.primary_button_text  || "Explore Capabilities";
  const primaryLink  = hero.primary_button_link  || "/defence-systems";
  const secondaryText = hero.secondary_button_text || "Get a Quote";
  const secondaryLink = hero.secondary_button_link || "/enquiry";
  const bgImage      = resolveImageUrl(hero.background_image);

  return (
    <section className="relative min-h-screen flex items-center pt-20">
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Defence manufacturing facility"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to default if image fails to load
            if (e.currentTarget.src !== window.location.origin + "/assets/hero-bg.jpg") {
              e.currentTarget.src = "/assets/hero-bg.jpg";
            }
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(26, 54, 41, 0.95) 0%, rgba(26, 54, 41, 0.85) 50%, rgba(26, 54, 41, 0.75) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-brass-gold/20 border border-brass-gold/40 px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-brass-gold rounded-full" />
            <span className="text-brass-gold text-sm font-semibold tracking-wide uppercase">
              {badge}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {headline}
          </h1>

          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl leading-relaxed">
            {description}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to={primaryLink}
              className="btn-accent inline-flex items-center gap-2 group"
            >
              {primaryText}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to={secondaryLink}
              className="btn-outline text-white border-white/40 hover:border-brass-gold inline-flex items-center gap-2"
            >
              {secondaryText}
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-brass-gold rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;