import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Camera, LogOut, ArrowLeft } from "lucide-react";
import { logoutCustomer } from "../store/authSlice";
import {
  uploadProfilePictureThunk,
  updateCustomerAccountThunk,
  fetchUserDetailsThunk,
} from "../store/userSlice";

import {
  createBusinessThunk,
  updateBusinessThunk,
  fetchBusinessesThunk,
} from "../store/businessSlice";

const FormField = ({ icon, label, required, optional, className, children }) => (
  <div
    className={`flex items-center gap-3 px-4 py-2 min-h-[54px] transition-colors focus-within:bg-[#fffdf5] ${className}`}
  >
    <div className="text-[18px] w-[24px] text-center shrink-0">{icon}</div>
    <div className="flex-1 py-1 min-w-0">
      <label className="text-[9px] font-black tracking-[1.5px] uppercase flex items-center gap-1 text-[#888]">
        {label}
        {required && <span className="text-[#D63031]">*</span>}
        {optional && (
          <span className="text-[8px] font-bold text-[#aaa] normal-case tracking-normal">
            (Optional)
          </span>
        )}
      </label>
      <div className="mt-0.5">{children}</div>
    </div>
  </div>
);

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authed } = useSelector((state) => state.auth);
  const { id: userId, name, profilePic, phone, email } = useSelector((state) => state.user.profile);
  const savingUser = useSelector(state => state.user.saving);
  const savingBusiness = useSelector(state => state.business.saving);
  const isSaving = savingUser || savingBusiness;

  const existingBusiness = useSelector((state) => state.business.items[0] || null);

  const [localName, setLocalName] = useState(name || "");
  const [localEmail, setLocalEmail] = useState(email || "");
  const [localPic, setLocalPic] = useState(profilePic || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [localPartyName, setLocalPartyName] = useState(existingBusiness?.business_name || "");
  const [localBusinessPhone, setLocalBusinessPhone] = useState(existingBusiness?.business_phone || "");
  const [localAddress, setLocalAddress] = useState(existingBusiness?.delivery_address || "");
  const [localGst, setLocalGst] = useState(existingBusiness?.gst_number || "");
  const [localTransport, setLocalTransport] = useState(existingBusiness?.transport_courier || "");
  const [localAgent, setLocalAgent] = useState(existingBusiness?.agent_name || "");
  const [localFilledBy, setLocalFilledBy] = useState(existingBusiness?.filled_by || "");
  const [localRemarks, setLocalRemarks] = useState(existingBusiness?.special_instructions || "");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userId) {
      Promise.all([
        dispatch(fetchBusinessesThunk(userId)),
        dispatch(fetchUserDetailsThunk(userId))
      ]).catch((error) => {
        console.error("Error fetching user details or businesses:", error);
      });
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (existingBusiness) {
      setLocalPartyName(existingBusiness?.business_name || "");
      setLocalBusinessPhone(existingBusiness?.business_phone || "");
      setLocalAddress(existingBusiness.delivery_address || "");
      setLocalGst(existingBusiness.gst_number || "");
      setLocalTransport(existingBusiness.transport_courier || "");
      setLocalAgent(existingBusiness.agent_name || "");
      setLocalFilledBy(existingBusiness.filled_by || "");
      setLocalRemarks(existingBusiness.special_instructions || "");
    }
    if(userId || name || profilePic || phone || email) {
      setLocalName(name || "");
      setLocalEmail(email || "");
      setLocalPic(profilePic || "");
    }
  }, [existingBusiness]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        setLocalPic(base64Data);
        setIsUploadingImage(true);
        try {
          const uploadedUrl = await dispatch(uploadProfilePictureThunk(base64Data)).unwrap();
          setLocalPic(uploadedUrl);
        } catch (error) {
          console.error("Failed to upload image:", error);
        } finally {
          setIsUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const userPayload = {
      id: userId,
      full_name: localName,
      profilePictureUrl: localPic,
      email: localEmail
    };

    await dispatch(updateCustomerAccountThunk(userPayload)).unwrap();
    const businessPayload = { isDefault: true };

    if (localPartyName?.trim()) businessPayload.businessName = localPartyName;
    if (localBusinessPhone?.trim()) businessPayload.businessPhone = localBusinessPhone;
    if (localAddress?.trim()) businessPayload.deliveryAddress = localAddress;
    if (localTransport?.trim()) businessPayload.transportCourier = localTransport;
    if (localGst?.trim()) businessPayload.gstNumber = localGst;
    if (localAgent?.trim()) businessPayload.agentName = localAgent;
    if (localFilledBy?.trim()) businessPayload.filledBy = localFilledBy;
    if (localRemarks?.trim()) businessPayload.specialInstructions = localRemarks;

    if (existingBusiness?.id) {
      await dispatch(
        updateBusinessThunk({
          id: existingBusiness.id,
          payload: businessPayload,
        })
      ).unwrap();
    } else {
      await dispatch(
        createBusinessThunk({
          userId: userId,
          payload: businessPayload,
        })
      ).unwrap();
    }
  };

  const handleLogout = () => {
    dispatch(logoutCustomer());
    navigate("/home");
  };

  if (!authed) return null;

  return (
    <div className="flex-1 bg-[#ececec] pb-24 pt-4 sm:pt-8 font-['Nunito',_sans-serif] min-h-full">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-700 hover:bg-gray-50 transition-colors font-bold"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl sm:text-3xl font-['Bebas_Neue',_sans-serif] tracking-widest text-[#0E2A4A] mt-1">
              ACCOUNT SETTINGS
            </h1>
          </div>
          {/* <button
            type="button"
            onClick={handleLogout}
            className="hidden sm:flex items-center justify-center gap-2 text-xs font-black text-[#D63031] hover:text-red-700 uppercase tracking-widest transition-colors bg-white px-5 py-2.5 rounded-full shadow-sm"
          >
            <LogOut size={16} /> Logout
          </button> */}
        </div>

        <form onSubmit={handleSave} className="bg-[#f5f5f5] rounded-3xl overflow-hidden shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row">

            {/* ================= LEFT SIDE: PERSONAL INFORMATION ================= */}
            <div className="w-full lg:w-1/3 bg-white p-6 sm:p-8 lg:border-r border-b lg:border-b-0 border-gray-200">
              <h2 className="text-[13px] font-black tracking-[1.5px] text-[#0E2A4A] mb-8 uppercase text-center lg:text-left">
                Personal Information
              </h2>

              {/* Avatar Upload */}
              <div className="flex flex-col items-center justify-center mb-8 relative">
                <div
                  className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer group relative ${isUploadingImage ? 'pointer-events-none' : ''}`}
                  onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                >
                  {localPic ? (
                    <img src={localPic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={40} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  )}
                  {isUploadingImage ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <span className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-10">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Upload</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] sm:text-xs font-black tracking-widest text-gray-400 uppercase mb-1.5 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none font-bold text-gray-900 focus:border-[#0E2A4A] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-black tracking-widest text-gray-400 uppercase mb-1.5 block">
                    Phone Number (Login ID)
                  </label>
                  <input
                    type="text"
                    value={`+91 ${phone}`}
                    readOnly
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3.5 outline-none font-bold text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-black tracking-widest text-gray-400 uppercase mb-1.5 block">
                    Email ID
                  </label>
                  <input
                    type="email"
                    value={localEmail}
                    onChange={(e) => setLocalEmail(e.target.value)}
                    placeholder="Enter your email id"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none font-bold text-gray-900 focus:border-[#0E2A4A] focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* ================= RIGHT SIDE: BUSINESS REGISTRATION ================= */}
            <div className="w-full lg:w-2/3 p-6 sm:p-8 bg-[#f5f5f5]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[13px] font-black tracking-[1.5px] text-[#0E2A4A] uppercase">
                  Business Registration
                </h2>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider bg-gray-200/50 px-2.5 py-1 rounded-md">
                  PRE-FILL FOR ORDERS
                </span>
              </div>

              <div className="space-y-6">
                {/* 1. Name & Phone */}
                <div className="bg-white rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col md:flex-row overflow-hidden border border-[#f0f0f0]">
                  <FormField icon="🏢" label="NAME" className="flex-1 border-b md:border-b-0 md:border-r border-[#f0f0f0]">
                    <input
                      type="text"
                      value={localPartyName}
                      onChange={(e) => setLocalPartyName(e.target.value)}
                      className="w-full bg-transparent border-none text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                      placeholder="Business / Shop name"
                    />
                  </FormField>
                  <FormField icon="📱" label="PHONE NUMBER" className="flex-1">
                    <input
                      type="tel"
                      maxLength={10}
                      value={localBusinessPhone}
                      onChange={(e) => setLocalBusinessPhone(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-transparent border-none text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                      placeholder="10-digit mobile"
                    />
                  </FormField>
                </div>

                {/* 2. Delivery & Transport */}
                <div>
                  <h3 className="text-[10px] font-black tracking-[1.5px] text-[#888] uppercase mb-1.5 ml-1">Delivery</h3>
                  <div className="bg-white rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden border border-[#f0f0f0]">
                    <FormField icon="📍" label="DELIVERY ADDRESS" className="border-b border-[#f0f0f0]">
                      <input
                        type="text"
                        value={localAddress}
                        onChange={(e) => setLocalAddress(e.target.value)}
                        className="w-full bg-transparent border-none text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                        placeholder="Full delivery address"
                      />
                    </FormField>
                    <FormField icon="🚛" label="TRANSPORT / COURIER" optional>
                      <input
                        type="text"
                        value={localTransport}
                        onChange={(e) => setLocalTransport(e.target.value)}
                        className="w-full bg-transparent border-none text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                        placeholder="Preferred transport or courier"
                      />
                    </FormField>
                  </div>
                </div>

                {/* 3. Tax & Agent */}
                <div>
                  <h3 className="text-[10px] font-black tracking-[1.5px] text-[#888] uppercase mb-1.5 ml-1">Tax & Agent</h3>
                  <div className="bg-white rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden border border-[#f0f0f0]">
                    <div className="flex flex-col md:flex-row border-b border-[#f0f0f0]">
                      <FormField icon="🧾" label="GST NUMBER" optional className="flex-1 border-b md:border-b-0 md:border-r border-[#f0f0f0]">
                        <input
                          type="text"
                          maxLength="15"
                          value={localGst}
                          onChange={(e) => setLocalGst(e.target.value)}
                          className="w-full bg-transparent border-none text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc] uppercase"
                          placeholder="e.g. 23ABCDE1234F1Z5"
                        />
                      </FormField>
                      <FormField icon="👤" label="AGENT NAME" className="flex-1">
                        <input
                          type="text"
                          value={localAgent}
                          onChange={(e) => setLocalAgent(e.target.value)}
                          className="w-full bg-transparent border-none text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                          placeholder="Sales agent name"
                        />
                      </FormField>
                    </div>
                    <FormField icon="✍️" label="FILLED BY" optional>
                      <input
                        type="text"
                        value={localFilledBy}
                        onChange={(e) => setLocalFilledBy(e.target.value)}
                        className="w-full bg-transparent border-none text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                        placeholder="Name of person filling form"
                      />
                    </FormField>
                  </div>
                </div>

                {/* 4. Remarks */}
                <div>
                  <h3 className="text-[10px] font-black tracking-[1.5px] text-[#888] uppercase mb-1.5 ml-1">Remarks</h3>
                  <div className="bg-white rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden border border-[#f0f0f0]">
                    <FormField icon="📝" label="SPECIAL INSTRUCTIONS" optional>
                      <input
                        type="text"
                        value={localRemarks}
                        onChange={(e) => setLocalRemarks(e.target.value)}
                        className="w-full bg-transparent border-none text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                        placeholder="Any special instructions..."
                      />
                    </FormField>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ================= BOTTOM ACTION BAR ================= */}
          <div className="bg-white border-t border-gray-200 p-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleLogout}
              className="sm:hidden w-full flex items-center justify-center gap-2 text-sm font-black text-[#D63031] hover:text-red-700 uppercase tracking-widest py-3 transition-colors bg-red-50 rounded-xl"
            >
              <LogOut size={18} /> Logout
            </button>
            <p className="text-[10px] font-bold text-gray-400 hidden sm:block max-w-sm leading-relaxed">
              * Saved business details will automatically fill in during your checkout to save you time.
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className={`w-full sm:w-auto px-10 py-4 rounded-xl bg-[#0E2A4A] text-[#FFB800] text-sm font-black tracking-[0.09em] transition-transform shadow-md shrink-0 ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}            >
              {isSaving ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProfilePage;