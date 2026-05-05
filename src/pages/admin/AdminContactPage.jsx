import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminTopbar from "@/components/admin/AdminTopbar";
import SectionHeader from "@/components/admin/SectionHeader";
import { apiClient } from "@/lib/api";

const initialForm = {
  registered_office: {
    title: "",
    address_line_1: "",
    address_line_2: "",
    address_line_3: "",
  },
  corporate_office: {
    title: "",
    address_line_1: "",
    address_line_2: "",
    address_line_3: "",
  },
  email: "",
  phone: "",
  statutory_info: {
    cin: "",
    gst_no: "",
    registration_no: "",
    roc: "",
  },
  map_embed_url: "",
  cta: {
    title: "",
    description: "",
    button_text: "",
  },
  certifications: ["", "", ""],
};

const AdminContactPage = () => {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContactPage();
  }, []);

  const pickFirstObject = (value) => {
    if (!value) return null;
    if (Array.isArray(value)) return value[0] || null;
    if (value.data && Array.isArray(value.data)) return value.data[0] || null;
    if (value.data && typeof value.data === "object") return value.data;
    if (typeof value === "object") return value;
    return null;
  };
const loadContactPage = async () => {
  try {
    console.log("loadContactPage started");
    setLoading(true);

    const response = await fetch("http://127.0.0.1:8000/api/contact");
    console.log("fetch response status =", response.status);

    if (!response.ok) {
      throw new Error(`Failed to load contact page: ${response.status}`);
    }

    const data = await response.json();
    console.log("contact data =", data);

    setFormData({
      ...initialForm,

      registered_office: {
        ...initialForm.registered_office,
        ...(data.registered_office || {}),
      },

      corporate_office: {
        ...initialForm.corporate_office,
        ...(data.corporate_office || {}),
      },

      email: data.email || "",
      phone: data.phone || "",

      statutory_info: {
        ...initialForm.statutory_info,
        ...(data.statutory_info || {}),
      },

      map_embed_url: data.map_embed_url || "",

      cta: {
        ...initialForm.cta,
        ...(data.cta || {}),
      },

      certifications: Array.isArray(data.certifications)
        ? [...data.certifications, "", "", ""].slice(0, 3)
        : ["", "", ""],
    });
  } catch (error) {
    console.error("Failed to load contact page:", error);
    setFormData(initialForm);
  } finally {
    console.log("loadContactPage finished");
    setLoading(false);
  }
};
  const handleTopLevelChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNestedChange = (section, field, value) => {const handleNestedChange = (section, field, value) => {
  setFormData((prev) => ({
    ...prev,
    [section]: {
      ...(prev[section] || {}),
      [field]: value,
    },
  }));
};};

  const handleCertificationChange = (index, value) => {
    setFormData((prev) => {
      const nextCertifications = [...prev.certifications];
      nextCertifications[index] = value;
      return {
        ...prev,
        certifications: nextCertifications,
      };
    });
  };

  const buildPayload = () => ({
    registered_office: {
      title: formData.registered_office.title.trim(),
      address_line_1: formData.registered_office.address_line_1.trim(),
      address_line_2: formData.registered_office.address_line_2.trim(),
      address_line_3: formData.registered_office.address_line_3.trim(),
    },
    corporate_office: {
      title: formData.corporate_office.title.trim(),
      address_line_1: formData.corporate_office.address_line_1.trim(),
      address_line_2: formData.corporate_office.address_line_2.trim(),
      address_line_3: formData.corporate_office.address_line_3.trim(),
    },
    email: formData.email.trim(),
    phone: formData.phone.trim(),
    statutory_info: {
      cin: formData.statutory_info.cin.trim(),
      gst_no: formData.statutory_info.gst_no.trim(),
      registration_no: formData.statutory_info.registration_no.trim(),
      roc: formData.statutory_info.roc.trim(),
    },
    map_embed_url: formData.map_embed_url.trim(),
    cta: {
      title: formData.cta.title.trim(),
      description: formData.cta.description.trim(),
      button_text: formData.cta.button_text.trim(),
    },
    certifications: formData.certifications
      .map((item) => item.trim())
      .filter(Boolean),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const payload = buildPayload();
      console.log("CONTACT PAYLOAD", payload);
      await apiClient.updateContactPage?.(payload);
      alert("Contact page updated successfully.");
      await loadContactPage();
    } catch (error) {
      console.error("Failed to update contact page:", error);
      alert("Failed to update contact page. Check console/API response.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-[#1f3d31]" />
          <p className="mt-4 text-sm text-gray-500">Loading contact page...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminTopbar
        title="Contact Page"
        subtitle="Manage contact information displayed on the website."
        rightContent={
          <button
            type="submit"
            form="contact-page-form"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f3d31] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#183126] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        }
      />

      <form id="contact-page-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="Registered Office"
            subtitle="Edit registered office details."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Office Title
              </label>
              <input
                type="text"
                value={formData.registered_office?.title || ""}
                onChange={(e) =>
                  handleNestedChange("registered_office", "title", e.target.value)
                }
                placeholder="Enter registered office title"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Address Line 1
              </label>
              <input
                type="text"
                value={formData.registered_office?.address_line_1 || ""}
                onChange={(e) =>
                  handleNestedChange(
                    "registered_office",
                    "address_line_1",
                    e.target.value
                  )
                }
                placeholder="Enter address line 1"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.registered_office?.address_line_2 || ""}
                onChange={(e) =>
                  handleNestedChange(
                    "registered_office",
                    "address_line_2",
                    e.target.value
                  )
                }
                placeholder="Enter address line 2"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Address Line 3
              </label>
              <input
                type="text"
                value={formData.registered_office?.address_line_3 || ""}
                onChange={(e) =>
                  handleNestedChange(
                    "registered_office",
                    "address_line_3",
                    e.target.value
                  )
                }
                placeholder="Enter address line 3"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="Corporate Office"
            subtitle="Edit corporate office details."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Office Title
              </label>
              <input
                type="text"
                value={formData.corporate_office?.title || ""}
                onChange={(e) =>
                  handleNestedChange("corporate_office", "title", e.target.value)
                }
                placeholder="Enter corporate office title"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Address Line 1
              </label>
              <input
                type="text"
                value={formData.corporate_office?.address_line_1 || ""}
                onChange={(e) =>
                  handleNestedChange(
                    "corporate_office",
                    "address_line_1",
                    e.target.value
                  )
                }
                placeholder="Enter address line 1"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.corporate_office?.address_line_2 || ""}
                onChange={(e) =>
                  handleNestedChange(
                    "corporate_office",
                    "address_line_2",
                    e.target.value
                  )
                }
                placeholder="Enter address line 2"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Address Line 3
              </label>
              <input
                type="text"
                value={formData.corporate_office?.address_line_3 || ""}
                onChange={(e) =>
                  handleNestedChange(
                    "corporate_office",
                    "address_line_3",
                    e.target.value
                  )
                }
                placeholder="Enter address line 3"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="Primary Contact"
            subtitle="Edit main email, phone, and map information."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Primary Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleTopLevelChange}
                placeholder="Enter primary email"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Primary Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ""}
                onChange={handleTopLevelChange}
                placeholder="Enter primary phone"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Map Embed URL
              </label>
              <textarea
                name="map_embed_url"
                value={formData.map_embed_url || ""}
                onChange={handleTopLevelChange}
                rows={4}
                placeholder="Paste map embed URL here"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="Statutory Information"
            subtitle="Edit CIN, GST, registration, and ROC details."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                CIN
              </label>
              <input
                type="text"
                value={formData.statutory_info?.cin || ""}
                onChange={(e) =>
                  handleNestedChange("statutory_info", "cin", e.target.value)
                }
                placeholder="Enter CIN"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                GST Number
              </label>
              <input
                type="text"
                value={formData.statutory_info?.gst_no || ""}
                onChange={(e) =>
                  handleNestedChange("statutory_info", "gst_no", e.target.value)
                }
                placeholder="Enter GST number"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Registration Number
              </label>
              <input
                type="text"
                value={formData.statutory_info?.registration_no || ""}
                onChange={(e) =>
                  handleNestedChange(
                    "statutory_info",
                    "registration_no",
                    e.target.value
                  )
                }
                placeholder="Enter registration number"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ROC
              </label>
              <input
                type="text"
                value={formData.statutory_info?.roc || ""}
                onChange={(e) =>
                  handleNestedChange("statutory_info", "roc", e.target.value)
                }
                placeholder="Enter ROC"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="Call To Action"
            subtitle="Edit CTA shown on the contact page."
          />

          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                CTA Title
              </label>
              <input
                type="text"
                value={formData.cta?.title || ""}
                onChange={(e) =>
                  handleNestedChange("cta", "title", e.target.value)
                }
                placeholder="Enter CTA title"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                CTA Description
              </label>
              <textarea
                value={formData.cta?.description || ""}
                onChange={(e) =>
                  handleNestedChange("cta", "description", e.target.value)
                }
                rows={4}
                placeholder="Enter CTA description"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Button Text
              </label>
              <input
                type="text"
                value={formData.cta?.button_text || ""}
                onChange={(e) =>
                  handleNestedChange("cta", "button_text", e.target.value)
                }
                placeholder="Enter CTA button text"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="Certifications"
            subtitle="Edit certification labels shown at the bottom of the contact page."
          />

          <div className="grid gap-5">
            {[0, 1, 2].map((index) => (
              <div key={index}>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Certification {index + 1}
                </label>
                <input
                  type="text"
                  value={formData.certifications[index] || ""}
                  onChange={(e) =>
                    handleCertificationChange(index, e.target.value)
                  }
                  placeholder={`Enter certification ${index + 1}`}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
                />
              </div>
            ))}
          </div>
        </div>
      </form>
    </AdminLayout>
  );

};

export default AdminContactPage;