import React from "react";
import Navbar from "../../components/layout/Navbar";

const AboutPage = () => {
  return (
    <div className="flex-1 flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 overflow-y-auto bg-gray-50 pb-20 lg:pb-8">
        <div className="p-8 text-center bg-gradient-to-br from-[#f5f0e8] to-[#ede5d0]">
          <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase mb-1">OUR SHOWROOM</h1>
          <p className="text-xs font-semibold text-gray-500 tracking-widest">PREMIUM KIDSWEAR • WHOLESALE ONLY</p>
        </div>

        <div className="p-4 space-y-4 max-w-4xl mx-auto w-full">
          <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-200">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Address</p>
              <p className="text-sm font-semibold text-gray-700 leading-tight">
                85 Readymade Complex,
                <br />
                Pardesipura, Indore
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg flex items-center justify-center">
              <span className="text-2xl">??</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4">
            <div className="text-3xl flex-shrink-0">??</div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-800">MINIPUT</h3>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Size: 12-14-16 (Infant)</li>
                <li>• 2pc / 3pc baba sets</li>
                <li>• WSP: Rs 250 - Rs 500</li>
                <li>• MOQ: 18 units (6 sets)</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4">
            <div className="w-10 h-10 bg-blue-900 rounded flex items-center justify-center text-white font-black text-xl flex-shrink-0">K</div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-800">KWINK</h3>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Size: 22 to 32 (Boys)</li>
                <li>• Casual & Partywear Shirts</li>
                <li>• WSP: Rs 220 - Rs 450</li>
                <li>• MOQ: 12 units (4 sets)</li>
              </ul>
            </div>
          </div>

          <div className="pt-2 pb-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 px-1">Contact</p>
            <div className="space-y-3">
              <button className="w-full bg-white border border-gray-200 py-4 rounded-xl flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-transform">
                <span className="font-bold text-green-600">WhatsApp Us</span>
              </button>
              <button className="w-full bg-white border border-gray-200 py-4 rounded-xl flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-transform">
                <span className="font-bold text-blue-900">Call Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
