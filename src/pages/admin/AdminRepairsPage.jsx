import { useEffect, useMemo, useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminTopbar from "@/components/admin/AdminTopbar";
import SectionHeader from "@/components/admin/SectionHeader";
import DataTable from "@/components/admin/DataTable";
import FormModal from "@/components/admin/FormModal";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import EmptyState from "@/components/admin/EmptyState";
import StatusBadge from "@/components/admin/StatusBadge";
import { apiClient } from "@/lib/api";

const AdminRepairsPage = () => {
  const [repairs, setRepairs] = useState([]);
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [repairToDelete, setRepairToDelete] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const safeData = (response) => {
    if (!response) return [];
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      const [repairRes, fieldsRes] = await Promise.all([
        apiClient.getRepairs(),
        apiClient.getFormFields("repair"),
      ]);
      setRepairs(safeData(repairRes));
      setFormFields(safeData(fieldsRes));
    } catch (error) {
      console.error("Failed to load repairs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return value; }
  };

  // Get any field value from a row
  const getField = (row, fieldKey) => {
    if (row[fieldKey] !== undefined && row[fieldKey] !== null && row[fieldKey] !== "")
      return row[fieldKey];
    const aliases = {
      name: ["full_name", "contact_name"],
      email: ["email_address"],
      phone: ["mobile", "mobile_number", "contact_number"],
      organization: ["company", "company_name", "unit", "organisation"],
      product: ["product_name", "system_name", "equipment_name", "equipment_category", "product_interest"],
      issue: ["issue_description", "problem", "description", "fault_details", "equipment_issue"],
      serial: ["serial_number", "serial_no"],
      variant: ["equipment_variant"],
    };
    for (const alias of (aliases[fieldKey] || [])) {
      if (row[alias] !== undefined && row[alias] !== null && row[alias] !== "")
        return row[alias];
    }
    return "-";
  };

  const getName = (row) => getField(row, "name");
  const getEmail = (row) => getField(row, "email");
  const getPhone = (row) => getField(row, "phone");
  const getStatus = (row) => row.status || "Pending";
  const getCreatedAt = (row) => row.created_at || row.createdAt || row.submitted_at || "";
  const getImages = (row) => row.image_urls || row.images || [];

  const filteredRepairs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return repairs;
    return repairs.filter((row) =>
      Object.values(row).some((v) => String(v || "").toLowerCase().includes(term))
    );
  }, [repairs, search]);

  const openViewModal = (row) => { setSelectedRepair(row); setViewOpen(true); };
  const closeViewModal = () => { setSelectedRepair(null); setViewOpen(false); };
  const openDeleteModal = (row) => { setRepairToDelete(row); setDeleteOpen(true); };
  const closeDeleteModal = () => { if (deleting) return; setRepairToDelete(null); setDeleteOpen(false); };

  const handleDelete = async () => {
    if (!repairToDelete) return;
    const id = repairToDelete.id || repairToDelete._id;
    if (!id) return;
    try {
      setDeleting(true);
      await apiClient.deleteRepair(id);
      closeDeleteModal();
      await loadAll();
    } catch (error) {
      console.error("Failed to delete repair:", error);
      alert("Failed to delete repair.");
    } finally {
      setDeleting(false);
    }
  };

  // Fixed status update for repairs
  const updateStatus = async (row, status) => {
    const id = row.id || row._id;
    if (!id) return;
    try {
      await apiClient.updateRepairStatus(id, { status, admin_note: row.admin_note || "" });
      setRepairs((prev) =>
        prev.map((r) => (r.id === id || r._id === id ? { ...r, status } : r))
      );
    } catch (error) {
      console.error("Status update failed:", error);
      alert("Failed to update status");
    }
  };

  const fixedCols = ["name", "email", "phone"];

  // Dynamic columns from repair form fields
  const dynamicColumns = formFields
    .filter((f) => f.active && !fixedCols.includes(f.field_key))
    .slice(0, 4)
    .map((f) => ({
      key: f.field_key,
      title: f.label,
      render: (row) => (
        <p className="max-w-[200px] truncate text-sm text-gray-700">
          {getField(row, f.field_key)}
        </p>
      ),
    }));

  const columns = [
    {
      key: "name", title: "Name",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{getName(row)}</p>
          <p className="mt-1 text-xs text-gray-500">{getEmail(row)}</p>
        </div>
      ),
    },
    { key: "phone", title: "Phone", render: (row) => <span className="text-sm">{getPhone(row)}</span> },
    ...dynamicColumns,
    {
      key: "images", title: "Images",
      render: (row) => {
        const firstImage = getImages(row)?.[0];
        return firstImage ? (
          <img src={`${process.env.REACT_APP_BACKEND_URL}${firstImage}`} alt="Repair"
            className="h-12 w-16 rounded-lg border border-gray-200 object-cover" />
        ) : <span className="text-gray-400 text-sm">No image</span>;
      },
    },
    { key: "created_at", title: "Date", render: (row) => <span className="text-sm">{formatDate(getCreatedAt(row))}</span> },
    {
      key: "status", title: "Status",
      render: (row) => (
        <select value={getStatus(row)} onChange={(e) => updateStatus(row, e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="Pending">Pending</option>
          <option value="In Review">In Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Completed">Completed</option>
        </select>
      ),
    },
    {
      key: "actions", title: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => openViewModal(row)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50">
            <Eye className="h-3.5 w-3.5" /> View
          </button>
          <button type="button" onClick={() => openDeleteModal(row)}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      ),
    },
  ];

  // Modal: ALL fields dynamically from formFields
  const renderModalFields = (row) => {
    if (!row) return null;

    const alwaysFirst = ["name", "email", "phone"];
    const alwaysLast = ["created_at", "status"];

    const dynamicKeys = formFields
      .filter((f) => f.active && !alwaysFirst.includes(f.field_key) && !alwaysLast.includes(f.field_key))
      .map((f) => f.field_key);

    const orderedKeys = [...alwaysFirst, ...dynamicKeys, ...alwaysLast];

    const labelMap = {};
    formFields.forEach((f) => { labelMap[f.field_key] = f.label; });

    const defaultLabels = {
      name: "Full Name", email: "Email Address", phone: "Mobile Number",
      organization: "Organization / Unit", created_at: "Submitted On", status: "Status",
    };

    const longKeys = ["issue", "description", "details", "problem", "fault", "requirement"];

    return (
      <div className="grid gap-5 md:grid-cols-2">
        {orderedKeys.map((key) => {
          const label = labelMap[key] || defaultLabels[key] || key;
          let value = getField(row, key);
          if (key === "created_at") value = formatDate(getCreatedAt(row));

          if (key === "status") return (
            <div key={key}>
              <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                <StatusBadge status={getStatus(row)} />
              </div>
            </div>
          );

          const isLong = longKeys.some((k) => key.toLowerCase().includes(k));
          return (
            <div key={key} className={isLong ? "md:col-span-2" : ""}>
              <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
              <div className={`rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 break-all ${isLong ? "min-h-[100px] whitespace-pre-wrap" : ""}`}>
                {value}
              </div>
            </div>
          );
        })}

        {/* Images always at end */}
        {getImages(row).length > 0 && (
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Uploaded Images</label>
            <div className="flex flex-wrap gap-3">
              {getImages(row).map((img, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <img src={`${process.env.REACT_APP_BACKEND_URL}${img}`}
                    alt={`Upload ${index + 1}`}
                    className="h-24 w-24 rounded-lg border border-gray-200 object-cover" />
                  <a href={`${process.env.REACT_APP_BACKEND_URL}/api/uploads/download/${img.split("/").pop()}`}
                    target="_blank" rel="noreferrer"
                    className="rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-100">
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <AdminTopbar title="Repair Requests" subtitle="View all submitted repair and support requests."
        rightContent={
          <button type="button" onClick={loadAll}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            Refresh
          </button>
        }
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader title="Repair Requests Table" subtitle="Search and review service and maintenance requests." />
          <div className="mb-5">
            <input type="text"
              placeholder="Search by name, email, phone, company, product, or issue..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20" />
          </div>
          <DataTable columns={columns} data={filteredRepairs} loading={loading}
            emptyTitle="No repair requests found"
            emptyDescription="No repair submissions are available right now." />
        </div>

        {!loading && !filteredRepairs.length && repairs.length > 0 && (
          <EmptyState title="No matching repair requests"
            description="Try changing the search term to see more results." />
        )}
      </div>

      {/* View Modal - sirf Close button */}
      <FormModal open={viewOpen} title="Repair Request Details"
        onClose={closeViewModal} onSubmit={closeViewModal}
        submitText="Close" width="max-w-3xl">
        {renderModalFields(selectedRepair)}
      </FormModal>

      <ConfirmDeleteModal open={deleteOpen} title="Delete Repair Request"
        message={`Are you sure you want to delete repair request from "${repairToDelete ? getName(repairToDelete) : "this user"}"?`}
        onClose={closeDeleteModal} onConfirm={handleDelete} loading={deleting} />
    </AdminLayout>
  );
};

export default AdminRepairsPage;