import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Wrench, Package, Briefcase, Users, 
  Newspaper, Info, Phone, Settings, Tag
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ enquiries: 0, repairs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await apiClient.adminVerify();
        loadStats();
      } catch (err) {
        navigate('/admin/login');
      }
    };
    verifyAuth();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const [enquiriesRes, repairsRes] = await Promise.all([
        apiClient.getEnquiries(),
        apiClient.getRepairs(),
      ]);
      setStats({
        enquiries: enquiriesRes.data.length,
        repairs: repairsRes.data.length,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: FileText, label: 'Homepage Content', color: 'bg-emerald-600', path: '/admin/homepage', desc: 'Edit homepage sections' },
    { icon: FileText, label: 'Enquiries', count: stats.enquiries, color: 'bg-blue-500', path: '/admin/enquiries', desc: 'Manage enquiries' },
    { icon: Wrench, label: 'Repair Requests', count: stats.repairs, color: 'bg-orange-500', path: '/admin/repairs', desc: 'Manage repair requests' },
    { icon: Package, label: 'Products', color: 'bg-green-500', path: '/admin/products', desc: 'Manage products' },
    { icon: Tag, label: 'Product Categories', color: 'bg-teal-500', path: '/admin/product-categories', desc: 'Manage product categories' },
    { icon: Briefcase, label: 'Services', color: 'bg-purple-500', path: '/admin/services', desc: 'Manage services' },
    { icon: Users, label: 'Clients', color: 'bg-indigo-500', path: '/admin/clients', desc: 'Manage clients' },
    { icon: Newspaper, label: 'News & Media', color: 'bg-pink-500', path: '/admin/news', desc: 'Manage news & media' },
    { icon: Info, label: 'About', color: 'bg-cyan-500', path: '/admin/about', desc: 'Manage about page' },
    { icon: Users, label: 'Employees', color: 'bg-yellow-500', path: '/admin/employees', desc: 'Manage employees' },
    { icon: Phone, label: 'Contact', color: 'bg-red-500', path: '/admin/contact', desc: 'Manage contact info' },
    { icon: Settings, label: 'Form Fields', color: 'bg-gray-600', path: '/admin/form-fields', desc: 'Configure form fields' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3d31]"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src="/assets/dipl-logo.jpg" alt="DIPL" className="h-10" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Content Management System</p>
                </div>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome to Admin Portal</h2>
            <p className="text-gray-500">Manage your website content, products, and submissions</p>
          </div>

          {/* All menu cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="text-left bg-white border border-gray-200 p-6 rounded-2xl hover:border-[#c8a45d]/50 hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {item.count !== undefined && (
                      <span className="text-3xl font-bold text-gray-900">{item.count}</span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{item.label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <button onClick={() => navigate('/admin/homepage')}
                className="px-4 py-3 bg-[#1f3d31] text-white rounded-xl hover:bg-[#183126] transition-colors text-sm font-medium">
                Edit Homepage
              </button>
              <button onClick={() => navigate('/admin/news')}
                className="px-4 py-3 bg-[#c8a45d] text-white rounded-xl hover:bg-[#b8944d] transition-colors text-sm font-medium">
                Add News Article
              </button>
              <button onClick={() => navigate('/admin/products')}
                className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium">
                Add Product
              </button>
              <button onClick={() => navigate('/admin/enquiries')}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">
                View Enquiries
              </button>
              <button onClick={() => navigate('/admin/repairs')}
                className="px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-medium">
                View Repairs
              </button>
              <button onClick={() => navigate('/admin/clients')}
                className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium">
                Add Client
              </button>
              <button onClick={() => navigate('/admin/employees')}
                className="px-4 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors text-sm font-medium">
                Add Employee
              </button>
              <button onClick={() => navigate('/admin/form-fields')}
                className="px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors text-sm font-medium">
                Form Fields
              </button>
            </div>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;