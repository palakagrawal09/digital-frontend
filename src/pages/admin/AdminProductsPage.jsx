import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
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
  short_description: "",
  description: "",
  image_urls: [""],
  category_id: "",
  is_active: true,
};

const API_BASE_URL = "http://127.0.0.1:8000";

const resolveImageUrl = (path) => {
  if (!path) return "";

  const value = String(path).trim();
  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (value.startsWith("/assets/")) return value;
  if (value.startsWith("assets/")) return `/${value}`;

  if (value.startsWith("/uploads/")) return `${API_BASE_URL}${value}`;
  if (value.startsWith("uploads/")) return `${API_BASE_URL}/${value}`;

  if (value.startsWith("/static/")) return `${API_BASE_URL}${value}`;
  if (value.startsWith("static/")) return `${API_BASE_URL}/${value}`;

  if (!value.includes("/")) return `${API_BASE_URL}/uploads/${value}`;

  return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImageIndex, setUploadingImageIndex] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [formData, setFormData] = useState(initialForm);

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

      const [productsRes, categoriesRes] = await Promise.allSettled([
        apiClient.getProducts?.(),
        apiClient.getProductCategories?.(),
      ]);

      const productsData =
        productsRes.status === "fulfilled" ? safeData(productsRes.value) : [];
      const categoriesData =
        categoriesRes.status === "fulfilled" ? safeData(categoriesRes.value) : [];

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load products data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProductId = (item) => item.id || item._id;

  const getProductImageRaw = (item) =>
    Array.isArray(item.images) && item.images.length > 0
      ? item.images[0]
      : item.image_url || item.image || "";

  const getProductImage = (item) => resolveImageUrl(getProductImageRaw(item));

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat.id || cat._id] = cat.name || cat.title || "Unnamed Category";
    });
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return products;

    return products.filter((item) => {
      const name = String(item.name || "").toLowerCase();
      const shortDesc = String(item.specifications || "").toLowerCase();
      const desc = String(item.description || "").toLowerCase();
      const categoryName = String(
        categoryMap[item.category_id] || ""
      ).toLowerCase();

      return (
        name.includes(term) ||
        shortDesc.includes(term) ||
        desc.includes(term) ||
        categoryName.includes(term)
      );
    });
  }, [products, search, categoryMap]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    const imageList =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [getProductImageRaw(product)].filter(Boolean);

    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      short_description: product.specifications || "",
      description: product.description || "",
      image_urls: imageList.length > 0 ? imageList : [""],
      category_id: product.category_id || "",
      is_active:
        typeof product.published === "boolean" ? product.published : true,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving || uploadingImageIndex !== null) return;
    setModalOpen(false);
    setEditingProduct(null);
    setFormData(initialForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUrlChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...(prev.image_urls || [])];
      updated[index] = value;
      return {
        ...prev,
        image_urls: updated,
      };
    });
  };

  const addImageField = () => {
    setFormData((prev) => ({
      ...prev,
      image_urls: [...(prev.image_urls || []), ""],
    }));
  };

  const removeImageField = (index) => {
    setFormData((prev) => {
      const updated = [...(prev.image_urls || [])];
      updated.splice(index, 1);

      return {
        ...prev,
        image_urls: updated.length > 0 ? updated : [""],
      };
    });
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImageIndex(index);

      const response = await apiClient.uploadFile(file);

      const uploadedPath =
        response?.data?.file_url ||
        response?.data?.url ||
        response?.data?.path ||
        response?.data?.filename ||
        "";

      if (!uploadedPath) {
        throw new Error("Upload succeeded but no file path was returned.");
      }

      setFormData((prev) => {
        const updated = [...(prev.image_urls || [])];
        updated[index] = uploadedPath;

        return {
          ...prev,
          image_urls: updated,
        };
      });
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Check console/API response.");
    } finally {
      setUploadingImageIndex(null);
      e.target.value = "";
    }
  };

  const buildPayload = () => {
    return {
      name: (formData.name || "").trim(),
      category_id: (formData.category_id || "").trim(),
      description: (formData.description || "").trim(),
      specifications: (formData.short_description || "").trim(),
      images: (formData.image_urls || [])
        .map((img) => String(img || "").trim())
        .filter(Boolean),
      published: !!formData.is_active,
      sort_order: editingProduct?.sort_order ?? 0,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(formData.name || "").trim()) {
      alert("Product name is required.");
      return;
    }

    if (!(formData.category_id || "").trim()) {
      alert("Category is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();
      console.log("PRODUCT PAYLOAD", payload);

      if (editingProduct) {
        const id = getProductId(editingProduct);
        await apiClient.updateProduct?.(id, payload);
      } else {
        await apiClient.createProduct?.(payload);
      }

      closeModal();
      await loadData();
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product. Check console/API response.");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteOpen(false);
    setSelectedProduct(null);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      setDeleting(true);
      const id = getProductId(selectedProduct);
      await apiClient.deleteProduct?.(id);
      closeDeleteModal();
      await loadData();
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product. Check console/API response.");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      title: "Product",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.name || "-"}</p>
          <p className="mt-1 max-w-[280px] truncate text-xs text-gray-500">
            {row.specifications || row.description || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "category_id",
      title: "Category",
      render: (row) => categoryMap[row.category_id] || "-",
    },
    {
      key: "image",
      title: "Image",
      render: (row) => {
        const src = getProductImage(row);
        return src ? (
          <img
            src={src}
            alt={row.name || "Product"}
            className="h-12 w-16 rounded-lg object-cover border border-gray-200"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
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
        <StatusBadge status={row.published ? "active" : "inactive"} />
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
        title="Products"
        subtitle="Manage all product entries shown on the website."
        rightContent={
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f3d31] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#183126]"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        }
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="Products List"
            subtitle="Search, edit, and delete product records."
          />

          <div className="mb-5">
            <input
              type="text"
              placeholder="Search by name, description, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredProducts}
            loading={loading}
            emptyTitle="No products found"
            emptyDescription="Add your first product to start managing the products section."
          />
        </div>
      </div>

      <FormModal
        open={modalOpen}
        title={editingProduct ? "Edit Product" : "Add Product"}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitText={editingProduct ? "Update Product" : "Create Product"}
        loading={saving}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              placeholder="Enter product name"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category_id"
              value={formData.category_id || ""}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id || cat._id} value={cat.id || cat._id}>
                  {cat.name || cat.title || "Unnamed Category"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700 mt-8">
              <input
                type="checkbox"
                name="is_active"
                checked={!!formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-[#1f3d31] focus:ring-[#1f3d31]"
              />
              Active Product
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Product Images
            </label>

            <div className="space-y-4">
              {(formData.image_urls || []).map((img, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-200 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-700">
                      Image {index + 1}
                    </p>

                    {(formData.image_urls || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={img || ""}
                    onChange={(e) =>
                      handleImageUrlChange(index, e.target.value)
                    }
                    placeholder="Enter image URL or upload below"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
                  />

                  <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                    <Upload className="h-4 w-4" />
                    {uploadingImageIndex === index
                      ? "Uploading..."
                      : "Choose Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, index)}
                      className="hidden"
                      disabled={uploadingImageIndex !== null}
                    />
                  </label>

                  {img ? (
                    <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-3">
                      <img
                        src={resolveImageUrl(img)}
                        alt={`Product preview ${index + 1}`}
                        className="h-20 w-28 rounded-lg border border-gray-200 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="text-sm text-gray-600 break-all">
                        {img}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <ImageIcon className="h-4 w-4" />
                      No image selected
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addImageField}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                Add Another Image
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Short Description / Specifications
            </label>
            <input
              type="text"
              name="short_description"
              value={formData.short_description || ""}
              onChange={handleChange}
              placeholder="Enter short description or specifications"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Full Description
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={5}
              placeholder="Enter full description"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>
        </div>
      </FormModal>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${
          selectedProduct?.name || "this product"
        }"? This action cannot be undone.`}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </AdminLayout>
  );
};

export default AdminProductsPage;