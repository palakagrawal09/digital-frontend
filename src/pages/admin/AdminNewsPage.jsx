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

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
const resolveImageUrl = (path) => {
  if (!path) return "";
  const value = String(path).trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:") || value.startsWith("blob:")) return value;
  if (value.startsWith("/assets/")) return value;
  if (value.startsWith("/uploads/")) return `${API_BASE_URL}${value}`;
  if (value.startsWith("uploads/")) return `${API_BASE_URL}/${value}`;
  return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
};

const initialForm = {
  title: "",
  short_description: "",
  content: "",
  image_url: "",
  published: true,
};

const AdminNewsPage = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    loadNews();
  }, []);

  const safeData = (response) => {
    if (!response) return [];
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getNews?.(null);
      setNewsItems(safeData(response));
    } catch (error) {
      console.error("Failed to load news:", error);
    } finally {
      setLoading(false);
    }
  };

  const getId = (item) => item.id || item._id;

  const getTitle = (item) => item.title || item.name || item.headline || "-";

  const getShortDescription = (item) =>
    item.short_description || item.summary || item.excerpt || "";

  const getContent = (item) =>
    item.content || item.description || item.body || "";

  const getImage = (item) =>
    item.image_url ||
    item.image ||
    item.thumbnail ||
    item.images?.[0] ||
    "";

  const getPublished = (item) =>
    typeof item.published === "boolean"
      ? item.published
      : typeof item.is_active === "boolean"
      ? item.is_active
      : true;

  const getCreatedAt = (item) =>
    item.created_at || item.createdAt || item.date || item.published_at || "";

  const formatDate = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return value;
    }
  };

  const filteredNews = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return newsItems;

    return newsItems.filter((item) => {
      return (
        getTitle(item).toLowerCase().includes(term) ||
        getShortDescription(item).toLowerCase().includes(term) ||
        getContent(item).toLowerCase().includes(term)
      );
    });
  }, [newsItems, search]);

  const openAddModal = () => {
    setEditingNews(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingNews(item);
    setFormData({
      title: getTitle(item),
      short_description: getShortDescription(item),
      content: getContent(item),
      image_url: getImage(item),
      published: getPublished(item),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingNews(null);
    setFormData(initialForm);
  };

  const openDeleteModal = (item) => {
    setSelectedNews(item);
    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setSelectedNews(null);
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
    title: formData.title.trim(),
    short_description: formData.short_description.trim(),
    content: formData.content.trim(),
    image_url: formData.image_url.trim(),
    published: formData.published,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("News title is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();

      if (editingNews) {
        await apiClient.updateNews?.(getId(editingNews), payload);
      } else {
        await apiClient.createNews?.(payload);
      }

      closeModal();
      await loadNews();
    } catch (error) {
      console.error("Failed to save news item:", error);
      alert("Failed to save news item. Check console/API response.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNews) return;

    try {
      setDeleting(true);
      await apiClient.deleteNews?.(getId(selectedNews));
      closeDeleteModal();
      await loadNews();
    } catch (error) {
      console.error("Failed to delete news item:", error);
      alert("Failed to delete news item. Check console/API response.");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "title",
      title: "News",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{getTitle(row)}</p>
          <p className="mt-1 max-w-[280px] truncate text-xs text-gray-500">
            {getShortDescription(row) || getContent(row) || "-"}
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
            alt={getTitle(row)}
            className="h-12 w-16 rounded-lg border border-gray-200 object-cover"
          />
        ) : (
          <span className="text-gray-400">No image</span>
        );
      },
    },
    {
      key: "date",
      title: "Published Date",
      render: (row) => formatDate(getCreatedAt(row)),
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
        title="News & Media"
        subtitle="Manage news articles and media updates displayed on the website."
        rightContent={
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f3d31] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#183126]"
          >
            <Plus className="h-4 w-4" />
            Add News
          </button>
        }
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="News List"
            subtitle="Search, edit, and delete news records."
          />

          <div className="mb-5">
            <input
              type="text"
              placeholder="Search by title, summary, or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredNews}
            loading={loading}
            emptyTitle="No news found"
            emptyDescription="Add your first news article to start managing the news section."
          />
        </div>
      </div>

      <FormModal
        open={modalOpen}
        title={editingNews ? "Edit News" : "Add News"}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitText={editingNews ? "Update News" : "Create News"}
        loading={saving}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              News Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter news title"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Image
            </label>
            <input
              type="text"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="Enter image URL"
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
              Full Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={6}
              placeholder="Enter full news content"
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
              Published News
            </label>
          </div>
        </div>
      </FormModal>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete News"
        message={`Are you sure you want to delete "${
          selectedNews ? getTitle(selectedNews) : "this news item"
        }"? This action cannot be undone.`}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </AdminLayout>
  );
};

export default AdminNewsPage;