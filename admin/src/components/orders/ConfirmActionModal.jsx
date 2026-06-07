import React from "react";

const confirmButtonStyles = {
    default: "bg-[#0E2A4A] hover:bg-[#1a3d6e]",
    accept: "bg-[#2d7d46] hover:bg-[#246339]",
    reject: "bg-[#D63031] hover:bg-[#c61f1f]",
};

const ConfirmActionModal = ({ show, title, message, confirmLabel = "CONFIRM", confirmVariant = "default", isProcessing = false, onConfirm, onCancel }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full mx-4">
                <h2 className="text-xl font-black text-[#1a1a1a] mb-2">{title}</h2>
                <p className="text-sm text-[#666] mb-6">{message}</p>

                <div className="flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="rounded-lg bg-[#f0f0f0] px-4 py-2 text-sm font-bold text-[#555] hover:bg-[#e8e8e8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        CANCEL
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className={`rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonStyles[confirmVariant] || confirmButtonStyles.default}`}
                    >
                        {isProcessing ? "PROCESSING..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmActionModal;
