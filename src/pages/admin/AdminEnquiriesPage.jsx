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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState(null);

  useEffect(() => {
    loadEnquiries();
  }, []);

  const safeData = (response) => {
    if (!response) return [];
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getEnquiries();
      const data = safeData(response);
      setEnquiries(data);
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
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return value;
    }
  };

  const getStatus = (row) => {
    return row.status || (row.is_read ? "resolved" : "new");
  };

  const getName = (row) => {
    return row.name || row.full_name || row.contact_name || "-";
  };

  const getEmail = (row) => {
    return row.email || row.email_address || "-";
  };

  const getPhone = (row) => {
    return row.phone || row.mobile || row.contact_number || "-";
  };

  const getCompany = (row) => {
    return row.company || row.organization || row.company_name || "-";
  };

  const getSubject = (row) => {
    return row.subject || row.service || row.topic || "-";
  };

  const getMessage = (row) => {
    return row.message || row.requirement || row.description || "-";
  };

  const getCreatedAt = (row) => {
    return row.created_at || row.createdAt || row.submitted_at || row.date || "";
  };

  const filteredEnquiries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return enquiries;

    return enquiries.filter((row) => {
      return (
        getName(row).toLowerCase().includes(term) ||
        getEmail(row).toLowerCase().includes(term) ||
        getPhone(row).toLowerCase().includes(term) ||
        getCompany(row).toLowerCase().includes(term) ||
        getSubject(row).toLowerCase().includes(term) ||
        getMessage(row).toLowerCase().includes(term)
      );
    });
  }, [enquiries, search]);

  const openViewModal = (row) => {
    setSelectedEnquiry(row);
    setViewOpen(true);
  };

  const closeViewModal = () => {
    setSelectedEnquiry(null);
    setViewOpen(false);
  };

  const openDeleteModal = (row) => {
    setEnquiryToDelete(row);
    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setEnquiryToDelete(null);
    setDeleteOpen(false);
  };

  const handleDelete = async () => {
    if (!enquiryToDelete) return;

    const id = enquiryToDelete.id || enquiryToDelete._id;

    if (!id || !apiClient.deleteEnquiry) {
      alert("Delete enquiry API is not available yet.");
      return;
    }

    try {
      setDeleting(true);
      await apiClient.deleteEnquiry(id);
      closeDeleteModal();
      await loadEnquiries();
    } catch (error) {
      console.error("Failed to delete enquiry:", error);
      alert("Failed to delete enquiry. Check console/API.");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      title: "Name",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{getName(row)}</p>
          <p className="mt-1 text-xs text-gray-500">{getSubject(row)}</p>
        </div>
      ),
    },
    {
      key: "email",
      title: "Email",
      render: (row) => (
        <span className="break-all text-sm text-gray-700">{getEmail(row)}</span>
      ),
    },
    {
      key: "phone",
      title: "Phone",
      render: (row) => getPhone(row),
    },
    {
      key: "company",
      title: "Company",
      render: (row) => getCompany(row),
    },
    {
      key: "message",
      title: "Message",
      render: (row) => {
        const message = getMessage(row);
        return (
          <p className="max-w-[280px] truncate text-sm text-gray-700">
            {message}
          </p>
        );
      },
    },
    {
      key: "created_at",
      title: "Date",
      render: (row) => formatDate(getCreatedAt(row)),
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
            onClick={() => openViewModal(row)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Eye className="h-3.5 w-3.5" />
            View
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
        title="Enquiries"
        subtitle="View all enquiry form submissions in one place."
        rightContent={
          <button
            type="button"
            onClick={loadEnquiries}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Refresh
          </button>
        }
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="Enquiries Table"
            subtitle="Search and review customer enquiries."
          />

          <div className="mb-5">
            <input
              type="text"
              placeholder="Search by name, email, company, phone, subject, or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredEnquiries}
            loading={loading}
            emptyTitle="No enquiries found"
            emptyDescription="No enquiry submissions are available right now."
          />
        </div>

        {!loading && !filteredEnquiries.length && enquiries.length > 0 && (
          <EmptyState
            title="No matching enquiries"
            description="Try changing the search term to see more results."
          />
        )}
      </div>

      <FormModal
        open={viewOpen}
        title="Enquiry Details"
        onClose={closeViewModal}
        onSubmit={(e) => e.preventDefault()}
        submitText="Close"
        width="max-w-3xl"
      >
        {selectedEnquiry ? (
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                {getName(selectedEnquiry)}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 break-all">
                {getEmail(selectedEnquiry)}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                {getPhone(selectedEnquiry)}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Company
              </label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                {getCompany(selectedEnquiry)}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Subject
              </label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                {getSubject(selectedEnquiry)}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                <StatusBadge status={getStatus(selectedEnquiry)} />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Submitted On
              </label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                {formatDate(getCreatedAt(selectedEnquiry))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Message
              </label>
              <div className="min-h-[140px] whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                {getMessage(selectedEnquiry)}
              </div>
            </div>
          </div>
        ) : null}
      </FormModal>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete Enquiry"
        message={`Are you sure you want to delete enquiry from "${
          enquiryToDelete ? getName(enquiryToDelete) : "this user"
        }"?`}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </AdminLayout>
  );
};

export default AdminEnquiriesPage;