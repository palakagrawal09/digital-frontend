import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "@/pages/Index";
import AboutPage from "@/pages/AboutPage";
import DefenceSystemsPage from "@/pages/DefenceSystemsPage";
import SimulatorsPage from "@/pages/SimulatorsPage";
import ServicesPage from "@/pages/ServicesPage";
import ContactPage from "@/pages/ContactPage";
import EnquiryPage from "@/pages/EnquiryPage";
import Automation from "@/pages/Automation";
import News from "@/pages/News";
import ClientsPage from "@/pages/ClientsPage";

import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AdminEnquiriesPage from "@/pages/admin/AdminEnquiriesPage";
import AdminRepairsPage from "@/pages/admin/AdminRepairsPage";
import AdminServicesPage from "@/pages/admin/AdminServicesPage";
import AdminClientsPage from "@/pages/admin/AdminClientsPage";
import AdminNewsPage from "@/pages/admin/AdminNewsPage";
import AdminContactPage from "@/pages/admin/AdminContactPage";
import AdminEmployeesPage from "@/pages/admin/AdminEmployeesPage";
import AdminProductCategoriesPage from "@/pages/admin/AdminProductCategoriesPage";
import AdminAboutPage from "@/pages/admin/AdminAboutPage";
import AdminHomepagePage from "@/pages/admin/AdminHomepagePage";
import AdminFormFieldsPage from "@/pages/admin/AdminFormFieldsPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/defence-systems" element={<DefenceSystemsPage />} />
          <Route path="/simulators" element={<SimulatorsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/enquiry" element={<EnquiryPage />} />
          <Route path="/industrial-automation" element={<Automation />} />
          <Route path="/news" element={<News />} />
          <Route path="/clients" element={<ClientsPage />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/homepage" element={<AdminHomepagePage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/enquiries" element={<AdminEnquiriesPage />} />
          <Route path="/admin/repairs" element={<AdminRepairsPage />} />
          <Route path="/admin/services" element={<AdminServicesPage />} />
          <Route path="/admin/clients" element={<AdminClientsPage />} />
          <Route path="/admin/news" element={<AdminNewsPage />} />
          <Route path="/admin/contact" element={<AdminContactPage />} />
          <Route path="/admin/employees" element={<AdminEmployeesPage />} />
          <Route path="/admin/product-categories" element={<AdminProductCategoriesPage />} />
          <Route path="/admin/form-fields" element={<AdminFormFieldsPage />} />
          <Route path="/admin/about" element={<AdminAboutPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;