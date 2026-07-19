import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchAboutThunk } from "../store/aboutSlice";
import { fetchDefaultBusinessThunk } from "../store/businessSlice";
import { clearCart } from "../store/cartSlice";

const PHONE_REGEX = /^[6-9]\d{9}$/;

// Slimmed down FormField
const FormField = ({ icon, label, required, optional, className, hasError, children, errorText }) => (
  <div
    className={`flex items-center gap-3 px-4 py-2 min-h-[54px] transition-colors 
    ${hasError ? "bg-[#FFF5F5] border-red-200" : "focus-within:bg-[#fffdf5]"} 
    ${className}`}
  >
    <div className="text-[18px] w-[24px] text-center shrink-0">{icon}</div>
    <div className="flex-1 py-1 min-w-0">
      <label
        className={`text-[9px] font-black tracking-[1.5px] uppercase flex items-center gap-1 
        ${hasError ? "text-[#D63031]" : "text-[#888]"}`}
      >
        {label}
        {required && <span className="text-[#D63031]">*</span>}
        {optional && <span className="text-[8px] font-bold text-[#aaa] normal-case tracking-normal">(Optional)</span>}
      </label>
      <div className="mt-0.5">{children}</div>
      {errorText && <p className="text-[10px] font-bold text-[#D63031] mt-0.5">{errorText}</p>}
    </div>
  </div>
);

const OrderFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [showWhatsAppRedirect, setShowWhatsAppRedirect] = useState(false);
  const cart = useSelector((state) => state.cart.items);
  const { about } = useSelector((state) => state.about);
  const { id: userId } = useSelector((state) => state.user.profile);
  const defaultBusiness = useSelector((state) => state.business.defaultBusiness);
  const directOrderItem = location.state?.directOrderItem;
  const isDirectOrder = Boolean(directOrderItem);
  const orderItems = isDirectOrder ? [directOrderItem] : cart;
  const subtotal = orderItems.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1), 0);

  const getProductImage = (item) => {
    if (Array.isArray(item.imageUrls) && item.imageUrls.length) {
      return item.imageUrls[0];
    }
    return item.imageUrl || item.image || "https://via.placeholder.com/140?text=Item";
  };

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
      const sizes = Array.isArray(item.selectedSizes) && item.selectedSizes.length
        ? ` | Sizes: ${item.selectedSizes.join(", ")}`
        : "";
      const articleId = item.articleId ? ` [${item.articleId}]` : "";
      return `${index + 1}. ${String(item.name || "PRODUCT")}${articleId} - Qty: ${quantity}${sizes}`;
    });

    return [
      "Hello, please place this order:",
      "",
      `User ID: ${userId || "-"}`,
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
    ].join("\n");
  };

  useEffect(() => {
    dispatch(fetchAboutThunk());
    if (userId) dispatch(fetchDefaultBusinessThunk(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    if (!defaultBusiness) return;
    setFormData((prev) => ({
      partyName: defaultBusiness.businessName || prev.partyName,
      phone: defaultBusiness.businessPhone || prev.phone,
      address: defaultBusiness.deliveryAddress || prev.address,
      transport: defaultBusiness.transportCourier || prev.transport,
      gst: defaultBusiness.gstNumber || prev.gst,
      agent: defaultBusiness.agentName || prev.agent,
      filledBy: defaultBusiness.filledBy || prev.filledBy,
      remarks: defaultBusiness.specialInstructions || prev.remarks,
    }));
  }, [defaultBusiness]);

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;

  const sendOrderOnWhatsApp = () => {
    if (!whatsappNumber) return;
    const message = buildOrderMessage();
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    if (!isDirectOrder) {
      dispatch(clearCart());
    }
    setShowWhatsAppRedirect(true);
  };

  const handleRedirectDone = () => {
    setShowWhatsAppRedirect(false);
    navigate("/home");
  };

  const handleNext = () => {
    if (step === 1) {
      const newErrors = {};
      if (!formData.partyName.trim()) newErrors.partyName = "Name is required";
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!PHONE_REGEX.test(formData.phone.trim())) {
        newErrors.phone = "Enter a valid 10-digit mobile number";
      }
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.agent.trim()) newErrors.agent = "Agent name is required";

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

      {/* HEADER (Slimmer) */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#eee] shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleHeaderBack}
                className="w-[32px] h-[32px] flex items-center justify-center rounded-full bg-[#f0f0f0] text-[#1a1a1a] hover:bg-[#e0e0e0] transition-colors font-bold"
              >
                ←
              </button>
              <div>
                <h1 className="text-xl md:text-2xl text-[#0E2A4A] tracking-[1.5px] font-['Bebas_Neue',_sans-serif] leading-none">
                  PLACE ORDER
                </h1>
                <p className="text-[9px] md:text-[10px] font-bold text-[#888] tracking-[1px] mt-0.5 uppercase">
                  BULK B2B SHOWROOM · MINIPUT × KWINK
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BODY (Removed internal scrolling, allowed natural page scroll) */}
      <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col md:flex-row relative">

        {/* LEFT SIDEBAR (Progress) */}
        <div className="hidden md:flex w-20 lg:w-28 flex-col items-center shrink-0 pt-6 lg:pt-8">
          <div className="sticky top-28 flex flex-col items-center">

            {/* Step 1 */}
            <div className={`flex flex-col items-center gap-1.5 transition-opacity ${step >= 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-black tracking-[1px] transition-all ${step >= 1 ? 'bg-[#0E2A4A] text-white shadow-md scale-110' : 'bg-[#e0e0e0] text-[#666]'}`}>1</div>
              <span className={`text-[9px] font-black tracking-[1px] mt-1 ${step >= 1 ? 'text-[#0E2A4A]' : 'text-[#888]'}`}>DETAILS</span>
            </div>

            <div className={`w-[2px] h-12 mx-auto my-2 transition-colors ${step >= 2 ? 'bg-[#0E2A4A]' : 'bg-[#e0e0e0]'}`}></div>

            {/* Step 2 */}
            <div className={`flex flex-col items-center gap-1.5 transition-opacity ${step >= 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-black tracking-[1px] transition-all ${step >= 2 ? 'bg-[#0E2A4A] text-white shadow-md scale-110' : 'bg-[#e0e0e0] text-[#666]'}`}>2</div>
              <span className={`text-[9px] font-black tracking-[1px] mt-1 ${step >= 2 ? 'text-[#0E2A4A]' : 'text-[#888]'}`}>REVIEW</span>
            </div>
          </div>
        </div>

        {/* FORM CONTENT (Right Side) */}
        <div className="flex-1 w-full p-4 md:p-6 lg:p-8 pb-10 lg:pr-8">

          {/* Mobile Progress Bar */}
          <div className="md:hidden flex items-center justify-center max-w-xs mx-auto mb-6 mt-2">
            <div className={`flex flex-col items-center gap-1.5 ${step >= 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black tracking-[1px] transition-colors ${step >= 1 ? 'bg-[#0E2A4A] text-white' : 'bg-[#e0e0e0] text-[#666]'}`}>1</div>
              <span className={`text-[10px] font-black tracking-[1px] ${step >= 1 ? 'text-[#0E2A4A]' : 'text-[#888]'}`}>DETAILS</span>
            </div>
            <div className={`flex-1 h-[2px] mx-2 transition-colors ${step >= 2 ? 'bg-[#0E2A4A]' : 'bg-[#e0e0e0]'}`}></div>
            <div className={`flex flex-col items-center gap-1.5 ${step >= 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black tracking-[1px] transition-colors ${step >= 2 ? 'bg-[#0E2A4A] text-white' : 'bg-[#e0e0e0] text-[#666]'}`}>2</div>
              <span className={`text-[10px] font-black tracking-[1px] ${step >= 2 ? 'text-[#0E2A4A]' : 'text-[#888]'}`}>REVIEW</span>
            </div>
          </div>

          {/* ================= STEP 1: DETAILS ================= */}
          {step === 1 && (
            <div className="animate-[sfadeUp_0.3s_ease]">

              <h2 className="text-[10px] font-black tracking-[1.5px] text-[#888] uppercase mb-1.5 ml-1">Party Information</h2>
              <div className="bg-white rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-5 flex flex-col md:flex-row overflow-hidden border border-[#f0f0f0]">
                <FormField icon="🏢" label="NAME" required className="flex-1 border-b md:border-b-0 md:border-r border-[#f0f0f0]" hasError={Boolean(errors.partyName)} errorText={errors.partyName}>
                  <input
                    type="text"
                    value={formData.partyName}
                    onChange={(e) => handleChange("partyName", e.target.value)}
                    className="w-full bg-transparent border-none text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
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
                    className="w-full bg-transparent border-none text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                    placeholder="10-digit mobile"
                  />
                </FormField>
              </div>

              <h2 className="text-[10px] font-black tracking-[1.5px] text-[#888] uppercase mb-1.5 ml-1">Delivery</h2>
              <div className="bg-white rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-5 overflow-hidden border border-[#f0f0f0]">
                <FormField icon="📍" label="DELIVERY ADDRESS" required className="border-b border-[#f0f0f0]" hasError={Boolean(errors.address)} errorText={errors.address}>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="w-full bg-transparent border-none text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                    placeholder="Full delivery address"
                  />
                </FormField>
                <FormField icon="🚛" label="TRANSPORT / COURIER" optional>
                  <input
                    type="text"
                    value={formData.transport}
                    onChange={(e) => handleChange("transport", e.target.value)}
                    className="w-full bg-transparent border-none text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                    placeholder="Preferred transport or courier"
                  />
                </FormField>
              </div>

              <h2 className="text-[10px] font-black tracking-[1.5px] text-[#888] uppercase mb-1.5 ml-1">Tax & Agent</h2>
              <div className="bg-white rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-5 overflow-hidden border border-[#f0f0f0]">
                <div className="flex flex-col md:flex-row border-b border-[#f0f0f0]">
                  <FormField icon="🧾" label="GST NUMBER" optional className="flex-1 border-b md:border-b-0 md:border-r border-[#f0f0f0]">
                    <input
                      type="text"
                      maxLength="15"
                      value={formData.gst}
                      onChange={(e) => handleChange("gst", e.target.value)}
                      className="w-full bg-transparent border-none text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc] uppercase"
                      placeholder="e.g. 23ABCDE1234F1Z5"
                    />
                  </FormField>
                  <FormField icon="👤" label="AGENT NAME" required className="flex-1" hasError={Boolean(errors.agent)} errorText={errors.agent}>
                    <input
                      type="text"
                      value={formData.agent}
                      onChange={(e) => handleChange("agent", e.target.value)}
                      className="w-full bg-transparent border-none text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                      placeholder="Sales agent name"
                    />
                  </FormField>
                </div>
                <FormField icon="✍️" label="FILLED BY" optional hasError={Boolean(errors.filledBy)} errorText={errors.filledBy}>
                  <input
                    type="text"
                    value={formData.filledBy}
                    onChange={(e) => handleChange("filledBy", e.target.value)}
                    className="w-full bg-transparent border-none text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                    placeholder="Name of person filling form"
                  />
                </FormField>
              </div>

              <h2 className="text-[10px] font-black tracking-[1.5px] text-[#888] uppercase mb-1.5 ml-1">Remarks</h2>
              <div className="bg-white rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden border border-[#f0f0f0]">
                <FormField icon="📝" label="SPECIAL INSTRUCTIONS" optional>
                  <input
                    type="text"
                    value={formData.remarks}
                    onChange={(e) => handleChange("remarks", e.target.value)}
                    className="w-full bg-transparent border-none text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                    placeholder="Any special instructions..."
                  />
                </FormField>
              </div>

              {/* Step 1 Action Button */}
              <div className="mt-8 mb-4">
                <button
                  onClick={handleNext}
                  className="w-full text-white bg-[#0E2A4A] hover:bg-[#1a3d6e] rounded-[14px] py-4 text-[14px] font-black tracking-[1px] transition-transform hover:scale-[1.01] shadow-md"
                >
                  REVIEW ORDER →
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: REVIEW ================= */}
          {step === 2 && (
            <div className="animate-[sfadeUp_0.3s_ease]">

              <h2 className="text-[11px] font-black tracking-[1.5px] text-[#888] uppercase mb-2 ml-1">Order Summary</h2>
              <div className="bg-white rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-5 border border-[#f0f0f0]">
                <div className="flex items-center justify-between p-3.5 border-b border-[#f0f0f0]">
                  <span className="text-[12px] font-black tracking-[1px] text-[#0E2A4A]">ORDER ITEMS</span>
                  <span className="bg-[#f5f5f5] text-[#555] px-2.5 py-0.5 rounded-full text-[10px] font-black">{orderItems.length} ITEM{orderItems.length !== 1 ? 'S' : ''}</span>
                </div>

                <div className="p-3.5 space-y-2">
                  {orderItems.map((item, index) => {
                    const quantity = Number(item.quantity || 1);
                    const itemTotal = Number(item.price || 0) * quantity;
                    return (
                      <div
                        key={item.cartItemId || item.id || item._id || `${item.name}-${index}`}
                        className="flex justify-between items-center gap-2.5 text-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={getProductImage(item)}
                            alt={item.name || "Product"}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover bg-[#f5f5f5] border border-[#f0f0f0] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-[13px] text-[#1a1a1a] truncate">{String(item.name || 'PRODUCT').toUpperCase()}</p>
                            <div className="flex items-center gap-1 text-[10px] text-[#888] flex-wrap mt-0.5">
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
                        </div>
                        <p className="font-black text-[13px] shrink-0">₹{itemTotal.toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-[#0E2A4A] p-3.5 rounded-b-[14px] flex justify-between items-center text-white">
                  <span className="text-[11px] font-black tracking-[1px]">TOTAL ORDER VALUE</span>
                  <span className="text-[18px] font-black">₹{subtotal.toLocaleString()}</span>
                </div>
              </div>

              <h2 className="text-[11px] font-black tracking-[1.5px] text-[#888] uppercase mb-2 ml-1">Party Details</h2>
              <div className="bg-white rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 space-y-3 border border-[#f0f0f0] text-[13px]">
                <div className="flex justify-between border-b border-[#f9f9f9] pb-2.5">
                  <span className="font-bold text-[#888]">Name</span>
                  <span className="font-black text-[#1a1a1a] text-right">{formData.partyName || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-[#f9f9f9] pb-2.5">
                  <span className="font-bold text-[#888]">Phone</span>
                  <span className="font-black text-[#1a1a1a] text-right">{formData.phone || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-[#f9f9f9] pb-2.5">
                  <span className="font-bold text-[#888]">Address</span>
                  <span className="font-black text-[#1a1a1a] text-right">{formData.address || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-[#f9f9f9] pb-2.5">
                  <span className="font-bold text-[#888]">Transport</span>
                  <span className="font-black text-[#1a1a1a] text-right">{formData.transport || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-[#f9f9f9] pb-2.5">
                  <span className="font-bold text-[#888]">GST No.</span>
                  <span className="font-black text-[#1a1a1a] text-right uppercase">{formData.gst || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-[#f9f9f9] pb-2.5">
                  <span className="font-bold text-[#888]">Agent</span>
                  <span className="font-black text-[#1a1a1a] text-right">{formData.agent || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#888]">Filled By</span>
                  <span className="font-black text-[#1a1a1a] text-right">{formData.filledBy || "—"}</span>
                </div>
                {formData.remarks && (
                  <div className="flex justify-between border-t border-[#f0f0f0] pt-2.5 mt-1">
                    <span className="font-bold text-[#888]">Remarks</span>
                    <span className="font-black text-[#1a1a1a] text-right max-w-[60%]">{formData.remarks}</span>
                  </div>
                )}
              </div>

              {/* Step 2 Action Buttons */}
              <div className="mt-8 mb-4 flex flex-col md:flex-row gap-4">
                <button
                  onClick={handleBack}
                  className="w-full md:w-1/3 bg-white border border-[#e0e0e0] text-[#555] rounded-[14px] py-4 text-[13px] font-extrabold hover:bg-[#f9f9f9] transition-colors shadow-sm"
                >
                  ← BACK
                </button>
                <button
                  onClick={handleNext}
                  className="w-full md:w-2/3 text-white bg-[#2d7d46] hover:bg-[#246638] rounded-[14px] py-4 text-[14px] font-black tracking-[1px] transition-transform hover:scale-[1.01] shadow-md"
                >
                  CONFIRM & SUBMIT ✅
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* WhatsApp redirect full-screen confirmation */}
      {showWhatsAppRedirect && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[40px]">
            💬
          </div>
          <h1 className="mt-6 text-2xl sm:text-3xl font-black text-[#0E2A4A] tracking-[0.5px]">
            OPENING WHATSAPP…
          </h1>
          <p className="mt-3 max-w-sm text-[14px] text-[#666] leading-relaxed">
            We've opened WhatsApp in a new tab with your order details already filled in.
            Just hit <span className="font-bold text-[#1a1a1a]">send</span> in the chat to
            confirm your order with us.
          </p>
          <button
            onClick={handleRedirectDone}
            className="mt-8 w-full max-w-xs text-white bg-[#0E2A4A] hover:bg-[#1a3d6e] rounded-[14px] py-4 text-[13px] font-black tracking-[1px] transition-colors"
          >
            BACK TO HOME
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderFormPage;
