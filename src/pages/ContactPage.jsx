import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  MapPin,
  Mail,
  Phone,
  Building2,
  FileText,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

const fallbackData = {
  registered_office: {
    title: "Registered Office",
    address_line_1: "46 Electronic Complex",
    address_line_2: "Pardeshipura, Indore",
    address_line_3: "Madhya Pradesh - 452010, India",
  },
  corporate_office: {
    title: "Corporate Office",
    address_line_1: "46 Electronic Complex",
    address_line_2: "Pardeshipura, Indore",
    address_line_3: "Madhya Pradesh - 452010, India",
  },
  email: "info@diplindia.com",
  phone: "+91-731-XXXXXXX",
  statutory_info: {
    cin: "U31909MP1997PTC012011",
    gst_no: "23AAACD9928P1Z5",
    registration_no: "12011",
    roc: "Gwalior",
  },
  map_embed_url:
    "https://www.google.com/maps/place/Digital+Integrator+Pvt.+Ltd./@22.753016,75.8674593,19z/data=!4m6!3m5!1s0x3963029c83522bc1:0x680225ffbb337fee!8m2!3d22.753131!4d75.867226!16s%2Fg%2F1tfhdtvx?entry=ttu&g_ep=EgoyMDI2MDQwNy4wIKXMDSoASAFQAw%3D%3D",
  cta: {
    title: "Need Assistance?",
    description:
      "For product enquiries, support requirements, or repair requests, please use our dedicated submission form.",
    button_text: "Submit Enquiry / Repair Request",
  },
  certifications: ["ISO 9001:2015", "Defence Grade", "GeM Registered"],
};

const ContactPage = () => {
  const [contactData, setContactData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/contact`);

        if (!response.ok) {
          throw new Error("Failed to fetch contact data");
        }

        const data = await response.json();

        setContactData({
          ...fallbackData,
          ...data,
          registered_office: {
            ...fallbackData.registered_office,
            ...(data.registered_office || {}),
          },
          corporate_office: {
            ...fallbackData.corporate_office,
            ...(data.corporate_office || {}),
          },
          statutory_info: {
            ...fallbackData.statutory_info,
            ...(data.statutory_info || {}),
          },
          cta: {
            ...fallbackData.cta,
            ...(data.cta || {}),
          },
          certifications: Array.isArray(data.certifications)
            ? data.certifications
            : fallbackData.certifications,
        });
      } catch (error) {
        console.error("Error fetching contact page data:", error);
        setContactData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, []);

  const contactCards = [
    {
      icon: Building2,
      title: contactData.registered_office?.title || "Registered Office",
      content: (
        <>
          {contactData.registered_office?.address_line_1}
          <br />
          {contactData.registered_office?.address_line_2}
          <br />
          {contactData.registered_office?.address_line_3}
        </>
      ),
    },
    {
      icon: MapPin,
      title: contactData.corporate_office?.title || "Corporate Office",
      content: (
        <>
          {contactData.corporate_office?.address_line_1}
          <br />
          {contactData.corporate_office?.address_line_2}
          <br />
          {contactData.corporate_office?.address_line_3}
        </>
      ),
    },
    {
      icon: Mail,
      title: "Email",
      content: <>{contactData.email}</>,
    },
    {
      icon: Phone,
      title: "Phone",
      content: <>{contactData.phone}</>,
    },
  ];

  const statutoryInfo = [
    { label: "CIN", value: contactData.statutory_info?.cin },
    { label: "GST NO.", value: contactData.statutory_info?.gst_no },
    {
      label: "REGISTRATION NO.",
      value: contactData.statutory_info?.registration_no,
    },
    { label: "ROC", value: contactData.statutory_info?.roc },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-20">
     
            <section className="pt-32 pb-20 bg-[#f5f4ef]">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center max-w-4xl mx-auto">
           <div className="inline-flex items-center gap-4 sm:gap-5 mb-6">
           <span className="w-12 sm:w-16 h-px bg-[#c59b37]" />
           <span className="text-[#c59b37] font-semibold text-sm sm:text-base uppercase tracking-[0.35em]">
            Contact Digital Integrator
           </span>
           <span className="w-12 sm:w-16 h-px bg-[#c59b37]" />
           </div>

           <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#13233c] mb-6">
           Contact Us
           </h1>

            <p className="text-xl sm:text-2xl leading-9 text-[#5e6978] max-w-3xl mx-auto">
              Get in touch with our team for enquiries, support, product
                discussions, or partnership opportunities.
             </p>
           </div>
           </div>
           </section>

        <section>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-16 text-muted-foreground">
                Loading contact information...
              </div>
            ) : (
              <div className="grid xl:grid-cols-[1.05fr_0.95fr] gap-10">
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-5">
                    {contactCards.map((card, index) => {
                      const Icon = card.icon;

                      return (
                        <div
                          key={`${card.title}-${index}`}
                          className="group bg-white border border-gunmetal/10 p-6 rounded-sm shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                          style={{ animationDelay: `${index * 80}ms` }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-defence-green/10 flex items-center justify-center flex-shrink-0 rounded-sm group-hover:bg-defence-green transition-all duration-300">
                              <Icon className="w-5 h-5 text-defence-green group-hover:text-white transition-colors duration-300" />
                            </div>

                            <div>
                              <h3 className="font-semibold text-foreground text-lg mb-2">
                                {card.title}
                              </h3>
                              <p className="text-muted-foreground leading-7">
                                {card.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-white border border-gunmetal/10 p-5 md:p-7 rounded-sm shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 bg-sand-dark/60 flex items-center justify-center rounded-sm">
                        <FileText className="w-5 h-5 text-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground text-xl">
                        Statutory Information
                      </h3>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {statutoryInfo.map((item) => (
                        <div
                          key={item.label}
                          className="bg-sand-dark/60 border border-gunmetal/5 px-4 py-4 rounded-sm hover:bg-sand-dark/80 transition-colors duration-300"
                        >
                          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                            {item.label}
                          </p>
                          <p className="font-semibold text-foreground break-words">
                            {item.value || "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-defence-green text-white p-7 rounded-sm shadow-md hover:shadow-xl transition-all duration-300 animate-fade-in">
                    <h3 className="font-semibold text-2xl mb-3">
                      {contactData.cta?.title}
                    </h3>
                    <p className="text-white/80 leading-7 mb-5">
                      {contactData.cta?.description}
                    </p>

                    <Link
                      to="/enquiry"
                      className="inline-flex items-center gap-2 bg-brass-gold text-black px-5 py-3 font-medium hover:translate-x-1 transition-all duration-300"
                    >
                      {contactData.cta?.button_text}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="animate-fade-in">
                  <div className="bg-white border border-gunmetal/10 p-2 rounded-sm shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="mb-4 px-4 pt-4">
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        Our Location
                      </h3>
                      <p className="text-muted-foreground">
                        Visit our office or connect with us for business enquiries.
                      </p>
                    </div>

                    <iframe
                      src={contactData.map_embed_url}
                      width="100%"
                      height="620"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="DIPL Office Location"
                      className="rounded-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="pt-14">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-sand-dark/50 border border-gunmetal/10 p-8 rounded-sm shadow-sm">
              <div className="grid sm:grid-cols-3 gap-6 text-center">
                {(contactData.certifications || []).map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-center justify-center gap-3 hover:-translate-y-1 transition-transform duration-300"
                  >
                    {item.toLowerCase().includes("gem") ? (
                      <FileText className="w-5 h-5 text-defence-green" />
                    ) : (
                      <Shield className="w-5 h-5 text-defence-green" />
                    )}
                    <span className="font-semibold text-foreground">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;