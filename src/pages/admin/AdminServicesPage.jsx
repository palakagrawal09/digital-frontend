import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminTopbar from "@/components/admin/AdminTopbar";
import SectionHeader from "@/components/admin/SectionHeader";
import DataTable from "@/components/admin/DataTable";
import FormModal from "@/components/admin/FormModal";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import StatusBadge from "@/components/admin/StatusBadge";
import { apiClient } from "@/lib/api";

const initialForm = {
  title: "",
  short_description: "",
  description: "",
  image_url: "",
  icon: "",
  published: true,
};

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    loadServices();
  }, []);

  const safeData = (response) => {
    if (!response) return [];
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getServices?.(null);
      setServices(safeData(response));
    } catch (error) {
      console.error("Failed to load services:", error);
    } finally {
      setLoading(false);
    }
  };

  const getId = (item) => item.id || item._id;

  const getTitle = (item) => item.title || item.name || "-";

  const getShortDescription = (item) =>
    item.short_description || item.summary || item.shortDesc || "";

  const getDescription = (item) =>
    item.description || item.details || "";

  const getImage = (item) =>
    item.image_url ||
    item.image ||
    item.images?.[0] ||
    "";

  const getIcon = (item) => item.icon || item.icon_name || "";

  const getPublished = (item) =>
    typeof item.published === "boolean"
      ? item.published
      : typeof item.is_active === "boolean"
      ? item.is_active
      : true;

  const filteredServices = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return services;

    return services.filter((item) => {
      return (
        getTitle(item).toLowerCase().includes(term) ||
        getShortDescription(item).toLowerCase().includes(term) ||
        getDescription(item).toLowerCase().includes(term) ||
        getIcon(item).toLowerCase().includes(term)
      );
    });
  }, [services, search]);

  const openAddModal = () => {
    setEditingService(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      title: getTitle(service),
      short_description: getShortDescription(service),
      description: getDescription(service),
      image_url: getImage(service),
      icon: getIcon(service),
      published: getPublished(service),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingService(null);
    setFormData(initialForm);
  };

  const openDeleteModal = (service) => {
    setSelectedService(service);
    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setSelectedService(null);
    setDeleteOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const buildPayload = () => ({
    title: formData.title.trim(),
    short_description: formData.short_description.trim(),
    description: formData.description.trim(),
    image_url: formData.image_url.trim(),
    icon: formData.icon.trim(),
    published: formData.published,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Service title is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();

      if (editingService) {
        await apiClient.updateService?.(getId(editingService), payload);
      } else {
        await apiClient.createService?.(payload);
      }

      closeModal();
      await loadServices();
    } catch (error) {
      console.error("Failed to save service:", error);
      alert("Failed to save service. Check console/API response.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;

    try {
      setDeleting(true);
      await apiClient.deleteService?.(getId(selectedService));
      closeDeleteModal();
      await loadServices();
    } catch (error) {
      console.error("Failed to delete service:", error);
      alert("Failed to delete service. Check console/API response.");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "title",
      title: "Service",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{getTitle(row)}</p>
          <p className="mt-1 max-w-[280px] truncate text-xs text-gray-500">
            {getShortDescription(row) || getDescription(row) || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "icon",
      title: "Icon",
      render: (row) => (
        <span className="text-sm text-gray-700">{getIcon(row) || "-"}</span>
      ),
    },
    {
      key: "image",
      title: "Image",
      render: (row) => {
        const src = getImage(row);

        return src ? (
          <img
            src={src}
            alt={getTitle(row)}
            className="h-12 w-16 rounded-lg border border-gray-200 object-cover"
          />
        ) : (
          <span className="text-gray-400">No image</span>
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
        title="Services"
        subtitle="Manage all services displayed on the website."
        rightContent={
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f3d31] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#183126]"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </button>
        }
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="Services List"
            subtitle="Search, edit, and delete service records."
          />

          <div className="mb-5">
            <input
              type="text"
              placeholder="Search by title, description, or icon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredServices}
            loading={loading}
            emptyTitle="No services found"
            emptyDescription="Add your first service to start managing the services section."
          />
        </div>
      </div>

      <FormModal
        open={modalOpen}
        title={editingService ? "Edit Service" : "Add Service"}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitText={editingService ? "Update Service" : "Create Service"}
        loading={saving}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Service Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter service title"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Icon Name
            </label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="Enter icon name"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="text"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="Enter image URL"
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
              Published Service
            </label>
          </div>
        </div>
      </FormModal>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete Service"
        message={`Are you sure you want to delete "${
          selectedService ? getTitle(selectedService) : "this service"
        }"? This action cannot be undone.`}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </AdminLayout>
  );
};

export default AdminServicesPage;