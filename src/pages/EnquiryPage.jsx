import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Send, FileText, Wrench, Loader2, ShieldCheck, CheckCircle, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api';

const validatePhone = (phone) => /^\d{10}$/.test(phone.replace(/\s+/g, ''));
const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

const PRODUCT_OPTIONS = [
  { value: 'fire-control', label: 'Fire Control Systems (AMFDC)' },
  { value: 'inspection', label: 'Gun Barrel Inspection (GBInP)' },
  { value: 'surveillance', label: 'Field Surveillance (FSD/INVSS)' },
  { value: 'simulators', label: 'Simulators & Training' },
  { value: 'industrial', label: 'Industrial Automation' },
  { value: 'services', label: 'Repair & AMC Services' },
  { value: 'other', label: 'Other' },
];

const EQUIPMENT_CATEGORIES = [
  'AMFDC MK-II',
  'AMFDC MK-III',
  'TEEVRA FDC',
  'GBInP-17 Universal',
  'LCGB-HMRSV-21-XG',
  'FSD Flexible / INVSS',
  'ATGM SV21 Simulator',
  'Other Equipment',
];

const EQUIPMENT_VARIANTS = {
  'AMFDC MK-II': ['Variant A', 'Variant B', 'Variant C', 'Variant D'],
  'AMFDC MK-III': ['Variant A', 'Variant B', 'Variant C', 'Variant D'],
  'TEEVRA FDC': ['Variant A', 'Variant B', 'Variant C'],
  'GBInP-17 Universal': ['Standard', 'Advanced'],
  'LCGB-HMRSV-21-XG': ['Standard', 'Advanced'],
  'FSD Flexible / INVSS': ['Standard Model', 'Enhanced Model'],
  'ATGM SV21 Simulator': ['Basic', 'Advanced', 'Pro'],
};

