import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';

const logo = '/assets/dipl-logo.jpg';
const API_BASE_URL = "http://127.0.0.1:8000";
const resolveImageUrl = (path) => {
  if (!path) return "";
  const value = String(path).trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/assets/")) return value;
  if (value.startsWith("/uploads/")) return `${API_BASE_URL}${value}`;
  if (value.startsWith("uploads/")) return `${API_BASE_URL}/${value}`;
  return value;
};

const DEFAULT_FIELDS = [
  { section: 'hero', key: 'badge', label: 'Hero Badge', type: 'text', value: 'Est. 1990 • ISO 9001:2015 Certified' },
  { section: 'hero', key: 'headline', label: 'Hero Headline', type: 'text', value: 'Mission-Critical Defence Electronics & Automation' },
  { section: 'hero', key: 'background_image', label: 'Hero Background Image (public path e.g. /assets/hero-bg.jpg)', type: 'text', value: '/assets/hero-bg.jpg' },
  { section: 'hero', key: 'description', label: 'Hero Description', type: 'textarea', value: 'Organisation dedicated to product development. Complete solutions for Defence, Industrial Automation, Simulators & Training Systems since 1990.' },
  { section: 'hero', key: 'primary_button_text', label: 'Hero Primary Button Text', type: 'text', value: 'Explore Capabilities' },
  { section: 'hero', key: 'primary_button_link', label: 'Hero Primary Button Link', type: 'text', value: '/defence-systems' },
  { section: 'hero', key: 'secondary_button_text', label: 'Hero Secondary Button Text', type: 'text', value: 'Get a Quote' },
  { section: 'hero', key: 'secondary_button_link', label: 'Hero Secondary Button Link', type: 'text', value: '/enquiry' },

  { section: 'credibility', key: 'stats_json', label: 'Credibility Stats JSON', type: 'textarea', value: '[{"icon":"Shield","value":"ISO 9001:2015","label":"Certified Quality Management"},{"icon":"Users","value":"200+","label":"Happy Clients"},{"icon":"Calendar","value":"30+","label":"Years of Excellence"},{"icon":"Award","value":"CII MSME","label":"Member & GeM Registered"}]' },

  { section: 'about', key: 'subtitle', label: 'About Subtitle', type: 'text', value: 'About Us' },
  { section: 'about', key: 'title', label: 'About Title', type: 'text', value: 'A Legacy of Excellence' },
  { section: 'about', key: 'intro', label: 'About Intro', type: 'textarea', value: "Digital Integrator Private Limited (CIN: U31909MP1997PTC012011) was started in 1990 as Dynalog Microcomputer Services and converted to a Private Limited Company in 1997. Located in central India's commercial capital Indore with about 6000 Sq. Ft. facility." },
  { section: 'about', key: 'overview_title', label: 'Overview Title', type: 'text', value: 'Company Overview' },
  { section: 'about', key: 'overview', label: 'Overview Text', type: 'textarea', value: 'We are a one-stop system integration and automation house with capabilities in Simulation for Defence, Fire Control Systems, customized application & system development based on Embedded, Microcontrollers & Industrial/MIL-Grade PCs, Scientific-Engineering & tailor-made solutions.' },
  { section: 'about', key: 'vision', label: 'Vision', type: 'textarea', value: 'Innovate to make our products recognised for Technology, Quality, Ease of Working, Value for Money and Development of Import substitute solutions in demand with clients.' },
  { section: 'about', key: 'mission', label: 'Mission', type: 'textarea', value: 'To design, develop & provide vital & sustainable systems to our Defence, Para Military & other customers.' },
  { section: 'about', key: 'stats_json', label: 'About Stats JSON', type: 'textarea', value: '[{"icon":"Calendar","value":"33+","label":"Years in Business"},{"icon":"Users","value":"200+","label":"Happy Clients"},{"icon":"Heart","value":"30+","label":"Team of Experts"},{"icon":"Lightbulb","value":"ISO 9001","label":"Certified Quality"}]' },
  { section: 'about', key: 'values_json', label: 'Values JSON', type: 'textarea', value: '[{"icon":"Users","text":"Agile to Customer Needs"},{"icon":"Heart","text":"Perfect Team Work"},{"icon":"Target","text":"Focused Quality Improvements"},{"icon":"Target","text":"Sustained Innovation & Engineering"}]' },
  { section: 'about', key: 'award_caption', label: 'Award Caption', type: 'text', value: 'Nominated for India 5000 Best MSME Award 2019' },

  { section: 'capabilities', key: 'subtitle', label: 'Services Subtitle', type: 'text', value: 'Capabilities' },
  { section: 'capabilities', key: 'title', label: 'Services Title', type: 'text', value: 'Our Services' },
  { section: 'capabilities', key: 'description', label: 'Services Description', type: 'textarea', value: 'Defence-grade engineering, automation, maintenance and consultancy solutions for mission-critical requirements.' },

  { section: 'contact', key: 'subtitle', label: 'Contact Subtitle', type: 'text', value: 'Contact Us' },
  { section: 'contact', key: 'title', label: 'Contact Title', type: 'text', value: 'Get in Touch' },
  { section: 'contact', key: 'description', label: 'Contact Description', type: 'textarea', value: 'Ready to discuss your defence or industrial automation requirements? Reach out to our engineering team for expert consultation.' },
  { section: 'contact', key: 'address', label: 'Address', type: 'textarea', value: '46-A, Electronic Complex\nPardeshipura, Indore\nMadhya Pradesh - 452001' },
  { section: 'contact', key: 'email', label: 'Email', type: 'text', value: 'diplsales@diplindia.com' },
  { section: 'contact', key: 'registration', label: 'Registration Text', type: 'textarea', value: 'CIN: U31909MP1997PTC012011' },
  { section: 'contact', key: 'hours', label: 'Business Hours', type: 'textarea', value: 'Mon - Sat\n9:00 AM - 6:00 PM' },
  { section: 'contact', key: 'cta_title', label: 'CTA Title', type: 'text', value: 'Ready to Partner with Us?' },
  { section: 'contact', key: 'cta_description', label: 'CTA Description', type: 'textarea', value: "Let's discuss how our defence-grade solutions can meet your mission-critical needs." },
  { section: 'contact', key: 'cta_button_text', label: 'CTA Button Text', type: 'text', value: 'Get a Quote' },
  { section: 'contact', key: 'cta_link', label: 'CTA Link', type: 'text', value: '/enquiry' },
];

