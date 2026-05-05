import { X } from "lucide-react";

const FormModal = ({
  open,
  title,
  onClose,
  children,
  onSubmit,
  submitText = "Save",
  loading = false,
  width = "max-w-2xl",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className={`w-full ${width} max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="max-h-[65vh] overflow-y-auto px-5 py-4">{children}</div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#1f3d31] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#183126] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;