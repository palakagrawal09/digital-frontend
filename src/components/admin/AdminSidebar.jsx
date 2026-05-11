import {
  LayoutDashboard,
  Package,
  Layers3,
  Briefcase,
  Users,
  Newspaper,
  FileText,
  Mail,
  Wrench,
  Phone,
  UserCog,
  FolderKanban,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Product Categories", to: "/admin/product-categories", icon: Layers3 },
  { label: "Services", to: "/admin/services", icon: Briefcase },
  { label: "Clients", to: "/admin/clients", icon: Users },
  { label: "News", to: "/admin/news", icon: Newspaper },
  { label: "About", to: "/admin/about", icon: FileText },
  { label: "Enquiries", to: "/admin/enquiries", icon: Mail },
  { label: "Repairs", to: "/admin/repairs", icon: Wrench },
  { label: "Contact", to: "/admin/contact", icon: Phone },
  { label: "Employees", to: "/admin/employees", icon: UserCog },
  { label: "Homepage Content", to: "/admin/homepage", icon: FolderKanban },
  {
  label: "Form Fields",
  to: "/admin/form-fields",
  icon: FileText,
}

];

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  return (
    <aside className="w-[280px] min-h-screen bg-[#1f3d31] text-white border-r border-white/10 flex flex-col">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src="/assets/logo.png"
            alt="DIPL"
            className="h-10 w-10 rounded-md object-contain bg-white p-1"
          />
          <div>
            <h2 className="text-lg font-semibold leading-tight">Admin Panel</h2>
            <p className="text-xs text-white/70">Website CMS</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#c8a45d] text-white shadow-md"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/10 hover:text-red-100"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;