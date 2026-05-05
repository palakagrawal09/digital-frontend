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
  name: "",
  description: "",
  image_url: "",
  published: true,
};

const AdminProductCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    loadCategories();
  }, []);

  const safeData = (response) => {
    if (!response) return [];
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProductCategories?.();
      setCategories(safeData(response));
    } catch (error) {
      console.error("Failed to load product categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const getId = (item) => item.id || item._id;

  const getName = (item) => item.name || item.title || "-";

  const getDescription = (item) =>
    item.description || item.summary || "";

  const getImage = (item) =>
    item.image_url ||
    item.image ||
    item.images?.[0] ||
    "";

  const getPublished = (item) =>
    typeof item.published === "boolean"
      ? item.published
      : typeof item.is_active === "boolean"
      ? item.is_active
      : true;

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;

    return categories.filter((item) => {
      return (
        getName(item).toLowerCase().includes(term) ||
        getDescription(item).toLowerCase().includes(term)
      );
    });
  }, [categories, search]);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: getName(category),
      description: getDescription(category),
      image_url: getImage(category),
      published: getPublished(category),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingCategory(null);
    setFormData(initialForm);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setSelectedCategory(null);
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
    name: formData.name.trim(),
    description: formData.description.trim(),
    image_url: formData.image_url.trim(),
    published: formData.published,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();

      if (editingCategory) {
        await apiClient.updateProductCategory?.(getId(editingCategory), payload);
      } else {
        await apiClient.createProductCategory?.(payload);
      }

      closeModal();
      await loadCategories();
    } catch (error) {
      console.error("Failed to save product category:", error);
      alert("Failed to save product category. Check console/API response.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      setDeleting(true);
      await apiClient.deleteProductCategory?.(getId(selectedCategory));
      closeDeleteModal();
      await loadCategories();
    } catch (error) {
      console.error("Failed to delete product category:", error);
      alert("Failed to delete product category. Check console/API response.");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      title: "Category",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{getName(row)}</p>
          <p className="mt-1 max-w-[280px] truncate text-xs text-gray-500">
            {getDescription(row) || "-"}
          </p>
        </div>
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
            alt={getName(row)}
            className="h-12 w-16 rounded-lg border border-gray-200 object-cover"
          />
        ) : (
          <span className="text-gray-400">No image</span>
        );
      },
    },
    {
      key: "status",
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
        title="Product Categories"
        subtitle="Manage product categories used across the website."
        rightContent={
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f3d31] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#183126]"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        }
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="Categories List"
            subtitle="Search, edit, and delete product categories."
          />

          <div className="mb-5">
            <input
              type="text"
              placeholder="Search by category name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredCategories}
            loading={loading}
            emptyTitle="No product categories found"
            emptyDescription="Add your first category to start organizing products."
          />
        </div>
      </div>

      <FormModal
        open={modalOpen}
        title={editingCategory ? "Edit Product Category" : "Add Product Category"}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitText={editingCategory ? "Update Category" : "Create Category"}
        loading={saving}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter category name"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category Image URL
            </label>
            <input
              type="text"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="Enter category image URL"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Enter category description"
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
              Published Category
            </label>
          </div>
        </div>
      </FormModal>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete Product Category"
        message={`Are you sure you want to delete "${
          selectedCategory ? getName(selectedCategory) : "this category"
        }"? This action cannot be undone.`}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </AdminLayout>
  );
};

export default AdminProductCategoriesPage;