import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  const [homeData, setHomeData] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/home`)
      .then((res) => res.json())
      .then((data) => setHomeData(data))
      .catch((err) => console.error(err));
  }, []);

  const getSection = (name) => {
    return homeData.find((item) => item.section === name);
  };

  const hero = getSection("hero");

  return (
    <div>
      <Header />

      
      <section className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            {hero?.content?.title || "Default Title"}
          </h1>
          <p className="mt-4">
            {hero?.content?.subtitle || "Default Subtitle"}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);