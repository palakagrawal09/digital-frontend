import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Loader2, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/api';

const AdminLoginPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleCredentials = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await apiClient.adminLogin(username, password);
      const data = response.data;

      if (data.requires_otp) {
        setStep('otp');
        setInfo('OTP sent to CEO email. Please enter it below.');
      } else {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_role', data.role || 'admin');

        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await apiClient.adminLogin(
        username,
        password,
        otp
      );

      const data = response.data;

      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_role', data.role || 'super_admin');

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efede8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* LOGO + TITLE */}
        <div className="text-center mb-8">
          <img
            src="/assets/dipl-logo.jpg"
            alt="DIPL"
            className="h-16 mx-auto mb-6 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />

          <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">
            Admin Portal
          </h1>

          <p className="text-gray-600 text-lg">
            Digital Integrator CMS
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white border border-gray-200 p-10 shadow-2xl rounded-sm">

          {step === 'credentials' ? (

            <form onSubmit={handleCredentials} className="space-y-6">

              {/* USERNAME */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Username
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-sm focus:outline-none focus:border-[#2d5b46] focus:ring-1 focus:ring-[#2d5b46] placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-sm focus:outline-none focus:border-[#2d5b46] focus:ring-1 focus:ring-[#2d5b46] placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm rounded-sm">
                  {error}
                </div>
              )}

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2d5b46] hover:bg-[#234636] text-white font-semibold py-3 px-6 rounded-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Login'
                )}
              </button>

              {/* DEFAULT LOGIN */}
              <div className="border-t border-gray-200 mt-6 pt-6">
                <p className="text-center text-gray-500 text-sm">
                  Default credentials: admin / admin123
                </p>
              </div>

            </form>

          ) : (

            <form onSubmit={handleOtp} className="space-y-6">

              {/* OTP ICON */}
              <div className="text-center">
                <div className="w-16 h-16 bg-[#2d5b46]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-[#2d5b46]" />
                </div>

                <h2 className="text-2xl font-bold text-black">
                  Two-Factor Authentication
                </h2>

                {info && (
                  <p className="text-sm text-gray-500 mt-2">
                    {info}
                  </p>
                )}
              </div>

              {/* OTP FIELD */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Enter OTP
                </label>

                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  placeholder="------"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ''))
                  }
                  className="w-full text-center text-2xl font-mono tracking-[0.5em] py-4 border border-gray-300 bg-white text-gray-900 rounded-sm focus:outline-none focus:border-[#2d5b46] focus:ring-1 focus:ring-[#2d5b46] placeholder:text-gray-400"
                />
              </div>

              {/* ERROR */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm rounded-sm">
                  {error}
                </div>
              )}

              {/* VERIFY BUTTON */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-[#2d5b46] hover:bg-[#234636] text-white font-semibold py-3 px-6 rounded-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Login'
                )}
              </button>

              {/* BACK BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setOtp('');
                  setError('');
                }}
                className="w-full text-sm text-gray-500 hover:text-black transition-colors"
              >
                ← Back to login
              </button>

            </form>

          )}

        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;