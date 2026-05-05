import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Wrench, Package, Briefcase, Users, Newspaper, LogOut } from 'lucide-react';
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
    { icon: FileText, label: 'Homepage Content', color: 'bg-emerald-600', path: '/admin/homepage' },
    { icon: FileText, label: 'Enquiries', count: stats.enquiries, color: 'bg-blue-500' },
    { icon: Wrench, label: 'Repair Requests', count: stats.repairs, color: 'bg-orange-500' },
    { icon: Package, label: 'Products', color: 'bg-green-500' },
    { icon: Briefcase, label: 'Services', color: 'bg-purple-500' },
    { icon: Users, label: 'Clients', color: 'bg-indigo-500' },
    { icon: Newspaper, label: 'News & Media', color: 'bg-pink-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-defence-green"></div>
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
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Content Management System</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Admin Portal</h2>
          <p className="text-muted-foreground">Manage your website content, products, and submissions</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => item.path && navigate(item.path)}
                className="text-left bg-white border border-gray-200 p-6 hover:border-brass-gold/40 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {item.count !== undefined && <span className="text-3xl font-bold text-foreground">{item.count}</span>}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{item.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage {item.label.toLowerCase()}</p>
              </button>
            );
          })}
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={() => navigate('/admin/homepage')} className="px-4 py-3 bg-defence-green text-white hover:bg-defence-green/90 transition-colors text-sm font-medium">
              Edit Homepage
            </button>
            <button className="px-4 py-3 bg-brass-gold text-white hover:bg-brass-gold/90 transition-colors text-sm font-medium">
              Add News Article
            </button>
            <button className="px-4 py-3 bg-gunmetal text-white hover:bg-gunmetal/90 transition-colors text-sm font-medium">
              Add Service
            </button>
            <button className="px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium">
              View All Enquiries
            </button>
          </div>
        </div>
      </main>
    </div>
    </AdminLayout>
  );
};

export default AdminDashboard;