const EnquiryPage = () => {
  const [activeTab, setActiveTab] = useState('enquiry');
  const [otpStep, setOtpStep] = useState('form');
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  
  const [enquiryForm, setEnquiryForm] = useState({
    name: '', email: '', phone: '', organization: '',
    subject: '', product_interest: '', message: '',
  });
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);

  const [repairForm, setRepairForm] = useState({
    name: '', email: '', phone: '', organization: '',
    equipment_category: '', equipment_variant: '', serial_number: '', issue_description: '',
    image_urls: [],
  });
  const [repairSubmitting, setRepairSubmitting] = useState(false);
  const [repairSubmitted, setRepairSubmitted] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [errors, setErrors] = useState({});

  const currentEmail = activeTab === 'enquiry' ? enquiryForm.email : repairForm.email;
  const currentFormType = activeTab;

  const clearError = (field) => {
    const newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);
  };

  const resetOtp = () => {
    setOtpStep('form');
    setOtpCode('');
    setVerifiedEmail('');
  };

  const validateEnquiryForm = () => {
    const e = {};
    if (!enquiryForm.name.trim()) e.name = 'Name is required';
    if (!validateEmail(enquiryForm.email)) e.email = 'Enter a valid email';
    if (!validatePhone(enquiryForm.phone)) e.phone = 'Enter a valid 10-digit phone number';
    if (!enquiryForm.subject.trim()) e.subject = 'Subject is required';
    if (!enquiryForm.message.trim()) e.message = 'Message is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateRepairForm = () => {
    const e = {};
    if (!repairForm.name.trim()) e.rp_name = 'Name is required';
    if (!validateEmail(repairForm.email)) e.rp_email = 'Enter a valid email';
    if (!validatePhone(repairForm.phone)) e.rp_phone = 'Enter a valid 10-digit phone number';
    if (!repairForm.equipment_category) e.rp_equipment = 'Select equipment';
    if (!repairForm.issue_description.trim()) e.rp_issue = 'Describe the issue';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateEmail(currentEmail)) {
      alert('Please enter a valid email address');
      return;
    }
    setOtpSending(true);
    try {
      await apiClient.sendOtp(currentEmail, currentFormType);
      setOtpStep('otp');
      alert('OTP sent to your email! Please check your inbox.');
    } catch (err) {
      alert('Failed to send OTP: ' + (err.response?.data?.detail || err.message));
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      alert('Please enter the 6-digit code');
      return;
    }
    setOtpVerifying(true);
    try {
      await apiClient.verifyOtp(currentEmail, otpCode);
      setOtpStep('verified');
      setVerifiedEmail(currentEmail);
      alert('Email verified successfully!');
    } catch (err) {
      alert('Verification failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!validateEnquiryForm()) return;
    if (verifiedEmail !== enquiryForm.email) {
      alert('Please verify your email before submitting');
      return;
    }
    setEnquirySubmitting(true);
    try {
      await apiClient.submitEnquiry(enquiryForm);
      setEnquirySubmitted(true);
    } catch (err) {
      alert('Submission failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const handleRepairSubmit = async (e) => {
    e.preventDefault();
    if (!validateRepairForm()) return;
    if (verifiedEmail !== repairForm.email) {
      alert('Please verify your email before submitting');
      return;
    }
    setRepairSubmitting(true);
    try {
      await apiClient.submitRepair(repairForm);
      setRepairSubmitted(true);
    } catch (err) {
      alert('Submission failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setRepairSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    if (repairForm.image_urls.length + files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setUploadingImages(true);
    try {
      const uploadPromises = files.map(file => apiClient.uploadFile(file));
      const responses = await Promise.all(uploadPromises);
      const urls = responses.map(res => res.data.url);
      setRepairForm({ ...repairForm, image_urls: [...repairForm.image_urls, ...urls] });
    } catch (err) {
      alert('Image upload failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    const newImages = repairForm.image_urls.filter((_, i) => i !== index);
    setRepairForm({ ...repairForm, image_urls: newImages });
  };

  const inputClass = 'w-full px-4 py-3 bg-card border border-gunmetal/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brass-gold/60 focus:ring-1 focus:ring-brass-gold/30 transition-colors';
  const labelClass = 'block text-base font-medium text-foreground mb-1.5';
  const errorClass = 'text-red-500 text-sm mt-1';

  const renderEmailField = (formEmail, setFormEmail, errorKey) => (
    <div>
      <label className={labelClass}>Email Address *</label>
      <div className="flex gap-2">
        <input
          type="email"
          required
          className={`${inputClass} flex-1 ${errors[errorKey] ? 'border-red-500' : ''}`}
          placeholder="you@company.com"
          value={formEmail}
          onChange={(e) => {
            setFormEmail(e.target.value);
            clearError(errorKey);
            if (verifiedEmail && e.target.value !== verifiedEmail) resetOtp();
          }}
          disabled={otpStep === 'verified'}
        />
        {otpStep === 'form' && (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={otpSending || !validateEmail(formEmail)}
            className="btn-primary px-4 py-3 flex items-center gap-2 whitespace-nowrap"
          >
            {otpSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Verify
          </button>
        )}
        {otpStep === 'verified' && (
          <div className="flex items-center gap-1 px-3 bg-defence-green/10 border border-defence-green/30 text-defence-green font-medium">
            <ShieldCheck className="w-4 h-4" />
            Verified
          </div>
        )}
      </div>
      {errors[errorKey] && <p className={errorClass}>{errors[errorKey]}</p>}
      {otpStep === 'otp' && (
        <div className="mt-3 p-4 bg-card border border-brass-gold/30">
          <p className="text-sm text-muted-foreground mb-2">
            Enter the 6-digit code sent to <strong>{formEmail}</strong>
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              className={`${inputClass} flex-1 text-center text-lg tracking-[0.5em] font-mono`}
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpVerifying || otpCode.length !== 6}
              className="btn-accent px-4 py-3 flex items-center gap-2"
            >
              {otpVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Confirm
            </button>
          </div>
          <button type="button" onClick={handleSendOtp} disabled={otpSending} className="text-sm text-brass-gold mt-2 hover:underline">
            Resend code
          </button>
        </div>
      )}
    </div>
  );

  if (enquirySubmitted || repairSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
            <div className="bg-white border border-defence-green/30 p-12">
              <CheckCircle className="w-16 h-16 text-defence-green mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-4">Thank You!</h1>
              <p className="text-muted-foreground mb-6">
                Your {activeTab === 'enquiry' ? 'enquiry' : 'repair request'} has been submitted successfully. 
                We'll get back to you within 24 hours.
              </p>
              <Link to="/" className="btn-primary inline-flex items-center gap-2">Back to Home</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">How Can We Help?</h1>
            <p className="text-muted-foreground text-lg">
              Submit an enquiry for new products or request repair & maintenance support.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border border-gunmetal/20 mb-10">
            <button
              onClick={() => { setActiveTab('enquiry'); resetOtp(); setErrors({}); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-base uppercase tracking-wider transition-colors ${
                activeTab === 'enquiry' ? 'bg-defence-green text-white' : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-4 h-4" /> New Enquiry
            </button>
            <button
              onClick={() => { setActiveTab('repair'); resetOtp(); setErrors({}); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-base uppercase tracking-wider transition-colors ${
                activeTab === 'repair' ? 'bg-defence-green text-white' : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <Wrench className="w-4 h-4" /> Repair Request
            </button>
          </div>

          <div className="bg-white border border-gunmetal/15 p-8">
            {/* Enquiry Form */}
            {activeTab === 'enquiry' && (
              <form onSubmit={handleEnquirySubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input
                      type="text"
                      required
                      className={`${inputClass} ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Your full name"
                      value={enquiryForm.name}
                      onChange={(e) => { setEnquiryForm({ ...enquiryForm, name: e.target.value }); clearError('name'); }}
                    />
                    {errors.name && <p className={errorClass}>{errors.name}</p>}
                  </div>
                  {renderEmailField(enquiryForm.email, (email) => setEnquiryForm({ ...enquiryForm, email }), 'email')}
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Phone Number * <span className="text-muted-foreground font-normal text-sm">(10 digits)</span></label>
                    <input
                      type="tel"
                      required
                      className={`${inputClass} ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="9876543210"
                      value={enquiryForm.phone}
                      onChange={(e) => { setEnquiryForm({ ...enquiryForm, phone: e.target.value }); clearError('phone'); }}
                    />
                    {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Organization / Unit</label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Company / Unit name"
                      value={enquiryForm.organization}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, organization: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Product / Service Interest</label>
                  <select
                    className={inputClass}
                    value={enquiryForm.product_interest}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, product_interest: e.target.value })}
                  >
                    <option value="">Select area of interest</option>
                    {PRODUCT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Subject *</label>
                  <input
                    type="text"
                    required
                    className={`${inputClass} ${errors.subject ? 'border-red-500' : ''}`}
                    value={enquiryForm.subject}
                    onChange={(e) => { setEnquiryForm({ ...enquiryForm, subject: e.target.value }); clearError('subject'); }}
                  />
                  {errors.subject && <p className={errorClass}>{errors.subject}</p>}
                </div>

                <div>
                  <label className={labelClass}>Detailed Requirements *</label>
                  <textarea
                    required
                    rows={5}
                    className={`${inputClass} ${errors.message ? 'border-red-500' : ''}`}
                    value={enquiryForm.message}
                    onChange={(e) => { setEnquiryForm({ ...enquiryForm, message: e.target.value }); clearError('message'); }}
                  />
                  {errors.message && <p className={errorClass}>{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={enquirySubmitting || otpStep !== 'verified'}
                  className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                >
                  {enquirySubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Enquiry
                    </>
                  )}
                </button>

                {otpStep !== 'verified' && (
                  <p className="text-center text-sm text-muted-foreground">
                    Please verify your email before submitting
                  </p>
                )}
              </form>
            )}

            {/* Repair Form */}
            {activeTab === 'repair' && (
              <form onSubmit={handleRepairSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input
                      type="text"
                      required
                      className={`${inputClass} ${errors.rp_name ? 'border-red-500' : ''}`}
                      placeholder="Your full name"
                      value={repairForm.name}
                      onChange={(e) => { setRepairForm({ ...repairForm, name: e.target.value }); clearError('rp_name'); }}
                    />
                    {errors.rp_name && <p className={errorClass}>{errors.rp_name}</p>}
                  </div>
                  {renderEmailField(repairForm.email, (email) => setRepairForm({ ...repairForm, email }), 'rp_email')}
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Phone Number * <span className="text-muted-foreground font-normal text-sm">(10 digits)</span></label>
                    <input
                      type="tel"
                      required
                      className={`${inputClass} ${errors.rp_phone ? 'border-red-500' : ''}`}
                      placeholder="9876543210"
                      value={repairForm.phone}
                      onChange={(e) => { setRepairForm({ ...repairForm, phone: e.target.value }); clearError('rp_phone'); }}
                    />
                    {errors.rp_phone && <p className={errorClass}>{errors.rp_phone}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Organization / Unit</label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Company / Unit name"
                      value={repairForm.organization}
                      onChange={(e) => setRepairForm({ ...repairForm, organization: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Equipment Name *</label>
                    <select
                      required
                      className={`${inputClass} ${errors.rp_equipment ? 'border-red-500' : ''}`}
                      value={repairForm.equipment_category}
                      onChange={(e) => {
                        setRepairForm({ ...repairForm, equipment_category: e.target.value, equipment_variant: '' });
                        clearError('rp_equipment');
                      }}
                    >
                      <option value="">Select equipment</option>
                      {EQUIPMENT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.rp_equipment && <p className={errorClass}>{errors.rp_equipment}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Equipment Variant</label>
                    <select
                      className={inputClass}
                      value={repairForm.equipment_variant}
                      onChange={(e) => setRepairForm({ ...repairForm, equipment_variant: e.target.value })}
                      disabled={!repairForm.equipment_category || !EQUIPMENT_VARIANTS[repairForm.equipment_category]}
                    >
                      <option value="">Select variant</option>
                      {(EQUIPMENT_VARIANTS[repairForm.equipment_category] || []).map((variant) => (
                        <option key={variant} value={variant}>{variant}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Serial Number</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Equipment serial number"
                    value={repairForm.serial_number}
                    onChange={(e) => setRepairForm({ ...repairForm, serial_number: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>Issue Description *</label>
                  <textarea
                    required
                    rows={5}
                    className={`${inputClass} ${errors.rp_issue ? 'border-red-500' : ''}`}
                    placeholder="Describe the issue, symptoms, error codes..."
                    value={repairForm.issue_description}
                    onChange={(e) => { setRepairForm({ ...repairForm, issue_description: e.target.value }); clearError('rp_issue'); }}
                  />
                  {errors.rp_issue && <p className={errorClass}>{errors.rp_issue}</p>}
                </div>

                <div>
                  <label className={labelClass}>Damage Images <span className="text-muted-foreground font-normal text-sm">(up to 5, max 5MB each)</span></label>
                  <div className="border-2 border-dashed border-gunmetal/20 p-6 text-center hover:border-brass-gold/40 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadingImages || repairForm.image_urls.length >= 5}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                      </p>
                    </label>
                  </div>
                  {repairForm.image_urls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {repairForm.image_urls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img src={url} alt={`Damage ${index + 1}`} className="w-full h-24 object-cover border border-gunmetal/20" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={repairSubmitting || otpStep !== 'verified'}
                  className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                >
                  {repairSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Wrench className="w-5 h-5" />
                      Submit Repair Request
                    </>
                  )}
                </button>

                {otpStep !== 'verified' && (
                  <p className="text-center text-sm text-muted-foreground">
                    Please verify your email before submitting
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EnquiryPage;
