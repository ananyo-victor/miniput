import React from "react";

const DeleteProductModal = ({ show, product, onConfirm, onCancel, isDeleting }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-xl font-black text-[#1a1a1a] mb-2">Delete Product</h2>
        <p className="text-sm text-[#666] mb-6">
          Are you sure you want to delete <span className="font-bold text-[#0E2A4A]">{product?.name}</span>?
          <br />
          <span className="text-xs text-[#999] mt-2 block">This action cannot be undone.</span>
        </p>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg bg-[#f0f0f0] px-4 py-2 text-sm font-bold text-[#555] hover:bg-[#e8e8e8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-[#D63031] px-4 py-2 text-sm font-bold text-white hover:bg-[#c61f1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "DELETING..." : "DELETE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;