const getFieldId = (section, key) => `${section}__${key}`;

const AdminHomepagePage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState('hero');

  const sections = useMemo(() => [...new Set(DEFAULT_FIELDS.map((field) => field.section))], []);

  useEffect(() => {
    const init = async () => {
      try {
        await apiClient.adminVerify();
        const res = await apiClient.getPageContent('homepage');
        const dbItems = Array.isArray(res.data) ? res.data : [];
        setItems(dbItems);

        const nextForm = {};
        DEFAULT_FIELDS.forEach((field) => {
          const existing = dbItems.find((item) => item.section === field.section && item.content_key === field.key);
          nextForm[getFieldId(field.section, field.key)] = existing?.content_value ?? field.value;
        });
        setForm(nextForm);
      } catch (error) {
        console.error(error);
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [getFieldId(field.section, field.key)]: value }));
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const response = await apiClient.uploadFile(file);
      const uploadedPath = response?.data?.url || response?.data?.file_url || response?.data?.path || "";
      if (!uploadedPath) throw new Error("No path returned");
      handleChange(field, uploadedPath);
    } catch (error) {
      alert("Image upload failed. Please try again.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const validateJsonFields = () => {
    const jsonFields = DEFAULT_FIELDS.filter((field) => field.key.includes('json'));
    for (const field of jsonFields) {
      const raw = form[getFieldId(field.section, field.key)];
      try {
        JSON.parse(raw);
      } catch {
        throw new Error(`${field.label} has invalid JSON. Please correct it before saving.`);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      validateJsonFields();

      for (const [index, field] of DEFAULT_FIELDS.entries()) {
        const existing = items.find((item) => item.section === field.section && item.content_key === field.key);
        const content_value = form[getFieldId(field.section, field.key)] ?? '';

        if (existing?.id) {
          await apiClient.updatePageContent(existing.id, {
            content_value,
            published: true,
            sort_order: index + 1,
          });
        } else {
          await apiClient.createPageContent({
            page: 'homepage',
            section: field.section,
            content_key: field.key,
            content_value,
            published: true,
            sort_order: index + 1,
          });
        }
      }

      const refreshed = await apiClient.getPageContent('homepage');
      setItems(Array.isArray(refreshed.data) ? refreshed.data : []);
      setMessage('Homepage content saved successfully. Refresh the website homepage to see changes.');
    } catch (error) {
      setMessage(error.message || error.response?.data?.detail || 'Failed to save homepage content.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-defence-green" />
      </div>
    );
  }

  const visibleFields = DEFAULT_FIELDS.filter((field) => field.section === activeSection);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={logo} alt="DIPL" className="h-10" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Homepage CMS</h1>
                <p className="text-sm text-muted-foreground">Edit website homepage content dynamically</p>
              </div>
            </div>
            <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 p-4 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                  activeSection === section ? 'bg-defence-green text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold capitalize text-foreground">{activeSection} Section</h2>
              <p className="text-sm text-muted-foreground">Text fields update directly on the public homepage.</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>

          {message && (
            <div className={`mb-6 px-4 py-3 text-sm border ${message.includes('success') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {message}
            </div>
          )}

          <div className="grid gap-5">
            {visibleFields.map((field) => {
              const fieldId = getFieldId(field.section, field.key);
              const isImageField = field.key.includes('image') || field.key.includes('background') || field.key.includes('logo');
              return (
                <div key={fieldId}>
                  <label className="block text-sm font-semibold text-foreground mb-2">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={field.key.includes('json') ? 7 : 4}
                      className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-brass-gold font-mono text-sm"
                      value={form[fieldId] || ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                    />
                  ) : isImageField ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-brass-gold"
                        value={form[fieldId] || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        placeholder="Enter path or upload below"
                      />
                      <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                        <Upload className="h-4 w-4" />
                        {uploadingImage ? "Uploading..." : "Upload Image"}
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, field)} className="hidden" disabled={uploadingImage} />
                      </label>
                      {form[fieldId] ? (
                        <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                          <img src={resolveImageUrl(form[fieldId])} alt="Preview" className="h-16 w-24 rounded-lg border border-gray-200 object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                          <span className="text-sm text-gray-500 break-all">{form[fieldId]}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <ImageIcon className="h-4 w-4" /> No image selected
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-brass-gold"
                      value={form[fieldId] || ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800 flex gap-2">
          <Plus className="w-4 h-4 mt-0.5 flex-shrink-0" />
          For images, use public paths like <code className="font-semibold">/assets/hero-bg.jpg</code> after placing the image inside <code className="font-semibold">public/assets</code>, or keep the field empty to use the default imported image.
        </div>
      </main>
    </div>
    </AdminLayout>
  );
};

export default AdminHomepagePage;