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
  if (value.startsWith("/uploads/")) return `${API_BASE_URL}${value}`;
  if (value.startsWith("uploads/")) return `${API_BASE_URL}/${value}`;
  return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
};

const initialForm = {
  name: "",
  designation: "",
  department: "",
  bio: "",
  image_url: "",
  email: "",
  phone: "",
  status: "active",
};

const AdminEmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    loadEmployees();
  }, []);

  const safeData = (response) => {
    if (!response) return [];
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getEmployees?.(null);
      setEmployees(safeData(response));
    } catch (error) {
      console.error("Failed to load employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const getId = (item) => item.id || item._id;

  const getName = (item) => item.name || item.full_name || "-";

  const getDesignation = (item) =>
    item.designation || item.role || item.position || "-";

  const getDepartment = (item) =>
    item.department || item.team || item.division || "-";

  const getBio = (item) =>
    item.bio || item.description || item.about || "";

  const getImage = (item) =>
    item.image_url ||
    item.photo ||
    item.image ||
    item.images?.[0] ||
    "";

  const getEmail = (item) =>
    item.email || item.email_address || "";

  const getPhone = (item) =>
    item.phone || item.mobile || item.contact_number || "";

  const getStatus = (item) =>
    item.status ||
    (typeof item.is_active === "boolean"
      ? item.is_active
        ? "active"
        : "inactive"
      : "active");

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return employees;

    return employees.filter((item) => {
      return (
        getName(item).toLowerCase().includes(term) ||
        getDesignation(item).toLowerCase().includes(term) ||
        getDepartment(item).toLowerCase().includes(term) ||
        getBio(item).toLowerCase().includes(term) ||
        getEmail(item).toLowerCase().includes(term)
      );
    });
  }, [employees, search]);

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: getName(employee),
      designation: getDesignation(employee),
      department: getDepartment(employee),
      bio: getBio(employee),
      image_url: getImage(employee),
      email: getEmail(employee),
      phone: getPhone(employee),
      status: getStatus(employee),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingEmployee(null);
    setFormData(initialForm);
  };

  const openDeleteModal = (employee) => {
    setSelectedEmployee(employee);
    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setSelectedEmployee(null);
    setDeleteOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    designation: formData.designation.trim(),
    department: formData.department.trim(),
    bio: formData.bio.trim(),
    image_url: formData.image_url.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim(),
    status: formData.status,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Employee name is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();

      if (editingEmployee) {
        await apiClient.updateEmployee?.(getId(editingEmployee), payload);
      } else {
        await apiClient.createEmployee?.(payload);
      }

      closeModal();
      await loadEmployees();
    } catch (error) {
      console.error("Failed to save employee:", error);
      alert("Failed to save employee. Check console/API response.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;

    try {
      setDeleting(true);
      await apiClient.deleteEmployee?.(getId(selectedEmployee));
      closeDeleteModal();
      await loadEmployees();
    } catch (error) {
      console.error("Failed to delete employee:", error);
      alert("Failed to delete employee. Check console/API response.");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "employee",
      title: "Employee",
      render: (row) => (
        <div className="flex items-center gap-3">
          {getImage(row) ? (
            <img
              src={getImage(row)}
              alt={getName(row)}
              className="h-12 w-12 rounded-full border border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
              {getName(row).charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <p className="font-semibold text-gray-900">{getName(row)}</p>
            <p className="mt-1 text-xs text-gray-500">{getDesignation(row)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      title: "Department",
      render: (row) => getDepartment(row),
    },
    {
      key: "email",
      title: "Email",
      render: (row) =>
        getEmail(row) ? (
          <span className="break-all text-sm text-gray-700">{getEmail(row)}</span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: "phone",
      title: "Phone",
      render: (row) => getPhone(row) || "-",
    },
    {
      key: "status",
      title: "Status",
      render: (row) => <StatusBadge status={getStatus(row)} />,
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
        title="Employees"
        subtitle="Manage employee and team member records shown on the website."
        rightContent={
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f3d31] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#183126]"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        }
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="Employees List"
            subtitle="Search, edit, and delete employee records."
          />

          <div className="mb-5">
            <input
              type="text"
              placeholder="Search by name, designation, department, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredEmployees}
            loading={loading}
            emptyTitle="No employees found"
            emptyDescription="Add your first employee to start managing the employees section."
          />
        </div>
      </div>

      <FormModal
        open={modalOpen}
        title={editingEmployee ? "Edit Employee" : "Add Employee"}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitText={editingEmployee ? "Update Employee" : "Create Employee"}
        loading={saving}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter employee name"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Designation
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="Enter designation"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Enter department"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Profile Image
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
              {uploadingImage ? "Uploading..." : "Upload Photo"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
            </label>
            {formData.image_url ? (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                <img src={resolveImageUrl(formData.image_url)} alt="Preview" className="h-16 w-16 rounded-full border border-gray-200 object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <span className="text-sm text-gray-500 break-all">{formData.image_url}</span>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                <ImageIcon className="h-4 w-4" /> No photo selected
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Bio / Description
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={5}
              placeholder="Enter employee bio"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </FormModal>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete Employee"
        message={`Are you sure you want to delete "${
          selectedEmployee ? getName(selectedEmployee) : "this employee"
        }"? This action cannot be undone.`}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </AdminLayout>
  );
};

export default AdminEmployeesPage;