import {
  LayoutDashboard, Package, Layers3, Briefcase, Users,
  Newspaper, FileText, Mail, Wrench, Phone, UserCog,
  FolderKanban, LogOut, ShieldCheck,
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
  { label: "Form Fields", to: "/admin/form-fields", icon: FileText },
];

// Super admin only item
const superAdminItems = [
  { label: "Admin Management", to: "/admin/management", icon: ShieldCheck },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("admin_role");
  const isSuperAdmin = role === "super_admin";

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_role");
    navigate("/admin/login");
  };

  return (
    <aside className="w-[280px] min-h-screen bg-[#1f3d31] text-white border-r border-white/10 flex flex-col">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/assets/dipl-logo.jpg" alt="DIPL"
            className="h-10 w-10 rounded-md object-contain bg-white p-1"
            onError={(e) => { e.currentTarget.style.display='none'; }} />
          <div>
            <h2 className="text-lg font-semibold leading-tight">Admin Panel</h2>
            <p className="text-xs text-white/70">
              {isSuperAdmin ? '⭐ Super Admin' : 'Website CMS'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive ? "bg-[#c8a45d] text-white shadow-md" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }>
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Super admin only section */}
        {isSuperAdmin && (
          <>
            <div className="pt-3 pb-1 px-4">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Super Admin</p>
            </div>
            {superAdminItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive ? "bg-[#c8a45d] text-white shadow-md" : "text-amber-200/80 hover:bg-white/10 hover:text-white"
                    }`
                  }>
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/10 hover:text-red-100">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;