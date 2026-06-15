import React from "react";
import { MapPinned, MessageCircle, PhoneCall } from "lucide-react";
import AboutUsBG from "../../assets/AboutUsBG.jpg";

const AboutPageSkeleton = () => {
  return (
    <div className="flex-1 bg-[#ececec] pb-24 pt-2 sm:pt-4">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header Skeleton */}
        <section className="px-4 pt-4 sm:px-6">
          <div
            className="overflow-hidden rounded-[22px] bg-cover bg-center bg-no-repeat px-5 py-5 text-center text-white shadow-md sm:px-10 sm:py-10"
            style={{ backgroundImage: `url(${AboutUsBG})` }}
          >
            <h1 className="text-3xl sm:text-5xl font-black tracking-[0.16em]">FIND US</h1>
            <p className="mt-3 text-[10px] sm:text-base font-extrabold tracking-[0.12em] uppercase opacity-95">
              PREMIUM KIDSWEAR &middot; WHOLESALE ONLY
            </p>
          </div>
        </section>

        <div className="space-y-4 px-4 pt-5 sm:space-y-5 sm:px-6 sm:pt-6 animate-pulse">
          
          {/* Address Card Skeleton */}
          <section className="rounded-2xl bg-white p-5 shadow-[0_14px_26px_rgba(0,0,0,0.2)] sm:p-7">
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0 flex-1">
                <p className="text-3xl sm:text-4xl font-['Bebas_Neue',_sans-serif] tracking-widest text-[#2d2d2d]">ADDRESS</p>
                <div className="mt-4 space-y-2">
                  <div className="h-6 sm:h-8 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-6 sm:h-8 w-1/2 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="hidden sm:flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-[#ececec] text-[#5c6f8b]">
                <MapPinned size={52} strokeWidth={2.2} />
              </div>
            </div>
          </section>

          {/* Miniput Card Skeleton */}
          <section className="rounded-2xl bg-white p-5 shadow-[0_14px_26px_rgba(0,0,0,0.2)] sm:p-7">
            <div className="flex gap-5 sm:items-center sm:justify-between sm:gap-8">
              <div className="min-w-0 flex-1">
                <div className="h-12 w-32 sm:h-20 sm:w-48 bg-gray-200 rounded-lg"></div>
                <ul className="mt-4 space-y-2">
                  <li className="h-5 sm:h-7 w-5/6 bg-gray-200 rounded"></li>
                  <li className="h-5 sm:h-7 w-4/6 bg-gray-200 rounded"></li>
                  <li className="h-5 sm:h-7 w-3/4 bg-gray-200 rounded"></li>
                </ul>
              </div>
              <div className="flex justify-center items-center sm:justify-end">
                <div className="h-20 w-20 sm:h-30 sm:w-30 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </section>

          {/* Kwink Card Skeleton */}
          <section className="rounded-2xl bg-white p-5 shadow-[0_14px_26px_rgba(0,0,0,0.2)] sm:p-7">
            <div className="flex gap-5 sm:items-center sm:justify-between sm:gap-8">
              <div className="min-w-0 flex-1">
                <div className="h-12 w-32 sm:h-20 sm:w-48 bg-gray-200 rounded-lg"></div>
                <ul className="mt-4 space-y-2">
                  <li className="h-5 sm:h-7 w-4/5 bg-gray-200 rounded"></li>
                  <li className="h-5 sm:h-7 w-3/4 bg-gray-200 rounded"></li>
                </ul>
              </div>
              <div className="flex justify-center items-center sm:justify-end">
                <div className="h-20 w-20 sm:h-30 sm:w-30 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </section>

          {/* Contact Skeleton */}
          <section className="pb-4 pt-2">
            <p className="text-3xl sm:text-4xl font-['Bebas_Neue',_sans-serif] tracking-widest text-[#2d2d2d]">CONTACT</p>
            <div className="mt-3 space-y-3.5">
              <div className="flex w-full items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-[0_14px_26px_rgba(0,0,0,0.2)]">
                <MessageCircle size={25} strokeWidth={2.8} className="text-gray-300" />
                <div className="h-6 sm:h-8 w-48 bg-gray-200 rounded"></div>
              </div>

              <div className="flex w-full items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-[0_14px_26px_rgba(0,0,0,0.2)]">
                <PhoneCall size={25} strokeWidth={2.8} className="text-gray-300" />
                <div className="h-6 sm:h-8 w-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPageSkeleton;