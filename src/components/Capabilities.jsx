import { useEffect, useState } from "react";
import { apiClient } from "../lib/api";
import ScrollReveal from "./ScrollReveal";

const Capabilities = () => {
  const [capabilities, setCapabilities] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await apiClient.getServices(); // 👈 backend API
      console.log("DATA 👉", res.data);
      setCapabilities(res.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">
          Our Services
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {capabilities.map((item, index) => (
            <ScrollReveal key={index}>
              <div className="p-6 border shadow">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Capabilities;