const statusClassMap = {
  new: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-gray-100 text-gray-700",
  draft: "bg-purple-100 text-purple-700",
};

const StatusBadge = ({ status }) => {
  const normalized = (status || "pending").toString().toLowerCase();
  const classes = statusClassMap[normalized] || "bg-gray-100 text-gray-700";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${classes}`}>
      {status || "Pending"}
    </span>
  );
};

export default StatusBadge;