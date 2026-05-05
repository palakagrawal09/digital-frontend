import { useEffect, useMemo, useState } from "react";
import { Eye, Trash2, Wrench } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedRepair, setSelectedRepair] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [repairToDelete, setRepairToDelete] = useState(null);

  useEffect(() => {
    loadRepairs();
  }, []);

  const safeData = (response) => {
    if (!response) return [];
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  const loadRepairs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getRepairs();
      const data = safeData(response);
      setRepairs(data);
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
  const getImages = (row) => {
  return row.image_urls || row.images || [];
};

  const getStatus = (row) => {
    return row.status || row.repair_status || (row.is_read ? "resolved" : "pending");
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

  const getProduct = (row) => {
    return (
      row.product_name ||
      row.product ||
      row.system_name ||
      row.equipment_name ||
      "-"
    );
  };
const getIssue = (row) => {
  return (
    row.issue_description ||
    row.issue ||
    row.problem ||
    row.description ||
    row.fault_details ||
    "-"
  );
};
 
  const getCreatedAt = (row) => {
    return row.created_at || row.createdAt || row.submitted_at || row.date || "";
  };

  const filteredRepairs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return repairs;

    return repairs.filter((row) => {
      return (
        getName(row).toLowerCase().includes(term) ||
        getEmail(row).toLowerCase().includes(term) ||
        getPhone(row).toLowerCase().includes(term) ||
        getCompany(row).toLowerCase().includes(term) ||
        getProduct(row).toLowerCase().includes(term) ||
        getIssue(row).toLowerCase().includes(term)
      );
    });
  }, [repairs, search]);

  const openViewModal = (row) => {
    setSelectedRepair(row);
    setViewOpen(true);
  };

  const closeViewModal = () => {
    setSelectedRepair(null);
    setViewOpen(false);
  };

  const openDeleteModal = (row) => {
    setRepairToDelete(row);
    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setRepairToDelete(null);
    setDeleteOpen(false);
  };

  const handleDelete = async () => {
    if (!repairToDelete) return;

    const id = repairToDelete.id || repairToDelete._id;

    if (!id || !apiClient.deleteRepair) {
      alert("Delete repair API is not available yet.");
      return;
    }

    try {
      setDeleting(true);
      await apiClient.deleteRepair(id);
      closeDeleteModal();
      await loadRepairs();
    } catch (error) {
      console.error("Failed to delete repair:", error);
      alert("Failed to delete repair. Check console/API.");
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
          <p className="mt-1 text-xs text-gray-500">{getProduct(row)}</p>
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
      key: "issue",
      title: "Issue",
      render: (row) => {
        const issue = getIssue(row);
        return (
          <p className="max-w-[280px] truncate text-sm text-gray-700">
            {issue}
          </p>
        );
      },
    },
    {
  key: "images",
  title: "Images",
  render: (row) => {
    const images = getImages(row);
    const firstImage = images?.[0];

    return firstImage ? (
      <img
        src={`http://127.0.0.1:8000${firstImage}`}
        alt="Repair Upload"
        className="h-12 w-16 rounded-lg border border-gray-200 object-cover"
      />
    ) : (
      <span className="text-gray-400">No image</span>
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
        title="Repair Requests"
        subtitle="View all submitted repair and support requests."
        rightContent={
          <button
            type="button"
            onClick={loadRepairs}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Refresh
          </button>
        }
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="Repair Requests Table"
            subtitle="Search and review service and maintenance requests."
          />

          <div className="mb-5">
            <input
              type="text"
              placeholder="Search by name, email, phone, company, product, or issue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/20"
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredRepairs}
            loading={loading}
            emptyTitle="No repair requests found"
            emptyDescription="No repair submissions are available right now."
          />
        </div>

        {!loading && !filteredRepairs.length && repairs.length > 0 && (
          <EmptyState
            title="No matching repair requests"
            description="Try changing the search term to see more results."
          />
        )}
      </div>

      <FormModal
        open={viewOpen}
        title="Repair Request Details"
        onClose={closeViewModal}
        onSubmit={(e) => e.preventDefault()}
        submitText="Close"
        width="max-w-3xl"
      >
        {selectedRepair ? (
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                {getName(selectedRepair)}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="break-all rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                {getEmail(selectedRepair)}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                {getPhone(selectedRepair)}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Company
              </label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                {getCompany(selectedRepair)}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Product / System
              </label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                {getProduct(selectedRepair)}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                <StatusBadge status={getStatus(selectedRepair)} />
              </div>
            </div>
            <div className="md:col-span-2">
  <label className="mb-2 block text-sm font-medium text-gray-700">
    Uploaded Images
  </label>
  <div className="flex flex-wrap gap-3">
    {(selectedRepair?.image_urls || []).length > 0 ? (
      selectedRepair.image_urls.map((img, index) => (
        <img
          key={index}
          src={`http://127.0.0.1:8000${img}`}
          alt={`Repair Upload ${index + 1}`}
          className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
        />
      ))
    ) : (
      <span className="text-sm text-gray-400">No uploaded images</span>
    )}
  </div>
</div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Submitted On
              </label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                {formatDate(getCreatedAt(selectedRepair))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Issue Description
              </label>
              <div className="min-h-[140px] whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                {getIssue(selectedRepair)}
              </div>
            </div>
          </div>
          
        ) : null}
      </FormModal>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete Repair Request"
        message={`Are you sure you want to delete repair request from "${
          repairToDelete ? getName(repairToDelete) : "this user"
        }"?`}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </AdminLayout>
  );
};

export default AdminRepairsPage;