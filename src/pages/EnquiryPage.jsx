import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Send,
  FileText,
  Wrench,
  Loader2,
  ShieldCheck,
  CheckCircle,
  Upload,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient, BACKEND_URL } from "@/lib/api";

const validatePhone = (phone) => /^\d{10}$/.test(phone.replace(/\s+/g, ""));
const validateEmail = (email) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

const DEFAULT_ENQUIRY_FIELDS = [
  {
    field_key: "name",
    label: "Full Name",
    field_type: "text",
    placeholder: "Your full name",
    required: true,
    section: "Main",
    sort_order: 1,
    active: true,
  },
  {
    field_key: "email",
    label: "Email Address",
    field_type: "email",
    placeholder: "you@company.com",
    required: true,
    section: "Main",
    sort_order: 2,
    active: true,
  },
  {
    field_key: "phone",
    label: "Phone Number",
    field_type: "phone",
    placeholder: "9876543210",
    required: true,
    section: "Main",
    sort_order: 3,
    active: true,
  },
  {
    field_key: "organization",
    label: "Organization / Unit",
    field_type: "text",
    placeholder: "Company / Unit name",
    required: false,
    section: "Main",
    sort_order: 4,
    active: true,
  },
  {
    field_key: "product_interest",
    label: "Product / Service Interest",
    field_type: "select",
    placeholder: "Select area of interest",
    required: false,
    section: "Main",
    sort_order: 5,
    active: true,
    options: [
      "Fire Control Systems (AMFDC)",
      "Gun Barrel Inspection (GBInP)",
      "Field Surveillance (FSD/INVSS)",
      "Simulators & Training",
      "Industrial Automation",
      "Repair & AMC Services",
      "Other",
    ],
  },
  {
    field_key: "subject",
    label: "Subject",
    field_type: "text",
    placeholder: "Enter subject",
    required: true,
    section: "Main",
    sort_order: 6,
    active: true,
  },
  {
    field_key: "message",
    label: "Detailed Requirements",
    field_type: "textarea",
    placeholder: "Describe your requirement...",
    required: true,
    section: "Main",
    sort_order: 7,
    active: true,
  },
];

const DEFAULT_REPAIR_FIELDS = [
  {
    field_key: "name",
    label: "Full Name",
    field_type: "text",
    placeholder: "Your full name",
    required: true,
    section: "Main",
    sort_order: 1,
    active: true,
  },
  {
    field_key: "email",
    label: "Email Address",
    field_type: "email",
    placeholder: "you@company.com",
    required: true,
    section: "Main",
    sort_order: 2,
    active: true,
  },
  {
    field_key: "phone",
    label: "Phone Number",
    field_type: "phone",
    placeholder: "9876543210",
    required: true,
    section: "Main",
    sort_order: 3,
    active: true,
  },
  {
    field_key: "organization",
    label: "Organization / Unit",
    field_type: "text",
    placeholder: "Company / Unit name",
    required: false,
    section: "Main",
    sort_order: 4,
    active: true,
  },
  {
    field_key: "equipment_category",
    label: "Equipment Name",
    field_type: "select",
    placeholder: "Select equipment",
    required: true,
    section: "Equipment",
    sort_order: 5,
    active: true,
    options: [
      "AMFDC MK-II",
      "AMFDC MK-III",
      "TEEVRA FDC",
      "GBInP-17 Universal",
      "LCGB-HMRSV-21-XG",
      "FSD Flexible / INVSS",
      "ATGM SV21 Simulator",
      "Other Equipment",
    ],
  },
  {
    field_key: "equipment_variant",
    label: "Equipment Variant",
    field_type: "text",
    placeholder: "Variant / Model",
    required: false,
    section: "Equipment",
    sort_order: 6,
    active: true,
  },
  {
    field_key: "serial_number",
    label: "Serial Number",
    field_type: "text",
    placeholder: "Equipment serial number",
    required: false,
    section: "Equipment",
    sort_order: 7,
    active: true,
  },
  {
    field_key: "issue_description",
    label: "Issue Description",
    field_type: "textarea",
    placeholder: "Describe the issue, symptoms, error codes...",
    required: true,
    section: "Issue",
    sort_order: 8,
    active: true,
  },
  {
    field_key: "image_urls",
    label: "Damage Images",
    field_type: "file",
    placeholder: "Click to upload images",
    required: false,
    section: "Issue",
    sort_order: 9,
    active: true,
  },
];

