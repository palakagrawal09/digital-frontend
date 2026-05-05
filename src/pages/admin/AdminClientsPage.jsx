import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminTopbar from "@/components/admin/AdminTopbar";
import SectionHeader from "@/components/admin/SectionHeader";
import DataTable from "@/components/admin/DataTable";
import FormModal from "@/components/admin/FormModal";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import StatusBadge from "@/components/admin/StatusBadge";
import { apiClient } from "@/lib/api";

const API_BASE_URL = "http://127.0.0.1:8000";

const resolveImageUrl = (path) => {
  if (!path) return "";
  const value = String(path).trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:") || value.startsWith("blob:")) return value;
  if (value.startsWith("/assets/")) return value;
  if (value.startsWith("assets/")) return `/${value}`;
  if (value.startsWith("/uploads/")) return `${API_BASE_URL}${value}`;
  if (value.startsWith("uploads/")) return `${API_BASE_URL}/${value}`;
  return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
};

const initialForm = {
  name: "",
  short_description: "",
  description: "",
  image_url: "",
  website_url: "",
  published: true,
};

const AdminClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    loadClients();
  }, []);

  const safeData = (response) => {
    if (!response) return [];
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getClients?.(null);
      setClients(safeData(response));
    } catch (error) {
      console.error("Failed to load clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const getId = (item) => item.id || item._id;

  const getName = (item) => item.name || item.title || "-";

  const getShortDescription = (item) =>
    item.short_description || item.summary || "";

  const getDescription = (item) =>
    item.description || item.details || "";

  const getImage = (item) =>
    item.image_url ||
    item.logo ||
    item.image ||
    item.images?.[0] ||
    "";

  const getWebsite = (item) =>
    item.website_url || item.website || item.url || "";

  const getPublished = (item) =>
    typeof item.published === "boolean"
      ? item.published
      : typeof item.is_active === "boolean"
      ? item.is_active
      : true;

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;

    return clients.filter((item) => {
      return (
        getName(item).toLowerCase().includes(term) ||
        getShortDescription(item).toLowerCase().includes(term) ||
        getDescription(item).toLowerCase().includes(term) ||
        getWebsite(item).toLowerCase().includes(term)
      );
    });
  }, [clients, search]);

  const openAddModal = () => {
    setEditingClient(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: getName(client),
      short_description: getShortDescription(client),
      description: getDescription(client),
      image_url: getImage(client),
      website_url: getWebsite(client),
      published: getPublished(client),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingClient(null);
    setFormData(initialForm);
  };

  const openDeleteModal = (client) => {
    setSelectedClient(client);
    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setSelectedClient(null);
    setDeleteOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const response = await apiClient.uploadFile(file);
      const uploadedPath = response?.data?.url || response?.data?.file_url || response?.data?.path || "";
      if (!uploadedPath) throw new Error("No path returned");
      setFormData((prev) => ({ ...prev, image_url: uploadedPath }));
    } catch (error) {
      alert("Image upload failed. Please try again.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const buildPayload = () => ({
    name: formData.name.trim(),
    short_description: formData.short_description.trim(),
    description: formData.description.trim(),
    image_url: formData.image_url.trim(),
    website_url: formData.website_url.trim(),
    published: formData.published,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Client name is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();

      if (editingClient) {
        await apiClient.updateClient?.(getId(editingClient), payload);
      } else {
        await apiClient.createClient?.(payload);
      }

      closeModal();
      await loadClients();
    } catch (error) {
      console.error("Failed to save client:", error);
      alert("Failed to save client. Check console/API response.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;

    try {
      setDeleting(true);
      await apiClient.deleteClient?.(getId(selectedClient));
      closeDeleteModal();
      await loadClients();
    } catch (error) {
      console.error("Failed to delete client:", error);
      alert("Failed to delete client. Check console/API response.");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      title: "Client",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{getName(row)}</p>
          <p className="mt-1 max-w-[280px] truncate text-xs text-gray-500">
            {getShortDescription(row) || getDescription(row) || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "image",
      title: "Logo",
      render: (row) => {
        const src = getImage(row);

        return src ? (
          <img
            src={src}
            alt={getName(row)}
            className="h-12 w-16 rounded-lg border border-gray-200 object-cover bg-white"
          />
        ) : (
          <span className="text-gray-400">No image</span>
        );
      },
    },
    {
      key: "website",
      title: "Website",
      render: (row) => {
        const website = getWebsite(row);

        return website ? (
          <a
            href={website}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            {website}
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      key: "published",
      title: "Status",
      render: (row) => (
        <StatusBadge status={getPublished(row) ? "active" : "inactive"} />
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            type="button"
            onClick={() => openDeleteModal(row)}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <AdminTopbar
        title="Clients"
        subtitle="Manage client and partner entries shown on the website."
        rightContent={
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f3d31] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#183126]"
          >
            <Plus className="h-4 w-4" />
            Add Client
          </button>
        }
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="Clients List"
            subtitle="Search, edit, and delete client records."
          />

          <div className="mb-5">
            <input
              type="text"
              placeholder="Search by client name, description, or website..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredClients}
            loading={loading}
            emptyTitle="No clients found"
            emptyDescription="Add your first client to start managing the clients section."
          />
        </div>
      </div>

      <FormModal
        open={modalOpen}
        title={editingClient ? "Edit Client" : "Add Client"}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitText={editingClient ? "Update Client" : "Create Client"}
        loading={saving}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Client Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter client name"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Logo / Image
            </label>
            <input
              type="text"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="Enter logo or image URL"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20 mb-2"
            />
            <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              <Upload className="h-4 w-4" />
              {uploadingImage ? "Uploading..." : "Upload Image"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
            </label>
            {formData.image_url ? (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                <img src={resolveImageUrl(formData.image_url)} alt="Preview" className="h-16 w-20 rounded-lg border border-gray-200 object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <span className="text-sm text-gray-500 break-all">{formData.image_url}</span>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                <ImageIcon className="h-4 w-4" /> No image selected
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Website URL
            </label>
            <input
              type="text"
              name="website_url"
              value={formData.website_url}
              onChange={handleChange}
              placeholder="Enter website URL"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Short Description
            </label>
            <input
              type="text"
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              placeholder="Enter short description"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Full Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Enter full description"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-[#1f3d31] focus:ring-[#1f3d31]"
              />
              Published Client
            </label>
          </div>
        </div>
      </FormModal>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete Client"
        message={`Are you sure you want to delete "${
          selectedClient ? getName(selectedClient) : "this client"
        }"? This action cannot be undone.`}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </AdminLayout>
  );
};

export default AdminClientsPage;