import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, FolderTree, FileText, Upload, Image as ImageIcon } from "lucide-react";
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
  if (value.startsWith("/uploads/")) return `${API_BASE_URL}${value}`;
  if (value.startsWith("uploads/")) return `${API_BASE_URL}/${value}`;
  return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
};

const initialCategoryForm = {
  name: "",
  description: "",
  published: true,
};

const initialSectionForm = {
  title: "",
  category_id: "",
  designation: "",
  content: "",
  image_url: "",
  sort_order: 0,
  published: true,
};

const AdminAboutPage = () => {
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categorySearch, setCategorySearch] = useState("");
  const [sectionSearch, setSectionSearch] = useState("");

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState(initialCategoryForm);

  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [savingSection, setSavingSection] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sectionFormData, setSectionFormData] = useState(initialSectionForm);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const safeData = (response) => {
    if (!response) return [];
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [categoriesRes, sectionsRes] = await Promise.allSettled([
        apiClient.getAboutCategories?.(),
        apiClient.getAboutSections?.(),
      ]);

      setCategories(
        categoriesRes.status === "fulfilled" ? safeData(categoriesRes.value) : []
      );
      setSections(
        sectionsRes.status === "fulfilled" ? safeData(sectionsRes.value) : []
      );
    } catch (error) {
      console.error("Failed to load about data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getId = (item) => item.id || item._id;

  const getCategoryName = (item) => item.name || item.title || "-";

  const getCategoryDescription = (item) =>
    item.description || item.summary || "";

  const getCategoryPublished = (item) =>
    typeof item.published === "boolean"
      ? item.published
      : typeof item.is_active === "boolean"
      ? item.is_active
      : true;

  const getSectionTitle = (item) => item.title || item.name || "-";

  const getSectionContent = (item) =>
    item.content || item.description || item.body || "";

  const getSectionDesignation = (item) =>
    item.designation || item.role || "";

  const getSectionImage = (item) =>
    item.image_url || item.image || item.images?.[0] || "";

  const getSectionPublished = (item) =>
    typeof item.published === "boolean"
      ? item.published
      : typeof item.is_active === "boolean"
      ? item.is_active
      : true;

  const getSectionSortOrder = (item) =>
    typeof item.sort_order === "number"
      ? item.sort_order
      : typeof item.order === "number"
      ? item.order
      : 0;

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((category) => {
      map[getId(category)] = getCategoryName(category);
    });
    return map;
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const term = categorySearch.trim().toLowerCase();
    if (!term) return categories;

    return categories.filter((item) => {
      return (
        getCategoryName(item).toLowerCase().includes(term) ||
        getCategoryDescription(item).toLowerCase().includes(term)
      );
    });
  }, [categories, categorySearch]);

  const filteredSections = useMemo(() => {
    const term = sectionSearch.trim().toLowerCase();
    if (!term) return sections;

    return sections.filter((item) => {
      const categoryName = categoryMap[item.category_id] || "";
      return (
        getSectionTitle(item).toLowerCase().includes(term) ||
        getSectionContent(item).toLowerCase().includes(term) ||
        getSectionDesignation(item).toLowerCase().includes(term) ||
        categoryName.toLowerCase().includes(term)
      );
    });
  }, [sections, sectionSearch, categoryMap]);

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryFormData(initialCategoryForm);
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: getCategoryName(category),
      description: getCategoryDescription(category),
      published: getCategoryPublished(category),
    });
    setCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    if (savingCategory) return;
    setCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryFormData(initialCategoryForm);
  };

  const openAddSectionModal = () => {
    setEditingSection(null);
    setSectionFormData(initialSectionForm);
    setSectionModalOpen(true);
  };

  const openEditSectionModal = (section) => {
    setEditingSection(section);
    setSectionFormData({
      title: getSectionTitle(section),
      category_id: section.category_id || "",
      designation: getSectionDesignation(section),
      content: getSectionContent(section),
      image_url: getSectionImage(section),
      sort_order: getSectionSortOrder(section),
      published: getSectionPublished(section),
    });
    setSectionModalOpen(true);
  };

  const closeSectionModal = () => {
    if (savingSection) return;
    setSectionModalOpen(false);
    setEditingSection(null);
    setSectionFormData(initialSectionForm);
  };

  const handleCategoryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoryFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSectionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSectionFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "sort_order"
          ? Number(value)
          : value,
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
      setSectionFormData((prev) => ({ ...prev, image_url: uploadedPath }));
    } catch (error) {
      alert("Image upload failed. Please try again.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    if (!categoryFormData.name.trim()) {
      alert("Category name is required.");
      return;
    }

    try {
      setSavingCategory(true);

      const payload = {
        name: categoryFormData.name.trim(),
        description: categoryFormData.description.trim(),
        published: categoryFormData.published,
      };

      if (editingCategory) {
        await apiClient.updateAboutCategory?.(getId(editingCategory), payload);
      } else {
        await apiClient.createAboutCategory?.(payload);
      }

      closeCategoryModal();
      await loadData();
    } catch (error) {
      console.error("Failed to save about category:", error);
      alert("Failed to save about category. Check console/API response.");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();

    if (!sectionFormData.title.trim()) {
      alert("Section title is required.");
      return;
    }

    try {
      setSavingSection(true);

      const payload = {
        title: sectionFormData.title.trim(),
        category_id: sectionFormData.category_id || null,
        designation: sectionFormData.designation.trim(),
        content: sectionFormData.content.trim(),
        image_url: sectionFormData.image_url.trim(),
        sort_order: Number(sectionFormData.sort_order || 0),
        published: sectionFormData.published,
      };

      if (editingSection) {
        await apiClient.updateAboutSection?.(getId(editingSection), payload);
      } else {
        await apiClient.createAboutSection?.(payload);
      }

      closeSectionModal();
      await loadData();
    } catch (error) {
      console.error("Failed to save about section:", error);
      alert("Failed to save about section. Check console/API response.");
    } finally {
      setSavingSection(false);
    }
  };

  const openDeleteModal = (type, item) => {
    setDeleteType(type);
    setSelectedItem(item);
    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteType("");
    setSelectedItem(null);
    setDeleteOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedItem || !deleteType) return;

    try {
      setDeleting(true);

      if (deleteType === "category") {
        await apiClient.deleteAboutCategory?.(getId(selectedItem));
      } else if (deleteType === "section") {
        await apiClient.deleteAboutSection?.(getId(selectedItem));
      }

      closeDeleteModal();
      await loadData();
    } catch (error) {
      console.error(`Failed to delete about ${deleteType}:`, error);
      alert(`Failed to delete about ${deleteType}. Check console/API response.`);
    } finally {
      setDeleting(false);
    }
  };

  const categoryColumns = [
    {
      key: "name",
      title: "Category",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{getCategoryName(row)}</p>
          <p className="mt-1 max-w-[280px] truncate text-xs text-gray-500">
            {getCategoryDescription(row) || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (row) => (
        <StatusBadge
          status={getCategoryPublished(row) ? "active" : "inactive"}
        />
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openEditCategoryModal(row)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            type="button"
            onClick={() => openDeleteModal("category", row)}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  const sectionColumns = [
    {
      key: "title",
      title: "Section",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{getSectionTitle(row)}</p>
          {getSectionDesignation(row) ? (
            <p className="mt-1 text-xs font-medium text-[#b79149]">
              {getSectionDesignation(row)}
            </p>
          ) : null}
          <p className="mt-1 max-w-[320px] truncate text-xs text-gray-500">
            {getSectionContent(row) || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      title: "Category",
      render: (row) => categoryMap[row.category_id] || "-",
    },
    {
      key: "image",
      title: "Image",
      render: (row) => {
        const src = getSectionImage(row);
        return src ? (
          <img
            src={src}
            alt={getSectionTitle(row)}
            className="h-12 w-16 rounded-lg border border-gray-200 object-cover"
          />
        ) : (
          <span className="text-gray-400">No image</span>
        );
      },
    },
    {
      key: "sort_order",
      title: "Order",
      render: (row) => getSectionSortOrder(row),
    },
    {
      key: "status",
      title: "Status",
      render: (row) => (
        <StatusBadge status={getSectionPublished(row) ? "active" : "inactive"} />
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openEditSectionModal(row)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            type="button"
            onClick={() => openDeleteModal("section", row)}
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
        title="About Page"
        subtitle="Manage about categories and sections shown on the website."
      />

      <div className="space-y-8">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between rounded-xl bg-[#f7f8fa] px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1f3d31] text-white">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">About Categories</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {categories.length}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between rounded-xl bg-[#f7f8fa] px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c8a45d] text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">About Sections</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {sections.length}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="About Categories"
            subtitle="Create and manage the category groups for the about page."
            action={
              <button
                type="button"
                onClick={openAddCategoryModal}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1f3d31] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#183126]"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            }
          />

          <div className="mb-5">
            <input
              type="text"
              placeholder="Search categories by name or description..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <DataTable
            columns={categoryColumns}
            data={filteredCategories}
            loading={loading}
            emptyTitle="No about categories found"
            emptyDescription="Add your first about category to organize the about page."
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="About Sections"
            subtitle="Create and manage all content blocks for the about page."
            action={
              <button
                type="button"
                onClick={openAddSectionModal}
                className="inline-flex items-center gap-2 rounded-xl bg-[#c8a45d] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#b79149]"
              >
                <Plus className="h-4 w-4" />
                Add Section
              </button>
            }
          />

          <div className="mb-5">
            <input
              type="text"
              placeholder="Search sections by title, content, designation, or category..."
              value={sectionSearch}
              onChange={(e) => setSectionSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <DataTable
            columns={sectionColumns}
            data={filteredSections}
            loading={loading}
            emptyTitle="No about sections found"
            emptyDescription="Add your first about section to build the about page."
          />
        </div>
      </div>

      <FormModal
        open={categoryModalOpen}
        title={editingCategory ? "Edit About Category" : "Add About Category"}
        onClose={closeCategoryModal}
        onSubmit={handleCategorySubmit}
        submitText={editingCategory ? "Update Category" : "Create Category"}
        loading={savingCategory}
      >
        <div className="grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category Name
            </label>
            <input
              type="text"
              name="name"
              value={categoryFormData.name}
              onChange={handleCategoryChange}
              placeholder="Enter category name"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={categoryFormData.description}
              onChange={handleCategoryChange}
              rows={4}
              placeholder="Enter category description"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div>
            <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="published"
                checked={categoryFormData.published}
                onChange={handleCategoryChange}
                className="h-4 w-4 rounded border-gray-300 text-[#1f3d31] focus:ring-[#1f3d31]"
              />
              Published Category
            </label>
          </div>
        </div>
      </FormModal>

      <FormModal
        open={sectionModalOpen}
        title={editingSection ? "Edit About Section" : "Add About Section"}
        onClose={closeSectionModal}
        onSubmit={handleSectionSubmit}
        submitText={editingSection ? "Update Section" : "Create Section"}
        loading={savingSection}
        width="max-w-3xl"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Section Title
            </label>
            <input
              type="text"
              name="title"
              value={sectionFormData.title}
              onChange={handleSectionChange}
              placeholder="Enter section title"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category_id"
              value={sectionFormData.category_id}
              onChange={handleSectionChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={getId(category)} value={getId(category)}>
                  {getCategoryName(category)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Sort Order
            </label>
            <input
              type="number"
              name="sort_order"
              value={sectionFormData.sort_order}
              onChange={handleSectionChange}
              placeholder="Enter sort order"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Image / Photo
            </label>
            <input
              type="text"
              name="image_url"
              value={sectionFormData.image_url}
              onChange={handleSectionChange}
              placeholder="Enter image URL"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20 mb-2"
            />
            <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              <Upload className="h-4 w-4" />
              {uploadingImage ? "Uploading..." : "Upload Photo"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
            </label>
            {sectionFormData.image_url ? (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                <img src={resolveImageUrl(sectionFormData.image_url)} alt="Preview" className="h-16 w-16 rounded-full border border-gray-200 object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <span className="text-sm text-gray-500 break-all">{sectionFormData.image_url}</span>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                <ImageIcon className="h-4 w-4" /> No photo selected
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Designation
            </label>
            <input
              type="text"
              name="designation"
              value={sectionFormData.designation}
              onChange={handleSectionChange}
              placeholder="Enter designation, role, or position"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              name="content"
              value={sectionFormData.content}
              onChange={handleSectionChange}
              rows={8}
              placeholder="Enter section content"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="published"
                checked={sectionFormData.published}
                onChange={handleSectionChange}
                className="h-4 w-4 rounded border-gray-300 text-[#1f3d31] focus:ring-[#1f3d31]"
              />
              Published Section
            </label>
          </div>
        </div>
      </FormModal>

      <ConfirmDeleteModal
        open={deleteOpen}
        title={`Delete About ${deleteType === "category" ? "Category" : "Section"}`}
        message={`Are you sure you want to delete "${
          selectedItem
            ? deleteType === "category"
              ? getCategoryName(selectedItem)
              : getSectionTitle(selectedItem)
            : "this item"
        }"? This action cannot be undone.`}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </AdminLayout>
  );
};

export default AdminAboutPage;