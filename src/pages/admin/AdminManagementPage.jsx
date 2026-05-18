import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Shield, ShieldCheck, RefreshCw, Key, User } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { apiClient } from "@/lib/api";

const AdminManagementPage = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');

  // Create admin
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ username: '', password: '', email: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [creating, setCreating] = useState(false);

  // Delete admin
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteOtpSent, setDeleteOtpSent] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Change password
  const [showChangePw, setShowChangePw] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);

  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const r = localStorage.getItem('admin_role');
    setRole(r || '');
    if (r !== 'super_admin') {
      navigate('/admin/dashboard');
      return;
    }
    loadAdmins();
  }, [navigate]);

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getAdminUsers();
      setAdmins(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response?.status === 403) navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (val) => {
    if (!val) return '-';
    try {
      return new Date(val).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return val; }
  };

  // ---- CREATE FLOW ----
  const handleSendCreateOtp = async () => {
    try {
      await apiClient.sendManagementOtp();
      setOtpSent(true);
      showMsg('OTP sent to CEO email', 'info');
    } catch (err) {
      showMsg(err.response?.data?.detail || 'Failed to send OTP', 'error');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.username || !createForm.password || !createForm.otp) {
      showMsg('All fields required', 'error'); return;
    }
    try {
      setCreating(true);
      await apiClient.createAdminUser(createForm);
      showMsg(`Admin '${createForm.username}' created! Acknowledgment sent to CEO.`, 'success');
      setShowCreate(false);
      setCreateForm({ username: '', password: '', email: '', otp: '' });
      setOtpSent(false);
      loadAdmins();
    } catch (err) {
      showMsg(err.response?.data?.detail || 'Failed to create admin', 'error');
    } finally {
      setCreating(false);
    }
  };

  // ---- DELETE FLOW ----
  const handleSendDeleteOtp = async () => {
    try {
      await apiClient.sendManagementOtp();
      setDeleteOtpSent(true);
      showMsg('OTP sent to CEO email', 'info');
    } catch (err) {
      showMsg(err.response?.data?.detail || 'Failed to send OTP', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteOtp) { showMsg('Enter OTP', 'error'); return; }
    try {
      setDeleting(true);
      await apiClient.deleteAdminUser(deleteTarget.id, deleteOtp);
      showMsg(`Admin '${deleteTarget.username}' deleted. Acknowledgment sent to CEO.`, 'success');
      setDeleteTarget(null);
      setDeleteOtp('');
      setDeleteOtpSent(false);
      loadAdmins();
    } catch (err) {
      showMsg(err.response?.data?.detail || 'Failed to delete admin', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ---- CHANGE PASSWORD ----
  const handleChangePw = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) {
      showMsg('New passwords do not match', 'error'); return;
    }
    try {
      setSavingPw(true);
      await apiClient.changePassword(pwForm.current_password, pwForm.new_password);
      showMsg('Password changed successfully!', 'success');
      setShowChangePw(false);
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      showMsg(err.response?.data?.detail || 'Failed to change password', 'error');
    } finally {
      setSavingPw(false);
    }
  };

  if (role !== 'super_admin') return null;

  return (
    <AdminLayout>
      <AdminTopbar
        title="Admin Management"
        subtitle="Super Admin only — create, view and delete admin accounts."
        rightContent={
          <button onClick={() => { setShowCreate(true); setOtpSent(false); }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f3d31] px-4 py-2 text-sm font-medium text-white hover:bg-[#183126] transition">
            <Plus className="h-4 w-4" /> Add Admin
          </button>
        }
      />

      {/* Message */}
      {message.text && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
          message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          message.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
          'bg-green-50 text-green-700 border border-green-200'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">

        {/* Super Admin Settings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-[#1f3d31]" />
              <div>
                <h3 className="font-semibold text-gray-900">Super Admin Settings</h3>
                <p className="text-sm text-gray-500">Change your own password</p>
              </div>
            </div>
            <button onClick={() => setShowChangePw(!showChangePw)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              <Key className="h-4 w-4" /> Change Password
            </button>
          </div>

          {showChangePw && (
            <form onSubmit={handleChangePw} className="grid gap-4 md:grid-cols-3 mt-4 pt-4 border-t border-gray-100">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Current Password</label>
                <input type="password" required
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#c8a45d]"
                  value={pwForm.current_password} onChange={(e) => setPwForm(p => ({...p, current_password: e.target.value}))} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" required
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#c8a45d]"
                  value={pwForm.new_password} onChange={(e) => setPwForm(p => ({...p, new_password: e.target.value}))} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input type="password" required
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#c8a45d]"
                  value={pwForm.confirm} onChange={(e) => setPwForm(p => ({...p, confirm: e.target.value}))} />
              </div>
              <div className="md:col-span-3 flex gap-3">
                <button type="submit" disabled={savingPw}
                  className="rounded-xl bg-[#1f3d31] px-5 py-2 text-sm font-medium text-white hover:bg-[#183126] disabled:opacity-60">
                  {savingPw ? 'Saving...' : 'Save Password'}
                </button>
                <button type="button" onClick={() => setShowChangePw(false)}
                  className="rounded-xl border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Admin Users Table */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">All Admin Accounts</h3>
            <button onClick={loadAdmins} className="rounded-xl border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 py-8">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-left font-semibold text-gray-600">Username</th>
                    <th className="pb-3 text-left font-semibold text-gray-600">Role</th>
                    <th className="pb-3 text-left font-semibold text-gray-600">Email</th>
                    <th className="pb-3 text-left font-semibold text-gray-600">Created By</th>
                    <th className="pb-3 text-left font-semibold text-gray-600">Created At</th>
                    <th className="pb-3 text-left font-semibold text-gray-600">Status</th>
                    <th className="pb-3 text-left font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50/50">
                      <td className="py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          {admin.role === 'super_admin'
                            ? <ShieldCheck className="h-4 w-4 text-[#1f3d31]" />
                            : <User className="h-4 w-4 text-gray-400" />}
                          {admin.username}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          admin.role === 'super_admin'
                            ? 'bg-[#1f3d31]/10 text-[#1f3d31]'
                            : 'bg-blue-50 text-blue-700'}`}>
                          {admin.role === 'super_admin' ? '⭐ Super Admin' : 'Admin'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">{admin.email || '-'}</td>
                      <td className="py-3 text-gray-500">{admin.created_by || 'system'}</td>
                      <td className="py-3 text-gray-500">{formatDate(admin.created_at)}</td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          admin.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {admin.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3">
                        {admin.role !== 'super_admin' && (
                          <button onClick={() => { setDeleteTarget(admin); setDeleteOtp(''); setDeleteOtpSent(false); }}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        )}
                        {admin.role === 'super_admin' && (
                          <span className="text-xs text-gray-400 italic">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {admins.length === 0 && (
                <p className="text-center text-gray-400 py-8">No admin accounts found</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CREATE ADMIN MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Admin</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Username *</label>
                  <input type="text" required
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#c8a45d]"
                    value={createForm.username} onChange={(e) => setCreateForm(f => ({...f, username: e.target.value}))} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Password *</label>
                  <input type="password" required
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#c8a45d]"
                    value={createForm.password} onChange={(e) => setCreateForm(f => ({...f, password: e.target.value}))} />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Email (optional)</label>
                  <input type="email"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#c8a45d]"
                    value={createForm.email} onChange={(e) => setCreateForm(f => ({...f, email: e.target.value}))} />
                </div>
              </div>

              {/* OTP Step */}
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm text-amber-800 font-medium mb-3">CEO Verification Required</p>
                {!otpSent ? (
                  <button type="button" onClick={handleSendCreateOtp}
                    className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
                    Send OTP to CEO Email
                  </button>
                ) : (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-amber-800">Enter OTP *</label>
                    <input type="text" maxLength={6}
                      className="w-full rounded-xl border border-amber-300 px-4 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:border-amber-500"
                      placeholder="------"
                      value={createForm.otp} onChange={(e) => setCreateForm(f => ({...f, otp: e.target.value.replace(/\D/g, '')}))} />
                    <button type="button" onClick={handleSendCreateOtp} className="mt-2 text-xs text-amber-700 underline">Resend OTP</button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating || !otpSent}
                  className="rounded-xl bg-[#1f3d31] px-5 py-2 text-sm font-medium text-white hover:bg-[#183126] disabled:opacity-60">
                  {creating ? 'Creating...' : 'Create Admin'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)}
                  className="rounded-xl border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ADMIN MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Admin</h3>
              <button onClick={() => setDeleteTarget(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">Are you sure you want to delete admin <strong>"{deleteTarget.username}"</strong>? This action cannot be undone. CEO will be notified.</p>
              </div>

              {!deleteOtpSent ? (
                <button type="button" onClick={handleSendDeleteOtp}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                  Send OTP to CEO Email
                </button>
              ) : (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Enter OTP</label>
                  <input type="text" maxLength={6} autoFocus
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:border-[#c8a45d]"
                    placeholder="------"
                    value={deleteOtp} onChange={(e) => setDeleteOtp(e.target.value.replace(/\D/g, ''))} />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={handleDelete} disabled={deleting || !deleteOtpSent || deleteOtp.length !== 6}
                  className="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60">
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button onClick={() => setDeleteTarget(null)}
                  className="rounded-xl border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminManagementPage;