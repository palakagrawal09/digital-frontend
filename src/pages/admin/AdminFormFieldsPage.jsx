import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminTopbar from "@/components/admin/AdminTopbar";
import SectionHeader from "@/components/admin/SectionHeader";
import { apiClient } from "@/lib/api";

const emptyForm = {
  form_type: "enquiry",
  section: "Main",
  label: "",
  field_key: "",
  field_type: "text",
  placeholder: "",
  required: true,
  options: [],
  sort_order: 0,
  active: true,
};

const AdminFormFieldsPage = () => {
  const [fields, setFields] = useState([]);
  const [formType, setFormType] = useState("enquiry");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadFields = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getFormFields(formType);
      setFields(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load form fields");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, [formType]);

  const resetForm = () => {
    setForm({ ...emptyForm, form_type: formType });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      form_type: formType,
      options:
        typeof form.options === "string"
          ? form.options.split(",").map((x) => x.trim()).filter(Boolean)
          : form.options,
      sort_order: Number(form.sort_order || 0),
      required: Boolean(form.required),
      active: Boolean(form.active),
    };

    try {
      if (editingId) {
        await apiClient.updateFormField(editingId, payload);
      } else {
        await apiClient.createFormField(payload);
      }

      resetForm();
      loadFields();
    } catch (err) {
      console.error(err);
      alert("Failed to save field");
    }
  };

  const handleEdit = (field) => {
    setEditingId(field.id);
    setForm({
      ...field,
      options: Array.isArray(field.options) ? field.options.join(", ") : "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this field?")) return;

    try {
      await apiClient.deleteFormField(id);
      loadFields();
    } catch (err) {
      console.error(err);
      alert("Failed to delete field");
    }
  };

  return (
    <AdminLayout>
      <AdminTopbar
        title="Form Fields"
        subtitle="Manage enquiry and repair form fields dynamically."
        rightContent={
          <button
            onClick={loadFields}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title={editingId ? "Edit Field" : "Add Field"}
            subtitle="Create or update form input fields."
          />

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setFormType("enquiry")}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium ${
                formType === "enquiry"
                  ? "bg-[#1f3d2b] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Enquiry
            </button>
            <button
              onClick={() => setFormType("repair")}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium ${
                formType === "repair"
                  ? "bg-[#1f3d2b] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Repair
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full rounded-xl border px-4 py-2 text-sm"
              placeholder="Section"
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
            />

            <input
              className="w-full rounded-xl border px-4 py-2 text-sm"
              placeholder="Label"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              required
            />

            <input
              className="w-full rounded-xl border px-4 py-2 text-sm"
              placeholder="Field key e.g. name, phone, subject"
              value={form.field_key}
              onChange={(e) => setForm({ ...form, field_key: e.target.value })}
              required
            />

            <select
              className="w-full rounded-xl border px-4 py-2 text-sm"
              value={form.field_type}
              onChange={(e) => setForm({ ...form, field_type: e.target.value })}
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="textarea">Textarea</option>
              <option value="select">Select</option>
              <option value="file">File</option>
            </select>

            <input
              className="w-full rounded-xl border px-4 py-2 text-sm"
              placeholder="Placeholder"
              value={form.placeholder}
              onChange={(e) =>
                setForm({ ...form, placeholder: e.target.value })
              }
            />

            <input
              className="w-full rounded-xl border px-4 py-2 text-sm"
              placeholder="Options comma separated, only for select"
              value={form.options}
              onChange={(e) => setForm({ ...form, options: e.target.value })}
            />

            <input
              type="number"
              className="w-full rounded-xl border px-4 py-2 text-sm"
              placeholder="Sort order"
              value={form.sort_order}
              onChange={(e) =>
                setForm({ ...form, sort_order: e.target.value })
              }
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.required}
                onChange={(e) =>
                  setForm({ ...form, required: e.target.checked })
                }
              />
              Required
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.checked })
                }
              />
              Active
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1f3d2b] px-4 py-2 text-sm font-medium text-white"
              >
                <Plus className="h-4 w-4" />
                {editingId ? "Update Field" : "Add Field"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title={`${formType === "enquiry" ? "Enquiry" : "Repair"} Fields`}
            subtitle="Fields currently configured for this form."
          />

          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : fields.length === 0 ? (
            <p className="text-sm text-gray-500">No fields added yet.</p>
          ) : (
            <div className="space-y-3">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-start justify-between rounded-xl border border-gray-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {field.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {field.field_key} · {field.field_type} · {field.section}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Required: {field.required ? "Yes" : "No"} · Active:{" "}
                      {field.active ? "Yes" : "No"} · Order:{" "}
                      {field.sort_order}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(field)}
                      className="rounded-lg border px-3 py-2 text-xs"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(field.id)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFormFieldsPage;