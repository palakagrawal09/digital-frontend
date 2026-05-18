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

const AdminEnquiriesPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState(null);

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
      const [enqRes, fieldsRes] = await Promise.all([
        apiClient.getEnquiries(),
        apiClient.getFormFields("enquiry"),
      ]);
      setEnquiries(safeData(enqRes));
      setFormFields(safeData(fieldsRes));
    } catch (error) {
      console.error("Failed to load enquiries:", error);
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

  // Get any field value from a row — checks field_key directly first, then aliases
  const getField = (row, fieldKey) => {
    if (row[fieldKey] !== undefined && row[fieldKey] !== null && row[fieldKey] !== "")
      return row[fieldKey];
    const aliases = {
      name: ["full_name", "contact_name"],
      email: ["email_address"],
      phone: ["mobile", "mobile_number", "contact_number"],
      organization: ["company", "company_name", "unit", "organisation"],
      subject: ["topic", "service"],
      details: ["message", "requirement", "description", "detailed_requirements"],
      product: ["product_interest", "product_name", "service_interest", "product_service_interest"],
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

  const filteredEnquiries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return enquiries;
    return enquiries.filter((row) =>
      Object.values(row).some((v) => String(v || "").toLowerCase().includes(term))
    );
  }, [enquiries, search]);

  const openViewModal = (row) => { setSelectedEnquiry(row); setViewOpen(true); };
  const closeViewModal = () => { setSelectedEnquiry(null); setViewOpen(false); };
  const openDeleteModal = (row) => { setEnquiryToDelete(row); setDeleteOpen(true); };
  const closeDeleteModal = () => { if (deleting) return; setEnquiryToDelete(null); setDeleteOpen(false); };

  const handleDelete = async () => {
    if (!enquiryToDelete) return;
    const id = enquiryToDelete.id || enquiryToDelete._id;
    if (!id) return;
    try {
      setDeleting(true);
      await apiClient.deleteEnquiry(id);
      closeDeleteModal();
      await loadAll();
    } catch (error) {
      console.error("Failed to delete enquiry:", error);
      alert("Failed to delete enquiry.");
    } finally {
      setDeleting(false);
    }
  };

  const updateStatus = async (row, status) => {
    const id = row.id || row._id;
    if (!id) return;
    try {
      await apiClient.updateEnquiryStatus(id, { status, admin_note: row.admin_note || "" });
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id || e._id === id ? { ...e, status } : e))
      );
    } catch (error) {
      console.error("Status update failed:", error);
      alert("Failed to update status");
    }
  };

  // Table fixed columns: Name, Phone, then dynamic from formFields (skip name/email/phone), then Date, Status, Actions
  const fixedCols = ["name", "email", "phone"];

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
    { key: "created_at", title: "Date", render: (row) => <span className="text-sm">{formatDate(getCreatedAt(row))}</span> },
    {
      key: "status", title: "Status",
      render: (row) => (
        <select
          value={getStatus(row)}
          onChange={(e) => updateStatus(row, e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
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

  // Modal: show ALL fields dynamically from formFields, always add status + date
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

    const longKeys = ["details", "message", "requirement", "description", "detailed_requirements"];

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

          const isLong = longKeys.some((k) => key.includes(k));
          return (
            <div key={key} className={isLong ? "md:col-span-2" : ""}>
              <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
              <div className={`rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 break-all ${isLong ? "min-h-[100px] whitespace-pre-wrap" : ""}`}>
                {value}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <AdminLayout>
      <AdminTopbar
        title="Enquiries"
        subtitle="View all enquiry form submissions in one place."
        rightContent={
          <button type="button" onClick={loadAll}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            Refresh
          </button>
        }
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader title="Enquiries Table" subtitle="Search and review customer enquiries." />
          <div className="mb-5">
            <input type="text"
              placeholder="Search by name, email, company, phone, subject, or message..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20" />
          </div>
          <DataTable columns={columns} data={filteredEnquiries} loading={loading}
            emptyTitle="No enquiries found"
            emptyDescription="No enquiry submissions are available right now." />
        </div>

        {!loading && !filteredEnquiries.length && enquiries.length > 0 && (
          <EmptyState title="No matching enquiries"
            description="Try changing the search term to see more results." />
        )}
      </div>

      {/* View Modal - sirf Close button */}
      <FormModal open={viewOpen} title="Enquiry Details"
        onClose={closeViewModal} onSubmit={closeViewModal}
        submitText="Close" width="max-w-3xl">
        {renderModalFields(selectedEnquiry)}
      </FormModal>

      <ConfirmDeleteModal open={deleteOpen} title="Delete Enquiry"
        message={`Are you sure you want to delete enquiry from "${enquiryToDelete ? getName(enquiryToDelete) : "this user"}"?`}
        onClose={closeDeleteModal} onConfirm={handleDelete} loading={deleting} />
    </AdminLayout>
  );
};

export default AdminEnquiriesPage;