import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";

const PHONE_REGEX = /^[6-9]\d{9}$/;

const FormField = ({ icon, label, required, optional, className, hasError, children, errorText }) => (
  <div
    className={`flex items-center gap-3 px-4 py-3 min-h-[60px] transition-colors 
    ${hasError ? "bg-[#FFF5F5] border-red-200" : "focus-within:bg-[#fffdf5]"} 
    ${className}`}
  >
    <div className="text-[20px] w-[28px] text-center shrink-0">{icon}</div>
    <div className="flex-1 py-1">
      <label
        className={`text-[9px] font-black tracking-[1.5px] uppercase mb-1 flex items-center gap-1 
        ${hasError ? "text-[#D63031]" : "text-[#888]"}`}
      >
        {label}
        {required && <span className="text-[#D63031]">*</span>}
        {optional && <span className="text-[8px] font-bold text-[#aaa] normal-case tracking-normal">(Optional)</span>}
      </label>
      {children}
      {errorText && <p className="text-[10px] font-bold text-[#D63031] mt-1">{errorText}</p>}
    </div>
  </div>
);

const OrderFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const cart = useSelector((state) => state.customer.cart);
  const directOrderItem = location.state?.directOrderItem;
  const isDirectOrder = Boolean(directOrderItem);
  const orderItems = isDirectOrder ? [directOrderItem] : cart;
  const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  const subtotal = orderItems.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1), 0);
  const [formData, setFormData] = useState({
    partyName: "",
    phone: "",
    address: "",
    transport: "",
    gst: "",
    agent: "",
    filledBy: "",
    remarks: "",
  });
  const [errors, setErrors] = useState({});

  const buildOrderMessage = () => {
    const itemLines = orderItems.map((item, index) => {
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.price || 0);
      const itemTotal = unitPrice * quantity;
      const sizes = Array.isArray(item.selectedSizes) && item.selectedSizes.length
        ? ` | Sizes: ${item.selectedSizes.join(", ")}`
        : "";
      return `${index + 1}. ${String(item.name || "PRODUCT")} - ${quantity} x INR ${unitPrice.toLocaleString()} = INR ${itemTotal.toLocaleString()}${sizes}`;
    });

    return [
      "Hello, please place this order:",
      "",
      `Party Name: ${formData.partyName || "-"}`,
      `Phone: ${formData.phone || "-"}`,
      `Address: ${formData.address || "-"}`,
      `Transport: ${formData.transport || "-"}`,
      `GST: ${formData.gst || "-"}`,
      `Agent: ${formData.agent || "-"}`,
      `Filled By: ${formData.filledBy || "-"}`,
      `Remarks: ${formData.remarks || "-"}`,
      "",
      "Order Items:",
      ...itemLines,
      "",
      `Total Order Value: INR ${subtotal.toLocaleString()}`,
    ].join("\n");
  };

  const sendOrderOnWhatsApp = () => {
    if (!whatsappNumber) return;
    const message = buildOrderMessage();
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleNext = () => {
    if (step === 1) {
      const newErrors = {};
      if (!formData.partyName.trim()) newErrors.partyName = "name is required";
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!PHONE_REGEX.test(formData.phone.trim())) {
        newErrors.phone = "Enter a valid 10-digit mobile number";
      }
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.filledBy.trim()) newErrors.filledBy = "Filled by is required";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    setErrors({});
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      sendOrderOnWhatsApp();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleHeaderBack = () => {
    if (isDirectOrder) {
      navigate(-1);
      return;
    }
    navigate("/cart");
  };

  const sanitizePhone = (value) => value.replace(/\D/g, "").slice(0, 10);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5] font-['Nunito',_sans-serif]">

      {/* HEADER (Sticky) */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#eee] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleHeaderBack}
                className="w-[36px] h-[36px] flex items-center justify-center rounded-full bg-[#f0f0f0] text-[#1a1a1a] hover:bg-[#e0e0e0] transition-colors font-bold"
              >
                ←
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl text-[#0E2A4A] tracking-[1.5px] font-['Bebas_Neue',_sans-serif] leading-none">
                  PLACE ORDER
                </h1>
                <p className="text-[9px] md:text-[11px] font-bold text-[#888] tracking-[1px] mt-1 uppercase">
                  BULK B2B SHOWROOM · MINIPUT × KWINK
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between max-w-md mx-auto">
            {/* Step 1 */}
            <div className={`flex flex-col items-center gap-1.5 ${step >= 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black tracking-[1px] transition-colors ${step >= 1 ? 'bg-[#0E2A4A] text-white' : 'bg-[#e0e0e0] text-[#666]'}`}>1</div>
              <span className={`text-[10px] font-black tracking-[1px] ${step >= 1 ? 'text-[#0E2A4A]' : 'text-[#888]'}`}>DETAILS</span>
            </div>
            <div className={`flex-1 h-[2px] mx-2 transition-colors ${step >= 2 ? 'bg-[#0E2A4A]' : 'bg-[#e0e0e0]'}`}></div>

            {/* Step 2 */}
            <div className={`flex flex-col items-center gap-1.5 ${step >= 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black tracking-[1px] transition-colors ${step >= 2 ? 'bg-[#0E2A4A] text-white' : 'bg-[#e0e0e0] text-[#666]'}`}>2</div>
              <span className={`text-[10px] font-black tracking-[1px] ${step >= 2 ? 'text-[#0E2A4A]' : 'text-[#888]'}`}>REVIEW</span>
            </div>
          </div>
        </div>
      </div>

      {/* BODY (Scrollable) */}
      <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 pb-40 lg:max-h-[calc(100vh-240px)] lg:overflow-y-auto">

        {/* ================= STEP 1: DETAILS ================= */}
        {step === 1 && (
          <div className="animate-[sfadeUp_0.3s_ease]">

            <h2 className="text-[11px] font-black tracking-[1.5px] text-[#888] uppercase mb-2 ml-1">Party Information</h2>
            <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-6 flex flex-col md:flex-row overflow-hidden border border-[#f0f0f0]">
              <FormField icon="🏢" label="NAME" required className="flex-1 border-b md:border-b-0 md:border-r border-[#f0f0f0]" hasError={Boolean(errors.partyName)} errorText={errors.partyName}>
                <input
                  type="text"
                  value={formData.partyName}
                  onChange={(e) => handleChange("partyName", e.target.value)}
                  className="w-full bg-transparent border-none text-[14px] md:text-[15px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                  placeholder="Business / Shop name"
                />
              </FormField>
              <FormField icon="📱" label="PHONE NUMBER" required className="flex-1" hasError={Boolean(errors.phone)} errorText={errors.phone}>
                <input
                  type="tel"
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[6-9]{1}[0-9]{9}"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", sanitizePhone(e.target.value))}
                  className="w-full bg-transparent border-none text-[14px] md:text-[15px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                  placeholder="10-digit mobile"
                />
              </FormField>
            </div>

            <h2 className="text-[11px] font-black tracking-[1.5px] text-[#888] uppercase mb-2 ml-1">Delivery</h2>
            <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-6 overflow-hidden border border-[#f0f0f0]">
              <FormField icon="📍" label="DELIVERY ADDRESS" required className="border-b border-[#f0f0f0]" hasError={Boolean(errors.address)} errorText={errors.address}>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full bg-transparent border-none text-[14px] md:text-[15px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                  placeholder="Full delivery address"
                />
              </FormField>
              <FormField icon="🚛" label="TRANSPORT / COURIER" optional>
                <input
                  type="text"
                  value={formData.transport}
                  onChange={(e) => handleChange("transport", e.target.value)}
                  className="w-full bg-transparent border-none text-[14px] md:text-[15px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                  placeholder="Preferred transport or courier"
                />
              </FormField>
            </div>

            <h2 className="text-[11px] font-black tracking-[1.5px] text-[#888] uppercase mb-2 ml-1">Tax & Agent</h2>
            <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-6 overflow-hidden border border-[#f0f0f0]">
              <div className="flex flex-col md:flex-row border-b border-[#f0f0f0]">
                <FormField icon="🧾" label="GST NUMBER" optional className="flex-1 border-b md:border-b-0 md:border-r border-[#f0f0f0]">
                  <input
                    type="text"
                    maxLength="15"
                    value={formData.gst}
                    onChange={(e) => handleChange("gst", e.target.value)}
                    className="w-full bg-transparent border-none text-[14px] md:text-[15px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc] uppercase"
                    placeholder="e.g. 23ABCDE1234F1Z5"
                  />
                </FormField>
                <FormField icon="👤" label="AGENT NAME" required className="flex-1">
                  <input
                    type="text"
                    value={formData.agent}
                    onChange={(e) => handleChange("agent", e.target.value)}
                    className="w-full bg-transparent border-none text-[14px] md:text-[15px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                    placeholder="Sales agent name"
                  />
                </FormField>
              </div>
              <FormField icon="✍️" label="FILLED BY" optional hasError={Boolean(errors.filledBy)} errorText={errors.filledBy}>
                <input
                  type="text"
                  value={formData.filledBy}
                  onChange={(e) => handleChange("filledBy", e.target.value)}
                  className="w-full bg-transparent border-none text-[14px] md:text-[15px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                  placeholder="Name of person filling form"
                />
              </FormField>
            </div>

            <h2 className="text-[11px] font-black tracking-[1.5px] text-[#888] uppercase mb-2 ml-1">Remarks</h2>
            <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-6 overflow-hidden border border-[#f0f0f0]">
              <FormField icon="📝" label="SPECIAL INSTRUCTIONS" optional>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => handleChange("remarks", e.target.value)}
                  className="w-full bg-transparent border-none text-[14px] md:text-[15px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                  placeholder="Any special instructions..."
                />
              </FormField>
            </div>
          </div>
        )}

        {/* ================= STEP 2: REVIEW ================= */}
        {step === 2 && (
          <div className="animate-[sfadeUp_0.3s_ease]">

            <h2 className="text-[11px] font-black tracking-[1.5px] text-[#888] uppercase mb-2 ml-1">Order Summary</h2>
            <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-6 border border-[#f0f0f0]">
              <div className="flex items-center justify-between p-4 border-b border-[#f0f0f0]">
                <span className="text-[13px] font-black tracking-[1px] text-[#0E2A4A]">ORDER ITEMS</span>
                <span className="bg-[#f5f5f5] text-[#555] px-3 py-1 rounded-full text-[11px] font-black">{orderItems.length} ITEM{orderItems.length !== 1 ? 'S' : ''}</span>
              </div>

              {/* Dynamic items from selected order flow */}
              <div className="p-4 space-y-3">
                {orderItems.map((item, index) => {
                  const quantity = Number(item.quantity || 1);
                  const itemTotal = Number(item.price || 0) * quantity;
                  return (
                    <div key={item.cartItemId || item.id || item._id || `${item.name}-${index}`} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-bold text-[#1a1a1a]">{String(item.name || 'PRODUCT').toUpperCase()}</p>
                        <div className="flex items-center gap-1 text-[11px] text-[#888]">
                          <span>{quantity} UNIT{quantity !== 1 ? 'S' : ''} ×</span>
                          {item.isDiscountActive && item.originalPrice > item.price ? (
                            <>
                              <span className="line-through text-[#bbb]">₹{Number(item.originalPrice).toLocaleString()}</span>
                              <span className="font-bold text-[#D63031]">₹{Number(item.price).toLocaleString()}</span>
                            </>
                          ) : (
                            <span>₹{Number(item.price || 0).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <p className="font-black">₹{itemTotal.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#0E2A4A] p-4 rounded-b-[16px] flex justify-between items-center text-white">
                <span className="text-[12px] font-black tracking-[1px]">TOTAL ORDER VALUE</span>
                <span className="text-[20px] font-black">₹{subtotal.toLocaleString()}</span>
              </div>
            </div>

            <h2 className="text-[11px] font-black tracking-[1.5px] text-[#888] uppercase mb-2 ml-1">Party Details</h2>
            <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 space-y-4 border border-[#f0f0f0] text-[13px]">
              <div className="flex justify-between border-b border-[#f9f9f9] pb-3">
                <span className="font-bold text-[#888]">Name</span>
                <span className="font-black text-[#1a1a1a] text-right">{formData.partyName || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-[#f9f9f9] pb-3">
                <span className="font-bold text-[#888]">Phone</span>
                <span className="font-black text-[#1a1a1a] text-right">{formData.phone || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-[#f9f9f9] pb-3">
                <span className="font-bold text-[#888]">Address</span>
                <span className="font-black text-[#1a1a1a] text-right">{formData.address || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-[#f9f9f9] pb-3">
                <span className="font-bold text-[#888]">Transport</span>
                <span className="font-black text-[#1a1a1a] text-right">{formData.transport || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-[#f9f9f9] pb-3">
                <span className="font-bold text-[#888]">GST No.</span>
                <span className="font-black text-[#1a1a1a] text-right uppercase">{formData.gst || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-[#f9f9f9] pb-3">
                <span className="font-bold text-[#888]">Agent</span>
                <span className="font-black text-[#1a1a1a] text-right">{formData.agent || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-[#888]">Filled By</span>
                <span className="font-black text-[#1a1a1a] text-right">{formData.filledBy || "—"}</span>
              </div>
              {formData.remarks && (
                <div className="flex justify-between border-t border-[#f0f0f0] pt-3 mt-1">
                  <span className="font-bold text-[#888]">Remarks</span>
                  <span className="font-black text-[#1a1a1a] text-right max-w-[60%]">{formData.remarks}</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* FOOTER (Sticky Bottom Actions) */}
      {step <= 2 && (
        <div className="sticky bottom-0 bg-white border-t border-[#eee] px-4 py-5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
          <div className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row gap-3">
            {step === 2 && (
              <button
                onClick={handleBack}
                className="w-full lg:flex-[1] bg-[#f0f0f0] text-[#555] rounded-[14px] py-4 text-[13px] font-extrabold hover:bg-[#e8e8e8] transition-colors"
              >
                ← BACK
              </button>
            )}
            <button
              onClick={handleNext}
              className={`w-full lg:flex-[2] text-white rounded-[14px] py-4 text-[14px] font-black tracking-[1px] transition-transform hover:scale-[1.01] ${step === 1 ? 'bg-[#0E2A4A] hover:bg-[#1a3d6e]' : 'bg-[#2d7d46] hover:bg-[#246638]'
                }`}
            >
              {step === 1 ? 'REVIEW ORDER →' : 'CONFIRM & SUBMIT ✅'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderFormPage;



