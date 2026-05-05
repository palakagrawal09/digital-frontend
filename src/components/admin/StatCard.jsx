const StatCard = ({ title, value, icon: Icon, color = "bg-blue-500", onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          {Icon ? <Icon className="h-6 w-6 text-white" /> : null}
        </div>
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>

      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
    </button>
  );
};

export default StatCard;