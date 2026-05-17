import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  fetchAboutContentThunk,
  fetchBrandHomeContentThunk,
  updateAboutContentThunk,
  updateBrandHomeContentThunk,
  uploadProductImageThunk,
  deleteUploadedProductImageThunk
} from "../store/adminSlice";

const BRAND_KEYS = ["Miniput", "Kwink"];

const emptyBrandState = {
  heroImageUrls: [],
  promoTagsText: ""
};

const parseMultiline = (value) =>
  String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const joinMultiline = (items) => (Array.isArray(items) ? items.join("\n") : "");
const splitMultilineRaw = (value) => String(value || "").split(/\r?\n/);
const ensureAtLeastOneRow = (items) => (items.length ? items : [""]);

const toPublicIdFromImageUrl = (url) => {
  if (!url || typeof url !== "string") {
    return "";
  }
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\/+/, "");
  } catch {
    return "";
  }
};

const AboutPage = () => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [aboutForm, setAboutForm] = useState({
    address: "",
    whatsappNumber: "",
    phoneNumber: "",
    miniputDetailsText: "",
    kwinkDetailsText: ""
  });

  const [brandForm, setBrandForm] = useState({
    Miniput: { ...emptyBrandState },
    Kwink: { ...emptyBrandState }
  });

  const [uploadingCountByBrand, setUploadingCountByBrand] = useState({
    Miniput: 0,
    Kwink: 0
  });
  const [removingImageKey, setRemovingImageKey] = useState("");

  const uploadingTotal = useMemo(
    () => Number(uploadingCountByBrand.Miniput || 0) + Number(uploadingCountByBrand.Kwink || 0),
    [uploadingCountByBrand]
  );

  const loadContent = async () => {
    setLoading(true);
    setError("");

    try {
      const [aboutData, miniputData, kwinkData] = await Promise.all([
        dispatch(fetchAboutContentThunk()).unwrap(),
        dispatch(fetchBrandHomeContentThunk("miniput")).unwrap(),
        dispatch(fetchBrandHomeContentThunk("kwink")).unwrap()
      ]);

      setAboutForm({
        address: aboutData.address || "",
        whatsappNumber: aboutData.whatsappNumber || "",
        phoneNumber: aboutData.phoneNumber || "",
        miniputDetailsText: Array.isArray(aboutData.miniputDetails) ? aboutData.miniputDetails.join("\n") : "",
        kwinkDetailsText: Array.isArray(aboutData.kwinkDetails) ? aboutData.kwinkDetails.join("\n") : ""
      });

      setBrandForm({
        Miniput: {
          heroImageUrls: Array.isArray(miniputData.heroImageUrls) ? miniputData.heroImageUrls.slice(0, 4) : [],
          promoTagsText: joinMultiline(miniputData.promoTags)
        },
        Kwink: {
          heroImageUrls: Array.isArray(kwinkData.heroImageUrls) ? kwinkData.heroImageUrls.slice(0, 4) : [],
          promoTagsText: joinMultiline(kwinkData.promoTags)
        }
      });
    } catch (loadError) {
      setError(loadError?.error || loadError?.message || "Failed to load content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAboutFieldChange = (field, value) => {
    setAboutForm((prev) => ({ ...prev, [field]: value }));
    setSuccess("");
  };

  const handleBrandFieldChange = (brand, field, value) => {
    setBrandForm((prev) => ({
      ...prev,
      [brand]: {
        ...prev[brand],
        [field]: value
      }
    }));
    setSuccess("");
  };

  const handleMultilineRowChange = (field, index, value) => {
    const rows = ensureAtLeastOneRow(splitMultilineRaw(aboutForm[field]));
    rows[index] = value;
    handleAboutFieldChange(field, rows.join("\n"));
  };

  const handleBrandMultilineRowChange = (brand, field, index, value) => {
    const rows = ensureAtLeastOneRow(splitMultilineRaw(brandForm[brand]?.[field]));
    rows[index] = value;
    handleBrandFieldChange(brand, field, rows.join("\n"));
  };

  const handleAddMultilineRow = (field) => {
    const rows = ensureAtLeastOneRow(splitMultilineRaw(aboutForm[field]));
    handleAboutFieldChange(field, [...rows, ""].join("\n"));
  };

  const handleAddBrandMultilineRow = (brand, field) => {
    const rows = ensureAtLeastOneRow(splitMultilineRaw(brandForm[brand]?.[field]));
    handleBrandFieldChange(brand, field, [...rows, ""].join("\n"));
  };

  const handleDeleteMultilineRow = (field, index) => {
    const rows = ensureAtLeastOneRow(splitMultilineRaw(aboutForm[field]));
    const nextRows = rows.filter((_, rowIndex) => rowIndex !== index);
    handleAboutFieldChange(field, ensureAtLeastOneRow(nextRows).join("\n"));
  };

  const handleDeleteBrandMultilineRow = (brand, field, index) => {
    const rows = ensureAtLeastOneRow(splitMultilineRaw(brandForm[brand]?.[field]));
    const nextRows = rows.filter((_, rowIndex) => rowIndex !== index);
    handleBrandFieldChange(brand, field, ensureAtLeastOneRow(nextRows).join("\n"));
  };

  const handleUploadHeroImages = async (brand, files) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) {
      return;
    }

    const existingCount = brandForm[brand]?.heroImageUrls?.length || 0;
    const availableSlots = Math.max(0, 4 - existingCount);

    if (!availableSlots) {
      window.alert("You can upload up to 4 hero images per brand.");
      return;
    }

    const filesToUpload = selectedFiles.slice(0, availableSlots);

    if (selectedFiles.length > availableSlots) {
      window.alert(`Only ${availableSlots} slot(s) were available. Extra files were ignored.`);
    }

    setUploadingCountByBrand((prev) => ({
      ...prev,
      [brand]: Number(prev[brand] || 0) + filesToUpload.length
    }));

    for (const file of filesToUpload) {
      try {
        // We reuse the existing uploadProductImageThunk which natively handles file conversion
        const data = await dispatch(uploadProductImageThunk(file)).unwrap();
        const imageUrl = data?.imageUrl;

        if (!imageUrl) {
          throw new Error("Image upload returned an empty URL.");
        }

        setBrandForm((prev) => {
          const currentUrls = prev[brand]?.heroImageUrls || [];
          if (currentUrls.includes(imageUrl) || currentUrls.length >= 4) {
            return prev;
          }

          return {
            ...prev,
            [brand]: {
              ...prev[brand],
              heroImageUrls: [...currentUrls, imageUrl]
            }
          };
        });
      } catch (uploadError) {
        window.alert(uploadError?.message || "Image upload failed.");
      } finally {
        setUploadingCountByBrand((prev) => ({
          ...prev,
          [brand]: Math.max(0, Number(prev[brand] || 0) - 1)
        }));
      }
    }
  };

  const handleRemoveHeroImage = async (brand, imageUrl) => {
    const removeKey = `${brand}:${imageUrl}`;
    setRemovingImageKey(removeKey);

    const publicId = toPublicIdFromImageUrl(imageUrl);
    if (publicId) {
      try {
        await dispatch(deleteUploadedProductImageThunk(publicId)).unwrap();
      } catch {
        window.alert("Image removed from page content, but deletion from storage failed.");
      }
    }

    setBrandForm((prev) => ({
      ...prev,
      [brand]: {
        ...prev[brand],
        heroImageUrls: (prev[brand]?.heroImageUrls || []).filter((url) => url !== imageUrl)
      }
    }));

    setRemovingImageKey("");
    setSuccess("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (uploadingTotal > 0) {
      window.alert("Please wait for all image uploads to finish before saving.");
      return;
    }

    const miniputHeroImages = (brandForm.Miniput?.heroImageUrls || []).slice(0, 4);
    const kwinkHeroImages = (brandForm.Kwink?.heroImageUrls || []).slice(0, 4);

    if (miniputHeroImages.length > 4 || kwinkHeroImages.length > 4) {
      window.alert("Hero image limit exceeded. Maximum is 4 per brand.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await Promise.all([
        dispatch(updateAboutContentThunk({
          address: String(aboutForm.address || "").trim(),
          whatsappNumber: String(aboutForm.whatsappNumber || "").trim(),
          phoneNumber: String(aboutForm.phoneNumber || "").trim(),
          miniputDetails: parseMultiline(aboutForm.miniputDetailsText),
          kwinkDetails: parseMultiline(aboutForm.kwinkDetailsText)
        })).unwrap(),

        dispatch(updateBrandHomeContentThunk({
          brand: "miniput",
          payload: {
            heroImageUrls: miniputHeroImages,
            promoTags: parseMultiline(brandForm.Miniput?.promoTagsText)
          }
        })).unwrap(),

        dispatch(updateBrandHomeContentThunk({
          brand: "kwink",
          payload: {
            heroImageUrls: kwinkHeroImages,
            promoTags: parseMultiline(brandForm.Kwink?.promoTagsText)
          }
        })).unwrap()
      ]);

      setSuccess("About and home content updated successfully.");
      await loadContent();
    } catch (saveError) {
      setError(saveError?.error || saveError?.message || "Failed to save content.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f5f5] p-6">
        <p className="text-sm font-bold text-[#666]">Loading content...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#f5f5f5] pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-5 sm:px-6">
          <h1 className="text-3xl font-['Bebas_Neue',_sans-serif] tracking-[2px] text-[#0E2A4A]">ABOUT PAGE CONTENT</h1>
          <p className="mt-1 text-xs font-bold tracking-wide text-gray-500 uppercase">
            Update showroom details, brand points, hero images and homepage promo filters.
          </p>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {success}
          </div>
        ) : null}

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          <section className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-black text-[#1f2937]">Showroom And Contact</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Address</span>
                <textarea
                  rows={3}
                  value={aboutForm.address}
                  onChange={(event) => handleAboutFieldChange("address", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#0E2A4A]"
                  placeholder="85 Readymade Complex, Pardesipura, Indore"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">WhatsApp Number</span>
                <input
                  type="text"
                  value={aboutForm.whatsappNumber}
                  onChange={(event) => handleAboutFieldChange("whatsappNumber", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#0E2A4A]"
                  placeholder="9826088005"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Phone Number</span>
                <input
                  type="text"
                  value={aboutForm.phoneNumber}
                  onChange={(event) => handleAboutFieldChange("phoneNumber", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#0E2A4A]"
                  placeholder="9826040823"
                />
              </label>
            </div>
          </section>

          {BRAND_KEYS.map((brand) => {
            const detailsField = brand === "Miniput" ? "miniputDetailsText" : "kwinkDetailsText";
            const detailsValue = aboutForm[detailsField] || "";
            const heroImages = brandForm[brand]?.heroImageUrls || [];
            const promoTagsText = brandForm[brand]?.promoTagsText || "";
            const detailRows = ensureAtLeastOneRow(splitMultilineRaw(detailsValue));
            const promoTagRows = ensureAtLeastOneRow(splitMultilineRaw(promoTagsText));
            const isUploading = Number(uploadingCountByBrand[brand] || 0) > 0;

            return (
              <section key={brand} className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-black text-[#1f2937]">{brand} Settings</h2>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-600">
                    Hero Images: {heroImages.length}/4
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Brand Points (one line = one bullet)</span>
                    <div className="mt-1 space-y-2">
                      {detailRows.map((rowValue, rowIndex) => (
                        <div key={`${detailsField}-row-${rowIndex}`} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={rowValue}
                            onChange={(event) => handleMultilineRowChange(detailsField, rowIndex, event.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#0E2A4A]"
                            placeholder={rowIndex === 0 ? "Size range: 1 to 8" : "2-piece sets: pant + shirt"}
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteMultilineRow(detailsField, rowIndex)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddMultilineRow(detailsField)}
                        className="rounded-lg border border-[#0E2A4A] px-3 py-2 text-xs font-bold text-[#0E2A4A] hover:bg-[#0E2A4A] hover:text-white"
                      >
                        More Points
                      </button>
                    </div>
                  </div>

                  <div className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Homepage Filter Tags (one line = one button)</span>
                    <div className="mt-1 space-y-2">
                      {promoTagRows.map((rowValue, rowIndex) => (
                        <div key={`${brand}-promo-row-${rowIndex}`} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={rowValue}
                            onChange={(event) => handleBrandMultilineRowChange(brand, "promoTagsText", rowIndex, event.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#0E2A4A]"
                            placeholder={rowIndex === 0 ? "Below 499" : rowIndex === 1 ? "Below 699" : "50% off"}
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteBrandMultilineRow(brand, "promoTagsText", rowIndex)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddBrandMultilineRow(brand, "promoTagsText")}
                        className="rounded-lg border border-[#0E2A4A] px-3 py-2 text-xs font-bold text-[#0E2A4A] hover:bg-[#0E2A4A] hover:text-white"
                      >
                        More Tags
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-700">Hero Images</p>
                      <p className="text-xs text-gray-500">Upload up to 4 images for {brand} homepage hero.</p>
                    </div>

                    <label className="inline-flex cursor-pointer items-center rounded-lg bg-[#0E2A4A] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a3d6e]">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (event) => {
                          await handleUploadHeroImages(brand, event.target.files);
                          event.target.value = "";
                        }}
                      />
                      + ADD HERO IMAGES
                    </label>
                  </div>

                  {isUploading ? (
                    <p className="mt-2 text-xs font-semibold text-[#0E2A4A]">Uploading image(s)...</p>
                  ) : null}

                  {heroImages.length ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {heroImages.map((imageUrl) => {
                        const imageKey = `${brand}:${imageUrl}`;
                        const removing = removingImageKey === imageKey;

                        return (
                          <div key={imageKey} className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
                            <img src={imageUrl} alt={`${brand} hero`} className="h-28 w-full rounded-lg object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveHeroImage(brand, imageUrl)}
                              disabled={removing}
                              className="mt-2 w-full rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {removing ? "Removing..." : "Remove"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-gray-500">No hero images added yet.</p>
                  )}
                </div>
              </section>
            );
          })}

          <div className="sticky bottom-4 z-20">
            <div className="rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
              <button
                type="submit"
                disabled={saving || uploadingTotal > 0}
                className="w-full rounded-xl bg-[#0E2A4A] px-5 py-3 text-sm font-black text-white transition hover:bg-[#1a3d6e] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : uploadingTotal > 0 ? "Wait For Uploads To Finish" : "SAVE ABOUT + HOMEPAGE CONTENT"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AboutPage;