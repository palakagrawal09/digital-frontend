const AdminTopbar = ({ title, subtitle, rightContent }) => {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        ) : null}
      </div>

      {rightContent ? <div>{rightContent}</div> : null}
    </div>
  );
};

export default AdminTopbar;