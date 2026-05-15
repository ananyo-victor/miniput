import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const splitDetails = (value) =>
  String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const normalizePhone = (value) => String(value || "").replace(/\D+/g, "");

const AboutPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [about, setAbout] = useState({
    address: "",
    miniputDetails: "",
    kwinkDetails: "",
    whatsappNumber: "",
    phoneNumber: ""
  });

  useEffect(() => {
    const loadAbout = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/content/about`);
        setAbout({
          address: data?.address || "",
          miniputDetails: data?.miniputDetails || "",
          kwinkDetails: data?.kwinkDetails || "",
          whatsappNumber: data?.whatsappNumber || "",
          phoneNumber: data?.phoneNumber || ""
        });
      } catch (loadError) {
        setError(loadError?.response?.data?.error || loadError?.message || "Failed to load about content.");
      } finally {
        setLoading(false);
      }
    };

    loadAbout();
  }, []);

  const miniputPoints = useMemo(() => splitDetails(about.miniputDetails), [about.miniputDetails]);
  const kwinkPoints = useMemo(() => splitDetails(about.kwinkDetails), [about.kwinkDetails]);

  const whatsappLink = useMemo(() => {
    const number = normalizePhone(about.whatsappNumber);
    return number ? `https://wa.me/${number}` : "";
  }, [about.whatsappNumber]);

  const callLink = useMemo(() => {
    const number = normalizePhone(about.phoneNumber);
    return number ? `tel:${number}` : "";
  }, [about.phoneNumber]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f5f5] p-6">
        <p className="text-sm font-semibold text-gray-600">Loading showroom details...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#ececec] pb-24">
      <div className="max-w-5xl mx-auto w-full">
        <section className="px-4 pt-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl bg-[linear-gradient(90deg,#223b5b_0%,#355f83_25%,#5d8b88_50%,#84963e_75%,#d7d0c5_100%)] p-8 text-center text-white shadow-md">
            <h1 className="text-4xl sm:text-5xl font-black tracking-[0.2em]">FIND US</h1>
            <p className="mt-2 text-sm sm:text-base font-extrabold tracking-[0.2em] uppercase opacity-95">
              PREMIUM KIDSWEAR · WHOLESALE ONLY
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

        <div className="space-y-4 px-4 pt-5 sm:px-6">
          <section className="rounded-2xl bg-white p-5 shadow-[0_12px_22px_rgba(0,0,0,0.15)]">
            <p className="text-4xl font-['Bebas_Neue',_sans-serif] tracking-widest text-[#2d2d2d]">ADDRESS</p>
            <p className="mt-3 whitespace-pre-line text-2xl leading-[1.25] text-[#5b5b5b] font-medium">
              {about.address || "Address will be updated soon."}
            </p>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-[0_12px_22px_rgba(0,0,0,0.15)]">
            <p className="text-3xl font-black tracking-wide text-[#0E2A4A]">MINIPUT</p>
            <ul className="mt-3 space-y-1 text-2xl leading-[1.3] text-[#5b5b5b]">
              {(miniputPoints.length ? miniputPoints : ["Details will be updated soon."]).map((point, index) => (
                <li key={`miniput-${index}`} className="flex gap-2">
                  <span>*</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-[0_12px_22px_rgba(0,0,0,0.15)]">
            <p className="text-3xl font-black tracking-wide text-[#0E2A4A]">KWINK</p>
            <ul className="mt-3 space-y-1 text-2xl leading-[1.3] text-[#5b5b5b]">
              {(kwinkPoints.length ? kwinkPoints : ["Details will be updated soon."]).map((point, index) => (
                <li key={`kwink-${index}`} className="flex gap-2">
                  <span>*</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="pb-4">
            <p className="text-4xl font-['Bebas_Neue',_sans-serif] tracking-widest text-[#2d2d2d]">CONTACT</p>
            <div className="mt-3 space-y-3">
              <a
                href={whatsappLink || undefined}
                target={whatsappLink ? "_blank" : undefined}
                rel={whatsappLink ? "noreferrer" : undefined}
                className="flex w-full items-center rounded-2xl bg-white px-5 py-4 text-2xl font-black text-[#2db961] shadow-[0_12px_22px_rgba(0,0,0,0.15)]"
              >
                WHATSAPP: {about.whatsappNumber || "-"}
              </a>

              <a
                href={callLink || undefined}
                className="flex w-full items-center rounded-2xl bg-white px-5 py-4 text-2xl font-black text-[#2f4f9e] shadow-[0_12px_22px_rgba(0,0,0,0.15)]"
              >
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
