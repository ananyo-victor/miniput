import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Camera, LogOut } from "lucide-react";
import { closeProfileModal, logoutCustomer } from "../../store/authSlice";
import { updateProfile } from "../../store/userSlice";

const ProfileModal = () => {
  const dispatch = useDispatch();
  const { isProfileModalOpen, phone } = useSelector((state) => state.auth);
  const { name: savedName, profilePic: savedPic } = useSelector((state) => state.user.profile);

  const [localName, setLocalName] = useState("");
  const [localPic, setLocalPic] = useState("");
  const fileInputRef = useRef(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isProfileModalOpen) {
      setLocalName(savedName || "");
      setLocalPic(savedPic || "");
    }
  }, [isProfileModalOpen, savedName, savedPic]);

  if (!isProfileModalOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalPic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(updateProfile({ name: localName, profilePic: localPic }));
    dispatch(closeProfileModal());
  };

  const handleLogout = () => {
    dispatch(logoutCustomer());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden animate-[sfadeUp_0.3s_ease]">

        {/* Header */}
        <div className="bg-[var(--mk-navy)] p-5 text-center relative">
          <button
            onClick={() => dispatch(closeProfileModal())}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="mk-bebas text-2xl tracking-widest text-white">
            MY PROFILE
          </h2>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6">

          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center mb-6 relative">
            <div
              className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {localPic ? (
                <img src={localPic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Camera size={32} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
              )}

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Upload</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="space-y-4">
            {/* Editable Name Field */}
            <div>
              <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-1 block">
                Full Name
              </label>
              <input
                type="text"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none font-bold text-gray-900 focus:border-[var(--mk-navy)] focus:bg-white transition-colors"
              />
            </div>
            {/* Read-only Phone Number Field */}
            <div>
              <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-1 block">
                Phone Number
              </label>
              <input
                type="text"
                value={`+91 ${phone}`}
                readOnly
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 outline-none font-bold text-gray-500 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 rounded-xl bg-[var(--mk-navy)] text-[var(--mk-yellow)] text-xs font-black tracking-[0.09em] transition-transform hover:scale-[1.02]"
            >
              SAVE CHANGES
            </button>
          </div>
        </form>

        {/* Footer actions (Logout) */}
        <div className="bg-gray-50 p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-xs font-black text-[var(--mk-red)] hover:text-red-700 uppercase tracking-widest py-2 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfileModal;

