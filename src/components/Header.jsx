import { useState, useRef, useEffect } from 'react';
import { href, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null);
  const location = useLocation();
  const dropdownTimeout = useRef(null);

  const navLinks = [
    { href: '/', label: 'Home' },
    {
      label: 'About DIPL',
      children: [
        { href: '/about', label: 'Company Overview' },
        { href: '/about#leadership', label: 'Leadership & Advisory Board' },
        { href: '/about#certifications', label: 'Certifications & Compliance' },
        { href: '/clients', label: 'Clients & Strategic Partners' },
      ],
    },

    {
  label: "Defence Systems",
  children: [
    {
      href: "/defence-systems#fire-control-systems",
      label: "Fire Control Systems",
    },
    {
      href: "/defence-systems#inspection-and-safety-systems",
      label: "Inspection & Safety Systems",
    },
    {
      href: "/defence-systems#field-surveillance",
      label: "Counter-Insurgency & Surveillance",
    },
  ],
},
    {
      label: "Simulators & Training",
      href: "/simulators",
    },
    {
      label: "Industrial Automation",
      children: [
        { href: "/industrial-automation#oil-gas", label: "Oil & Gas" },
        { href: "/industrial-automation#mining", label: "Mining" },
        { href: "/industrial-automation#railways", label: "Railways" },
        { href: "/industrial-automation#pharma", label: "Pharma & Process" },
      ],
    },
    {
      label: "Services",
      href: "/services",
    },
   ,
    { href: "/news", label: "News & Media" },
    { href: "/contact", label: "Contact" },
    {href:"/En"}
  ];

  const isActive = (path) => path && location.pathname === path;

  useEffect(() => {
    setIsMenuOpen(false);
    setOpenMobileDropdown(null);
  }, [location]);

  const handleMouseEnter = (label) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-defence-green backdrop-blur-sm border-b border-white/10">
      <div className="h-1 bg-brass-gold" />

      <div className="container-width section-padding !py-0">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* ✅ LOGO (FIXED) */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <img
              src="/assets/dipl-logo.jpg"
              alt="DIPL - Digital Integrator Pvt. Ltd."
              className="h-10 sm:h-12 w-auto group-hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* ✅ DESKTOP NAV */}
          {/* ✅ DESKTOP NAV */}
<div className="hidden lg:flex items-center gap-3">

  <nav className="flex items-center gap-1">
    {navLinks.map((link) =>
      link.children ? (
        <div
          key={link.label}
          className="relative"
          onMouseEnter={() => handleMouseEnter(link.label)}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className={`flex items-center gap-1 px-3 py-2 font-medium text-xs uppercase tracking-wide transition-colors ${
              openDropdown === link.label
                ? "text-brass-gold"
                : "text-white/80 hover:text-brass-gold"
            }`}
          >
            {link.label}
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                openDropdown === link.label ? "rotate-180" : ""
              }`}
            />
          </button>

          {openDropdown === link.label && (
            <div className="absolute top-full left-0 mt-0 min-w-[240px] bg-white border border-gunmetal/15 shadow-lg z-50">
              <div className="py-1">
                {link.children.map((child) => (
                  <Link
                    key={child.href}
                    to={child.href}
                    className="block px-4 py-2.5 text-sm text-foreground hover:bg-defence-green/10 hover:text-defence-green transition-colors"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link
          key={link.href}
          to={link.href}
          className={`px-3 py-2 font-medium text-xs uppercase tracking-wide transition-colors ${
            isActive(link.href)
              ? "text-brass-gold"
              : "text-white/80 hover:text-brass-gold"
          }`}
        >
          {link.label}
        </Link>
      )
    )}
  </nav>

  {/* 🔥 GET QUOTE BUTTON */}
  <Link
    to="/enquiry"
    className="ml-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide bg-brass-gold text-black rounded-md hover:bg-yellow-400 transition-all duration-300 shadow-md"
  >
    Get Quote
  </Link>

</div>

          {/* ✅ MOBILE BUTTON */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* ✅ MOBILE MENU */}
      {isMenuOpen && (
        <div className="lg:hidden bg-defence-green border-t border-white/10">
          <nav className="p-4 flex flex-col gap-2">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <button
                    className="w-full flex justify-between text-white"
                    onClick={() =>
                      setOpenMobileDropdown(
                        openMobileDropdown === link.label ? null : link.label
                      )
                    }
                  >
                    {link.label}
                    <ChevronDown />
                  </button>

                  {openMobileDropdown === link.label &&
                    link.children.map((child) => (
                      <Link key={child.href} to={child.href} className="block pl-4 py-1 text-white/70">
                        {child.label}
                      </Link>
                    ))}
                </div>
              ) : (
                <Link key={link.href} to={link.href} className="text-white">
                  {link.label}
                </Link>
              )
            )}
             <Link
              to="/enquiry"
              className="btn-accent text-center mt-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Quote
            </Link>
            
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;