import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapPinned, MessageCircle, PhoneCall } from "lucide-react";
import { fetchAboutThunk } from "../store/aboutSlice";
import AboutUsBG from "../assets/AboutUsBG.jpg";
import MiniputSign from "../assets/MINIPUT_SIGN.png";
import KwinkSign from "../assets/kwink_SIGN.png";
import MiniputLogo from "../assets/MINIPUT_LOGO.png";
import KwinkLogo from "../assets/kwink_LOGO.png";
import AboutPageSkeleton from "../components/skeletonLoader/AboutPageSkeleton";


const normalizePhone = (value) => String(value || "").replace(/\D+/g, "");

const AboutPage = () => {
  const dispatch = useDispatch();
  const { about, loading, error } = useSelector((state) => state.about);

  useEffect(() => {
    dispatch(fetchAboutThunk());
  }, [dispatch]);

  const miniputPoints = useMemo(
    () => (Array.isArray(about.miniputDetails) ? about.miniputDetails : []),
    [about.miniputDetails]
  );
  
  const kwinkPoints = useMemo(
    () => (Array.isArray(about.kwinkDetails) ? about.kwinkDetails : []),
    [about.kwinkDetails]
  );

  const whatsappLink = useMemo(() => {
    const number = normalizePhone(about.whatsappNumber);
    return number ? `https://wa.me/${number}` : "";
  }, [about.whatsappNumber]);

  const callLink = useMemo(() => {
    const number = normalizePhone(about.phoneNumber);
    return number ? `tel:${number}` : "";
  }, [about.phoneNumber]);

  if (loading) {
    return <AboutPageSkeleton />;
  }

  return (
    <div className="flex-1 bg-[#ececec] pb-24 pt-2 sm:pt-4">
      <div className="max-w-5xl mx-auto w-full">
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

        {error ? (
          <div className="px-4 sm:px-6 mt-4">
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          </div>
        ) : null}

        <div className="space-y-4 px-4 pt-5 sm:space-y-5 sm:px-6 sm:pt-6">
          <section className="rounded-2xl bg-white p-5 shadow-[0_14px_26px_rgba(0,0,0,0.2)] sm:p-7">
            <div className="flex items-center justify-between gap-4 sm:gap-5">
              {/* Left Side: Address Text */}
              <div className="min-w-0 flex-1">
                <p className="text-2xl sm:text-4xl font-['Bebas_Neue',_sans-serif] tracking-widest text-[#2d2d2d]">
                  ADDRESS
                </p>
                <p className="mt-1.5 sm:mt-3 whitespace-pre-line text-sm sm:text-2xl leading-[1.4] text-[#5b5b5b] font-bold uppercase tracking-wide">
                  {about.address || "Address will be updated soon."}
                </p>
              </div>

              {/* Right Side: Interactive Google Map */}
              <div className="shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-[12px] sm:rounded-[20px] overflow-hidden border border-gray-100 h-[72px] w-[72px] sm:h-28 sm:w-28 bg-[#ececec] relative group">
                {about.locationUrl ? (
                  <>
                    <iframe
                      src={about.locationUrl}
                      className="absolute inset-0 w-full h-full"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Store Location"
                    ></iframe>
                    {/* Optional: invisible overlay to prevent accidental scrolling while reading on mobile, but clicking opens maps if you wrap it */}
                    <div className="absolute inset-0 pointer-events-none group-hover:pointer-events-auto"></div>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#5c6f8b]">
                    <MapPinned size={32} strokeWidth={2.2} />
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-[0_14px_26px_rgba(0,0,0,0.2)] sm:p-7">
            <div className="flex gap-5 sm:items-center sm:justify-between sm:gap-8">
              <div className="min-w-0 flex-1">
                <img src={MiniputLogo} alt="Miniput" className="h-12 w-auto sm:h-20" />
                <ul className="mt-4 space-y-1 text-base sm:text-2xl leading-[1.28] text-[#5b5b5b]">
                  {(miniputPoints.length ? miniputPoints : ["Details will be updated soon."]).map((point, index) => (
                    <li key={`miniput-${index}`} className="flex gap-2">
                      <span>&bull;</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center items-center sm:justify-end">
                <img src={MiniputSign} alt="Miniput sign" className="h-20 w-auto sm:h-30" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-[0_14px_26px_rgba(0,0,0,0.2)] sm:p-7">
            <div className="flex gap-5 sm:items-center sm:justify-between sm:gap-8">
              <div className="min-w-0 flex-1">
                <img src={KwinkLogo} alt="Kwink" className="h-12 w-auto sm:h-20" />
                <ul className="mt-4 space-y-1 text-base sm:text-2xl leading-[1.28] text-[#5b5b5b]">
                  {(kwinkPoints.length ? kwinkPoints : ["Details will be updated soon."]).map((point, index) => (
                    <li key={`kwink-${index}`} className="flex gap-2">
                      <span>&bull;</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center items-center sm:justify-end">
                <img src={KwinkSign} alt="Kwink sign" className="h-20 w-auto sm:h-30" />
              </div>
            </div>
          </section>

          <section className="pb-4 pt-2">
            <p className="text-3xl sm:text-4xl font-['Bebas_Neue',_sans-serif] tracking-widest text-[#2d2d2d]">CONTACT</p>
            <div className="mt-3 space-y-3.5">
              <a
                href={whatsappLink || undefined}
                target={whatsappLink ? "_blank" : undefined}
                rel={whatsappLink ? "noreferrer" : undefined}
                className="flex w-full items-center gap-3 rounded-2xl bg-white px-5 py-4 text-base sm:text-3xl font-black text-[#58c56f] shadow-[0_14px_26px_rgba(0,0,0,0.2)]"
              >
                <MessageCircle size={25} strokeWidth={2.8} />
                WHATSAPP: {about.whatsappNumber || "-"}
              </a>

              <a
                href={callLink || undefined}
                className="flex w-full items-center gap-3 rounded-2xl bg-white px-5 py-4 text-base sm:text-3xl font-black text-[#314d96] shadow-[0_14px_26px_rgba(0,0,0,0.2)]"
              >
                <PhoneCall size={25} strokeWidth={2.8} />
                CALL: {about.phoneNumber || "-"}
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