const EnquiryPage = () => {
  const [activeTab, setActiveTab] = useState("enquiry");

  const [enquiryFields, setEnquiryFields] = useState(DEFAULT_ENQUIRY_FIELDS);
  const [repairFields, setRepairFields] = useState(DEFAULT_REPAIR_FIELDS);

  const [otpStep, setOtpStep] = useState("form");
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    subject: "",
    product_interest: "",
    message: "",
  });

  const [repairForm, setRepairForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    equipment_category: "",
    equipment_variant: "",
    serial_number: "",
    issue_description: "",
    image_urls: [],
  });

  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [repairSubmitting, setRepairSubmitting] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [repairSubmitted, setRepairSubmitted] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState({});

  const inputClass =
    "w-full px-4 py-3 bg-card border border-gunmetal/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brass-gold/60 focus:ring-1 focus:ring-brass-gold/30 transition-colors";
  const labelClass = "block text-base font-medium text-foreground mb-1.5";
  const errorClass = "text-red-500 text-sm mt-1";

  const currentEmail =
    activeTab === "enquiry" ? enquiryForm.email : repairForm.email;

  useEffect(() => {
    loadFormFields();
  }, []);

  const normalizeFields = (fields, fallback) => {
    if (!Array.isArray(fields) || fields.length === 0) return fallback;

    return fields
      .filter((field) => field.active !== false)
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  };

  const loadFormFields = async () => {
    try {
      const [enquiryRes, repairRes] = await Promise.all([
        apiClient.getFormFields("enquiry"),
        apiClient.getFormFields("repair"),
      ]);

      setEnquiryFields(normalizeFields(enquiryRes.data, DEFAULT_ENQUIRY_FIELDS));
      setRepairFields(normalizeFields(repairRes.data, DEFAULT_REPAIR_FIELDS));
    } catch (err) {
      console.error("Failed to load dynamic form fields:", err);
      setEnquiryFields(DEFAULT_ENQUIRY_FIELDS);
      setRepairFields(DEFAULT_REPAIR_FIELDS);
    }
  };

  const currentFormType = activeTab;

  const clearError = (field) => {
    const newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);
  };

  const resetOtp = () => {
    setOtpStep("form");
    setOtpCode("");
    setVerifiedEmail("");
  };

  const getFieldErrorKey = (fieldKey) => {
    return activeTab === "repair" ? `rp_${fieldKey}` : fieldKey;
  };

  const getOptions = (field) => {
    if (Array.isArray(field.options)) return field.options;
    if (typeof field.options === "string") {
      return field.options
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    }
    return [];
  };

  const validateDynamicForm = (form, fields, prefix = "") => {
    const e = {};

    fields.forEach((field) => {
      if (field.field_type === "file") return;

      const key = field.field_key;
      const value = form[key];
      const errorKey = prefix ? `${prefix}_${key}` : key;

      if (field.required && !String(value || "").trim()) {
        e[errorKey] = `${field.label || key} is required`;
      }

      if (field.field_type === "email" && value && !validateEmail(value)) {
        e[errorKey] = "Enter a valid email";
      }

      if (field.field_type === "phone" && value && !validatePhone(value)) {
        e[errorKey] = "Enter a valid 10-digit phone number";
      }
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateEmail(currentEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    setOtpSending(true);
    try {
      await apiClient.sendOtp(currentEmail, currentFormType);
      setOtpStep("otp");
      alert("OTP sent to your email! Please check your inbox.");
    } catch (err) {
      alert("Failed to send OTP: " + (err.response?.data?.detail || err.message));
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      alert("Please enter the 6-digit code");
      return;
    }

    setOtpVerifying(true);
    try {
      await apiClient.verifyOtp(currentEmail, otpCode);
      setOtpStep("verified");
      setVerifiedEmail(currentEmail);
      alert("Email verified successfully!");
    } catch (err) {
      alert("Verification failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();

    if (!validateDynamicForm(enquiryForm, enquiryFields)) return;

    if (verifiedEmail !== enquiryForm.email) {
      alert("Please verify your email before submitting");
      return;
    }

    setEnquirySubmitting(true);
    try {
      await apiClient.submitEnquiry(enquiryForm);
      setEnquirySubmitted(true);
    } catch (err) {
      alert("Submission failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const handleRepairSubmit = async (e) => {
    e.preventDefault();

    if (!validateDynamicForm(repairForm, repairFields, "rp")) return;

    if (verifiedEmail !== repairForm.email) {
      alert("Please verify your email before submitting");
      return;
    }

    setRepairSubmitting(true);
    try {
      await apiClient.submitRepair(repairForm);
      setRepairSubmitted(true);
    } catch (err) {
      alert("Submission failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setRepairSubmitting(false);
    }
  };

  const updateEnquiryField = (key, value) => {
    setEnquiryForm((prev) => ({ ...prev, [key]: value }));
    clearError(key);

    if (key === "email" && verifiedEmail && value !== verifiedEmail) {
      resetOtp();
    }
  };

  const updateRepairField = (key, value) => {
    setRepairForm((prev) => ({ ...prev, [key]: value }));
    clearError(`rp_${key}`);

    if (key === "email" && verifiedEmail && value !== verifiedEmail) {
      resetOtp();
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (repairForm.image_urls.length + files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    setUploadingImages(true);
    try {
      const uploadPromises = files.map((file) => apiClient.uploadFile(file));
      const responses = await Promise.all(uploadPromises);
      const urls = responses.map((res) => res.data.url);

      setRepairForm((prev) => ({
        ...prev,
        image_urls: [...prev.image_urls, ...urls],
      }));
    } catch (err) {
      alert("Image upload failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const removeImage = (index) => {
    const newImages = repairForm.image_urls.filter((_, i) => i !== index);
    setRepairForm({ ...repairForm, image_urls: newImages });
  };

  const renderEmailField = (field, value, onChange, errorKey) => (
    <div key={field.field_key}>
      <label className={labelClass}>
        {field.label || "Email Address"} {field.required ? "*" : ""}
      </label>

      <div className="flex gap-2">
        <input
          type="email"
          required={field.required}
          className={`${inputClass} flex-1 ${
            errors[errorKey] ? "border-red-500" : ""
          }`}
          placeholder={field.placeholder || "you@company.com"}
          value={value}
          onChange={(e) => onChange(field.field_key, e.target.value)}
          disabled={otpStep === "verified"}
        />

        {otpStep === "form" && (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={otpSending || !validateEmail(value)}
            className="btn-primary px-4 py-3 flex items-center gap-2 whitespace-nowrap"
          >
            {otpSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Verify
          </button>
        )}

        {otpStep === "verified" && (
          <div className="flex items-center gap-1 px-3 bg-defence-green/10 border border-defence-green/30 text-defence-green font-medium">
            <ShieldCheck className="w-4 h-4" />
            Verified
          </div>
        )}
      </div>

      {errors[errorKey] && <p className={errorClass}>{errors[errorKey]}</p>}

      {otpStep === "otp" && (
        <div className="mt-3 p-4 bg-card border border-brass-gold/30">
          <p className="text-sm text-muted-foreground mb-2">
            Enter the 6-digit code sent to <strong>{value}</strong>
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              className={`${inputClass} flex-1 text-center text-lg tracking-[0.5em] font-mono`}
              placeholder="000000"
              value={otpCode}
              onChange={(e) =>
                setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpVerifying || otpCode.length !== 6}
              className="btn-accent px-4 py-3 flex items-center gap-2"
            >
              {otpVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              Confirm
            </button>
          </div>

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={otpSending}
            className="text-sm text-brass-gold mt-2 hover:underline"
          >
            Resend code
          </button>
        </div>
      )}
    </div>
  );

  const renderImageUploadField = (field) => (
    <div key={field.field_key}>
      <label className={labelClass}>
        {field.label || "Damage Images"}{" "}
        <span className="text-muted-foreground font-normal text-sm">
          (up to 5, max 5MB each)
        </span>
      </label>

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
            {uploadingImages
              ? "Uploading..."
              : field.placeholder || "Click to upload images"}
          </p>
        </label>
      </div>

      {repairForm.image_urls.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {repairForm.image_urls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={`${BACKEND_URL}${url}`}
                alt={`Damage ${index + 1}`}
                className="w-full h-24 object-cover border border-gunmetal/20"
              />

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
  );

  const renderDynamicField = (field, form, updater, prefix = "") => {
    const key = field.field_key;
    const value = form[key] || "";
    const errorKey = prefix ? `${prefix}_${key}` : key;

    if (field.field_type === "file" || key === "image_urls") {
      return renderImageUploadField(field);
    }

    if (field.field_type === "email" || key === "email") {
      return renderEmailField(field, value, updater, errorKey);
    }

    if (field.field_type === "textarea") {
      return (
        <div key={key}>
          <label className={labelClass}>
            {field.label} {field.required ? "*" : ""}
          </label>
          <textarea
            required={field.required}
            rows={5}
            className={`${inputClass} ${errors[errorKey] ? "border-red-500" : ""}`}
            placeholder={field.placeholder || ""}
            value={value}
            onChange={(e) => updater(key, e.target.value)}
          />
          {errors[errorKey] && <p className={errorClass}>{errors[errorKey]}</p>}
        </div>
      );
    }

    if (field.field_type === "select") {
      const options = getOptions(field);

      return (
        <div key={key}>
          <label className={labelClass}>
            {field.label} {field.required ? "*" : ""}
          </label>
          <select
            required={field.required}
            className={`${inputClass} ${errors[errorKey] ? "border-red-500" : ""}`}
            value={value}
            onChange={(e) => updater(key, e.target.value)}
          >
            <option value="">{field.placeholder || `Select ${field.label}`}</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors[errorKey] && <p className={errorClass}>{errors[errorKey]}</p>}
        </div>
      );
    }

    return (
      <div key={key}>
        <label className={labelClass}>
          {field.label} {field.required ? "*" : ""}
        </label>
        <input
          type={field.field_type === "phone" ? "tel" : field.field_type || "text"}
          required={field.required}
          className={`${inputClass} ${errors[errorKey] ? "border-red-500" : ""}`}
          placeholder={field.placeholder || ""}
          value={value}
          onChange={(e) => updater(key, e.target.value)}
        />
        {errors[errorKey] && <p className={errorClass}>{errors[errorKey]}</p>}
      </div>
    );
  };

  const groupFields = (fields) => {
    const rows = [];
    const normalFields = fields.filter((field) => field.field_type !== "file");

    for (let i = 0; i < normalFields.length; i += 2) {
      rows.push(normalFields.slice(i, i + 2));
    }

    const fileFields = fields.filter((field) => field.field_type === "file");
    return { rows, fileFields };
  };

  const enquiryGrouped = useMemo(() => groupFields(enquiryFields), [enquiryFields]);
  const repairGrouped = useMemo(() => groupFields(repairFields), [repairFields]);

  if (enquirySubmitted || repairSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
            <div className="bg-white border border-defence-green/30 p-12">
              <CheckCircle className="w-16 h-16 text-defence-green mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Thank You!
              </h1>
              <p className="text-muted-foreground mb-6">
                Your {activeTab === "enquiry" ? "enquiry" : "repair request"} has
                been submitted successfully. We'll get back to you within 24
                hours.
              </p>
              <Link to="/" className="btn-primary inline-flex items-center gap-2">
                Back to Home
              </Link>
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
            <h1 className="text-4xl font-bold text-foreground mb-4">
              How Can We Help?
            </h1>
            <p className="text-muted-foreground text-lg">
              Submit an enquiry for new products or request repair & maintenance
              support.
            </p>
          </div>

          <div className="flex border border-gunmetal/20 mb-10">
            <button
              type="button"
              onClick={() => {
                setActiveTab("enquiry");
                resetOtp();
                setErrors({});
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-base uppercase tracking-wider transition-colors ${
                activeTab === "enquiry"
                  ? "bg-defence-green text-white"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-4 h-4" /> New Enquiry
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("repair");
                resetOtp();
                setErrors({});
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-base uppercase tracking-wider transition-colors ${
                activeTab === "repair"
                  ? "bg-defence-green text-white"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wrench className="w-4 h-4" /> Repair Request
            </button>
          </div>

          <div className="bg-white border border-gunmetal/15 p-8">
            {activeTab === "enquiry" && (
              <form onSubmit={handleEnquirySubmit} className="space-y-6">
                {enquiryGrouped.rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="grid sm:grid-cols-2 gap-6">
                    {row.map((field) =>
                      renderDynamicField(field, enquiryForm, updateEnquiryField)
                    )}
                  </div>
                ))}

                {enquiryGrouped.fileFields.map((field) =>
                  renderDynamicField(field, enquiryForm, updateEnquiryField)
                )}

                <button
                  type="submit"
                  disabled={enquirySubmitting || otpStep !== "verified"}
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

                {otpStep !== "verified" && (
                  <p className="text-center text-sm text-muted-foreground">
                    Please verify your email before submitting
                  </p>
                )}
              </form>
            )}

            {activeTab === "repair" && (
              <form onSubmit={handleRepairSubmit} className="space-y-6">
                {repairGrouped.rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="grid sm:grid-cols-2 gap-6">
                    {row.map((field) =>
                      renderDynamicField(field, repairForm, updateRepairField, "rp")
                    )}
                  </div>
                ))}

                {repairGrouped.fileFields.map((field) =>
                  renderDynamicField(field, repairForm, updateRepairField, "rp")
                )}

                <button
                  type="submit"
                  disabled={repairSubmitting || otpStep !== "verified"}
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

                {otpStep !== "verified" && (
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