import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, LogOut, Camera,
  Smartphone, MapPin, FileText,
  User, StickyNote, Mail, Building,
  Map, Hash
} from "lucide-react";
import { clearAdminToken } from "../utils/adminToken";
import { setAdminField } from "../store/authSlice";
import { fetchUserProfileThunk, updateUserProfileThunk } from "../store/userSlice";
import { createBillingProfileThunk, fetchDefaultBillingProfileThunk, updateBillingProfileThunk } from "../store/billingSlice";

const InputCard = ({ icon: Icon, label, required, placeholder, value, onChange, iconColor = "text-gray-400", labelExtra }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5 flex gap-3.5 transition-all focus-within:border-gray-300 focus-within:shadow-md">
    <div className="pt-0.5">
      <Icon size={20} className={iconColor} />
    </div>
    <div className="flex-1">
      <label className="text-[10px] font-black tracking-widest text-[#0E2A4A]/70 uppercase block mb-1">
        {label} {required && <span className="text-[#D63031]">*</span>} {labelExtra && <span className="text-gray-400 lowercase normal-case tracking-normal font-bold ml-1">{labelExtra}</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full text-sm font-bold text-[#1a1a1a] outline-none bg-transparent placeholder:text-gray-300 placeholder:font-semibold"
        placeholder={placeholder}
      />
    </div>
  </div>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const userProfile = useSelector((state) => state.user.profile);
  const billingProfile = useSelector((state) => state.billing.profile);

  const [formData, setFormData] = useState({
    // Personal Info
    fullName: auth?.userFullName || "Admin",
    phone: "+91 ",
    email: "",

    // Billing Details
    billingName: "",
    billingPhone: "",
    billingEmail: "",
    address: "",
    city: "",
    taluka: "",
    state: "",
    pin: "",
    gstNumber: "",
    specialInstructions: ""
  });

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleLogout = () => {
    clearAdminToken();
    dispatch(setAdminField({ key: "authed", value: false }));
    navigate("/");
  };

  useEffect(() => {
    const userId = auth?.userId;

    if (userId) {
      dispatch(fetchUserProfileThunk(userId));
    }
  }, [dispatch, auth?.userId]);

  useEffect(() => {
    if (!userProfile) return;

    setFormData((prev) => ({
      ...prev,
      fullName: userProfile.full_name || "",
      phone: userProfile.phone || "",
      email: userProfile.email || "",
    }));
  }, [userProfile]);

  useEffect(() => {
    if (userProfile?.id) {
      dispatch(fetchDefaultBillingProfileThunk(userProfile.id));
    }
  }, [dispatch, userProfile?.id]);

  useEffect(() => {
    if (!billingProfile) return;

    setFormData((prev) => ({
      ...prev,
      billingName: billingProfile.billing_name || "",
      billingPhone: billingProfile.billing_phone || "",
      billingEmail: billingProfile.billing_email || "",
      address: billingProfile.address_line_1 || "",
      city: billingProfile.city || "",
      taluka: billingProfile.taluka || "",
      state: billingProfile.state || "",
      gstNumber: billingProfile.gst_number || "",
      specialInstructions: billingProfile.special_instructions || "",
    }));
  }, [billingProfile]);

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (!userProfile?.id) return;

      await dispatch(
        updateUserProfileThunk({
          id: userProfile.id,
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
        })
      ).unwrap();

      const payload = {
        billingName: formData.billingName,
        billingPhone: formData.billingPhone,
        billingEmail: formData.billingEmail,
        gstNumber: formData.gstNumber,
        addressLine1: formData.address,
        city: formData.city,
        taluka: formData.taluka,
        state: formData.state,
        pin: formData.pin,
        specialInstructions: formData.specialInstructions,
        isDefault: true,
      };

      if (billingProfile?.id) {
        await dispatch(
          updateBillingProfileThunk({
            id: billingProfile.id,
            payload,
          })
        ).unwrap();
      } else {
        await dispatch(
          createBillingProfileThunk({
            userId: userProfile.id,
            payload,
          })
        ).unwrap();
      }

      await dispatch(fetchDefaultBillingProfileThunk(userProfile.id));

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-4 md:p-8 font-['Nunito',_sans-serif]">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#0E2A4A] hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <h1 className="text-xl md:text-2xl font-black tracking-[1.5px] text-[#0E2A4A] uppercase mk-bebas mt-1">
            ACCOUNT SETTINGS
          </h1>
        </div>
        {/* <button 
          onClick={handleLogout}
          className="bg-white border border-red-100 text-[#D63031] px-4 py-2.5 rounded-full text-xs font-black tracking-wider shadow-sm flex items-center gap-2 hover:bg-red-50 transition-colors"
        >
          <LogOut size={14} strokeWidth={3} /> LOGOUT
        </button> */}
      </div>

      {/* Main Content Card */}
      <div className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row">

        {/* Left Column: Personal Information */}
        <div className="w-full lg:w-[35%] p-6 md:p-10 border-r border-gray-100 bg-white">
          <h2 className="text-sm font-black tracking-widest text-[#0E2A4A] uppercase mb-8">Personal Information</h2>

          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32 rounded-full border-4 border-gray-50 bg-gray-100 flex items-center justify-center text-gray-400">
              <Camera size={32} strokeWidth={2} />
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase block mb-1.5 ml-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1a1a1a] outline-none focus:border-[#0E2A4A]/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase block mb-1.5 ml-1">Phone Number (Login ID)</label>
              <input
                type="text"
                value={formData.phone}
                onChange={handleChange('phone')}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1a1a1a] outline-none focus:border-[#0E2A4A]/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase block mb-1.5 ml-1">Email ID</label>
              <input
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="Enter your email id"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-[#1a1a1a] outline-none focus:border-[#0E2A4A]/30 transition-colors placeholder:text-gray-300 placeholder:font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Billing Details */}
        <div className="w-full lg:w-[65%] p-6 md:p-10 bg-[#f8f9fb] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black tracking-widest text-[#0E2A4A] uppercase">Billing Details</h2>
            <span className="bg-gray-200/60 text-gray-500 text-[9px] font-black px-3 py-1.5 rounded-md tracking-wider uppercase">
              Pre-fill for invoices
            </span>
          </div>

          <div className="space-y-6 flex-1">
            {/* Billing contact details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputCard
                icon={User} iconColor="text-blue-400"
                label="Name" required placeholder="Billing name"
                value={formData.billingName} onChange={handleChange('billingName')}
              />
              <InputCard
                icon={Smartphone} iconColor="text-purple-500"
                label="Phone Number" required placeholder="10-digit mobile"
                value={formData.billingPhone} onChange={handleChange('billingPhone')}
              />
              <InputCard
                icon={Mail} iconColor="text-pink-500"
                label="Email" placeholder="Billing email address"
                value={formData.billingEmail} onChange={handleChange('billingEmail')}
              />
              <InputCard
                icon={FileText} iconColor="text-indigo-300"
                label="GST Number" labelExtra="(Optional)" placeholder="E.G. 23ABCDE1234F1Z5"
                value={formData.gstNumber} onChange={handleChange('gstNumber')}
              />
            </div>

            {/* Address & Location Section */}
            <div>
              <h3 className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-3">Address & Location</h3>
              <div className="space-y-4">
                <InputCard
                  icon={MapPin} iconColor="text-teal-500"
                  label="Address" required placeholder="Full billing address"
                  value={formData.address} onChange={handleChange('address')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputCard
                    icon={Building} iconColor="text-orange-400"
                    label="City" required placeholder="City name"
                    value={formData.city} onChange={handleChange('city')}
                  />
                  <InputCard
                    icon={Map} iconColor="text-green-500"
                    label="Taluka" required placeholder="Taluka name"
                    value={formData.taluka} onChange={handleChange('taluka')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputCard
                    icon={Map} iconColor="text-blue-500"
                    label="State" required placeholder="State name"
                    value={formData.state} onChange={handleChange('state')}
                  />
                  <InputCard
                    icon={Hash} iconColor="text-red-400"
                    label="PIN" required placeholder="6-digit PIN"
                    value={formData.pin} onChange={handleChange('pin')}
                  />
                </div>
              </div>
            </div>

            {/* Special Instructions Section */}
            <div>
              <h3 className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-3">Special Instructions</h3>
              <InputCard
                icon={StickyNote} iconColor="text-yellow-500"
                label="Special Instructions" labelExtra="(Optional)" placeholder="Any special instructions..."
                value={formData.specialInstructions} onChange={handleChange('specialInstructions')}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Footer / Save Action */}
      <div className="max-w-6xl mx-auto mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[11px] font-bold text-gray-400 leading-relaxed md:w-2/3">
          * Saved billing details will automatically fill in during your checkout to save you time.
        </p>
        <button onClick={handleSave} className="w-full md:w-auto bg-[#0E2A4A] text-[#ffb800] px-8 py-3.5 rounded-xl text-xs font-black tracking-widest transition-transform hover:-translate-y-0.5 shadow-md hover:shadow-lg">
          SAVE CHANGES
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
