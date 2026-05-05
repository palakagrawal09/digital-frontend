import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Fuel,
  Mountain,
  Train,
  FlaskConical,
  Cpu,
  Gauge,
  Thermometer,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";

// ICON MAPS
const sectorIconMap = { Fuel, Mountain, Train, FlaskConical };
const techIconMap = { Cpu, Gauge, Thermometer, Settings };

// CORE TECH
const coreTech = [
  { icon: "Cpu", name: "Microcontroller-Based Automation" },
  { icon: "Gauge", name: "Data Acquisition Systems" },
  { icon: "Thermometer", name: "Temperature Monitoring & Control" },
  { icon: "Settings", name: "FPGA-Based Control Systems" },
];

// SECTORS
const sectors = [
  {
    id: "oil-gas",
    name: "Oil & Gas",
    icon: "Fuel",
    image: "/assets/oil-gas-automation.jpg",
    description:
      "Automation technology is proving to be a cost-saving investment for oil and gas industry. Automation is used to improve various processes from boiler diagnostics to actual drilling. Automated tech is also compatible with data analysis making the system work error free. Digital Integrator aspires to offer customized solutions for oil and gas industry.",
    capabilities: [
      "Boiler diagnostics automation",
      "Drilling process automation",
      "Data analysis compatible systems",
      "Customized solutions for oil & gas",
    ],
  },
  {
    id: "mining",
    name: "Mining",
    icon: "Mountain",
    description:
      "Automation in mining has a huge scope for increasing efficiency and efficacy; it assists human labour for better working and state of art safe and efficient working for quality end-to-end processes. We offer customized solutions and consultancy based on problem statements from prospects in the mining industry.",
    capabilities: [
      "Teleoperated mining equipment systems",
      "Robotic hardware & software for autonomous units",
      "Vehicle telemetry and positioning systems",
      "Safety automation for mine sites",
    ],
  },
  {
    id: "railways",
    name: "Railways",
    icon: "Train",
    description:
      "Automation and control solutions for Indian Railways — PA systems, GPS Clocks, and train information systems.",
    capabilities: [
      "PA System & GPS Clocks",
      "Train & Platform Information System",
      "Real-time data acquisition",
      "Embedded controllers for rail systems",
    ],
  },
  {
    id: "pharma",
    name: "Pharmaceutical",
    icon: "FlaskConical",
    description:
      "Precision automation for pharmaceutical industries ensuring compliance, safety, and efficiency.",
    capabilities: [
      "Clean room monitoring",
      "Temperature & humidity control",
      "Batch processing automation",
      "Regulatory compliance systems",
    ],
  },
];

const Automation = () => {
  const location = useLocation();

  useEffect(() => {
    const scrollTarget =
      location.state?.scrollTo || location.hash?.replace("#", "");

    if (scrollTarget) {
      setTimeout(() => {
        const el = document.getElementById(scrollTarget);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* HERO */}
        
        <section className="pt-32 pb-20 bg-[#f5f4ef]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-4 sm:gap-5 mb-6">
        <span className="w-12 sm:w-16 h-px bg-[#c59b37]" />
        <span className="text-[#c59b37] font-semibold text-sm sm:text-base uppercase tracking-[0.35em]">
            Industrial Automation
        </span>
        <span className="w-12 sm:w-16 h-px bg-[#c59b37]" />
      </div>

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#13233c] mb-6">
        Automation Across Industries
      </h1>

      <p className="text-xl sm:text-2xl leading-9 text-[#5e6978] max-w-3xl mx-auto">
       Complete automation solutions for Oil & Gas, Mining, Railways,
              and Pharmaceutical industries.
      </p>
    </div>
  </div>
</section>

        {/* CORE TECH */}
        <section className="py-12 border-b">
          <div className="container-width px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {coreTech.map((tech) => {
              const Icon = techIconMap[tech.icon] || Cpu;
              return (
                <div
                  key={tech.name}
                  className="card-defence p-5 text-center transition"
                >
                  <Icon className="mx-auto mb-3 text-brass-gold" />
                  <h3 className="text-sm font-semibold">{tech.name}</h3>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTORS */}
        {sectors.map((sector, index) => {
          const Icon = sectorIconMap[sector.icon] || Fuel;
          const isEven = index % 2 === 0;

          return (
            <section
              key={sector.id}
              id={sector.id}
              className={`py-20 scroll-mt-28 ${isEven ? "bg-sand-dark/30" : ""}`}
            >
              <div className="container-width px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                  {/* LEFT SIDE */}
                  <div className={isEven ? "" : "lg:order-2"}>
                    <div className="inline-flex items-center gap-2 border border-defence-green/20 px-4 py-2 text-sm text-defence-green mb-5 bg-white/40">
                      <Icon className="w-4 h-4" />
                      <span>{sector.name}</span>
                    </div>

                    <h2 className="text-4xl font-bold mb-5">
                      {sector.name} Automation
                    </h2>

                    <p className="text-muted-foreground leading-8 max-w-xl">
                      {sector.description}
                    </p>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className={isEven ? "" : "lg:order-1"}>
                    {sector.image && (
                      <div className="mb-8">
                        <img
                          src={sector.image}
                          alt={sector.name}
                          className="w-full rounded-lg object-cover"
                        />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-3 mb-5">
                        <span className="w-10 h-[1px] bg-brass-gold"></span>
                        <h3 className="text-base font-semibold">
                          Key Capabilities
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {sector.capabilities.map((cap, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-4 bg-white border border-black/5 px-4 py-4"
                          >
                            <div className="w-7 h-7 flex items-center justify-center bg-slate-100 text-defence-green text-sm font-medium">
                              {i + 1}
                            </div>
                            <p className="text-sm text-foreground">{cap}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        {/* CTA */}
        <section className="py-20">
          <div className="container-width px-4">
            <div className="text-center bg-defence-green p-10 rounded-lg">
              <h3 className="text-3xl font-bold text-white mb-4">
                Need a Custom Automation Solution?
              </h3>
              <p className="text-white/80 mb-6">
                Our engineering team designs tailored automation systems.
              </p>
              <Link to="/contact" className="btn-accent">
                Request a Quote
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Automation;