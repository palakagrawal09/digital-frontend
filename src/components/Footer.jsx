import { Phone, Mail, MapPin, Linkedin, Shield, Award, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";


const Footer = () => {
  const currentYear = new Date().getFullYear();

  const companyLinks = [
    { href: "/about", label: "Company Overview" },
    { href: "/about#leadership", label: "Leadership" },
    { href: "/about#certifications", label: "Certifications" },
    { href: "/clients", label: "Clients & Partners" },
  ];

  const productLinks = [
    { href: "/defence-systems", label: "Defence Systems" },
    { href: "/simulators", label: "Simulators & Training" },
    { href: "/industrial-automation", label: "Industrial Automation" },
    { href: "/services", label: "Services & Support" },
    { href: "/gem-products", label: "Products on GeM" },
  ];

  const certifications = [
    { icon: Shield, label: "ISO 9001:2015" },
    { icon: Award, label: "Defence Grade" },
    { icon: FileCheck, label: "GeM Registered" },
  ];

  return (
    
    <footer style={{ backgroundColor: "hsl(var(--defence-green))", color: "white" }}>
      <div className="h-1 bg-brass-gold" />

      <div className="container-width section-padding !py-16">
        {/* Certifications Strip */}
        <div className="flex flex-wrap justify-center gap-8 mb-12 pb-12 border-b border-white/10">
          {certifications.map((cert) => (
            <div key={cert.label} className="flex items-center gap-2 text-white/70">
              <cert.icon className="w-5 h-5 text-brass-gold" />
              <span className="text-sm font-medium">{cert.label}</span>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="mb-6 inline-block">
              <img src={"/assets/dipl-logo.jpg"} alt="DIPL" className="h-12 w-auto brightness-0 invert opacity-90" />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Complete solutions for Industrial Automation & Defence Electronics since 1990. 
              Trusted partner of the Indian Armed Forces.
            </p>
            <a
              href="https://www.linkedin.com/company/digital-integrator-pvt-ltd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-brass-gold hover:text-foreground px-4 py-2.5 transition-all text-sm font-medium"
            >
              <Linkedin className="w-4 h-4" />
              <span>Follow on LinkedIn</span>
            </a>
          </div>

          {/* About DIPL */}
          <div>
            <h4 className="font-semibold mb-5 flex items-center gap-3 text-white">
              <span className="w-8 h-0.5 bg-brass-gold" />
              About DIPL
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-white/60 hover:text-brass-gold text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products & Services */}
          <div>
            <h4 className="font-semibold mb-5 flex items-center gap-3 text-white">
              <span className="w-8 h-0.5 bg-brass-gold" />
              Products & Services
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-white/60 hover:text-brass-gold text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-5 flex items-center gap-3 text-white">
              <span className="w-8 h-0.5 bg-brass-gold" />
              Contact
            </h4>
            <address className="not-italic space-y-4 text-sm text-white/60">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-brass-gold flex-shrink-0" />
                <div>
                  <p>46 Electronic Complex</p>
                  <p>Pardeshipura, Indore</p>
                  <p>Madhya Pradesh - 452010</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brass-gold" />
                <a href="tel:07314042133" className="hover:text-brass-gold transition-colors">0731-4042133</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brass-gold" />
                <a href="mailto:sales@diplindia.com" className="hover:text-brass-gold transition-colors">sales@diplindia.com</a>
              </div>
            </address>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col lg:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">© {currentYear} Digital Integrator Pvt. Ltd. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6 text-white/40 text-xs">
            <span>CIN: U31909MP1997PTC012011</span>
            <span className="hidden sm:inline">•</span>
            <span>GST: 23AAACD9928P1Z5</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
