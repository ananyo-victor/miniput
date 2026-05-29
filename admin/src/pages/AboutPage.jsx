import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAboutContentThunk, fetchWorkspaceHomeContentThunk, updateAboutContentThunk, updateWorkspaceHomeContentThunk } from "../store/aboutSlice";
import { deleteUploadedProductImageThunk, uploadProductImageThunk } from "../store/productsSlice";

const parseMultiline = (value) =>
  String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const splitMultilineRaw = (value) => String(value || "").split(/\r?\n/);
const ensureAtLeastOneRow = (items) => (items.length ? items : [""]);
const joinMultiline = (items) => (Array.isArray(items) ? items.join("\n") : "");

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
  const activeWorkspace = useSelector((state) => state.user.activeWorkspace);
  const activeWorkspaceId = useSelector((state) => state.user.selectedWorkspaceId);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [aboutForm, setAboutForm] = useState({
    miniputDetailsText: "",
    kwinkDetailsText: "",
    address: "",
    whatsappNumber: "",
    phoneNumber: "",
  });

  const [workspaceForm, setWorkspaceForm] = useState({
    heroImageUrls: [],
    promoTagsText: "",
  });

  const [uploadingCount, setUploadingCount] = useState(0);
  const [removingImageKey, setRemovingImageKey] = useState("");

  const loadContent = async () => {
    if (!activeWorkspaceId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [aboutData, workspaceData] = await Promise.all([
        dispatch(fetchAboutContentThunk()).unwrap(),
        dispatch(fetchWorkspaceHomeContentThunk(activeWorkspaceId)).unwrap(),
      ]);

      setAboutForm({
        miniputDetailsText: joinMultiline(aboutData?.miniputDetails),
        kwinkDetailsText: joinMultiline(aboutData?.kwinkDetails),
        address: aboutData?.address || "",
        whatsappNumber: aboutData?.whatsappNumber || "",
        phoneNumber: aboutData?.phoneNumber || "",
      });

      setWorkspaceForm({
        heroImageUrls: Array.isArray(workspaceData?.heroImageUrls)
          ? workspaceData.heroImageUrls.slice(0, 4)
          : [],
        promoTagsText: joinMultiline(workspaceData?.promoTags),
      });
    } catch (loadError) {
      setError(loadError?.error || loadError?.message || "Failed to load content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [activeWorkspaceId]);

  const handleAboutFieldChange = (field, value) => {
    setAboutForm((prev) => ({ ...prev, [field]: value }));
    setSuccess("");
  };

  const handleAboutMultilineRowChange = (field, index, value) => {
    const rows = ensureAtLeastOneRow(splitMultilineRaw(aboutForm[field]));
    rows[index] = value;
    handleAboutFieldChange(field, rows.join("\n"));
  };

  const handleAddAboutMultilineRow = (field) => {
    const rows = ensureAtLeastOneRow(splitMultilineRaw(aboutForm[field]));
    handleAboutFieldChange(field, [...rows, ""].join("\n"));
  };

  const handleDeleteAboutMultilineRow = (field, index) => {
    const rows = ensureAtLeastOneRow(splitMultilineRaw(aboutForm[field]));
    const nextRows = rows.filter((_, rowIndex) => rowIndex !== index);

    handleAboutFieldChange(
      field,
      ensureAtLeastOneRow(nextRows).join("\n")
    );
  };

  const handleWorkspaceFieldChange = (field, value) => {
    setWorkspaceForm((prev) => ({ ...prev, [field]: value }));
    setSuccess("");
  };

  const handleWorkspaceMultilineRowChange = (field, index, value) => {
    const rows = ensureAtLeastOneRow(splitMultilineRaw(workspaceForm[field]));
    rows[index] = value;
    handleWorkspaceFieldChange(field, rows.join("\n"));
  };

  const handleAddWorkspaceMultilineRow = (field) => {
    const rows = ensureAtLeastOneRow(splitMultilineRaw(workspaceForm[field]));
    handleWorkspaceFieldChange(field, [...rows, ""].join("\n"));
  };

  const handleDeleteWorkspaceMultilineRow = (field, index) => {
    const rows = ensureAtLeastOneRow(splitMultilineRaw(workspaceForm[field]));
    const nextRows = rows.filter((_, rowIndex) => rowIndex !== index);
    handleWorkspaceFieldChange(field, ensureAtLeastOneRow(nextRows).join("\n"));
  };

  const handleUploadHeroImages = async (files) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) {
      return;
    }

    const existingCount = workspaceForm.heroImageUrls.length;
    const availableSlots = Math.max(0, 4 - existingCount);

    if (!availableSlots) {
      window.alert("You can upload up to 4 hero images.");
      return;
    }

    const filesToUpload = selectedFiles.slice(0, availableSlots);

    if (selectedFiles.length > availableSlots) {
      window.alert(`Only ${availableSlots} slot(s) were available. Extra files were ignored.`);
    }

    setUploadingCount((prev) => prev + filesToUpload.length);

    for (const file of filesToUpload) {
      try {
        const data = await dispatch(uploadProductImageThunk(file)).unwrap();
        const imageUrl = data?.imageUrl;

        if (!imageUrl) {
          throw new Error("Image upload returned an empty URL.");
        }

        setWorkspaceForm((prev) => {
          if (prev.heroImageUrls.includes(imageUrl) || prev.heroImageUrls.length >= 4) {
            return prev;
          }

          return {
            ...prev,
            heroImageUrls: [...prev.heroImageUrls, imageUrl],
          };
        });
      } catch (uploadError) {
        window.alert(uploadError?.message || "Image upload failed.");
      } finally {
        setUploadingCount((prev) => Math.max(0, prev - 1));
      }
    }

    setSuccess("");
  };

  const handleRemoveHeroImage = async (imageUrl) => {
    const removeKey = `${activeWorkspaceId}:${imageUrl}`;
    setRemovingImageKey(removeKey);

    const publicId = toPublicIdFromImageUrl(imageUrl);
    if (publicId) {
      try {
        await dispatch(deleteUploadedProductImageThunk(publicId)).unwrap();
      } catch {
        window.alert("Image removed from page content, but deletion from storage failed.");
      }
    }

    setWorkspaceForm((prev) => ({
      ...prev,
      heroImageUrls: prev.heroImageUrls.filter((url) => url !== imageUrl),
    }));

    setRemovingImageKey("");
    setSuccess("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!activeWorkspaceId) {
      setError("No active workspace selected.");
      return;
    }

    if (uploadingCount > 0) {
      window.alert("Please wait for all image uploads to finish before saving.");
      return;
    }

    if (workspaceForm.heroImageUrls.length > 4) {
      window.alert("Hero image limit exceeded. Maximum is 4.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await Promise.all([
        dispatch(
          updateAboutContentThunk({
            miniputDetails: parseMultiline(aboutForm.miniputDetailsText),
            kwinkDetails: parseMultiline(aboutForm.kwinkDetailsText),
            address: String(aboutForm.address || "").trim(),
            whatsappNumber: String(aboutForm.whatsappNumber || "").trim(),
            phoneNumber: String(aboutForm.phoneNumber || "").trim(),
          }),
        ).unwrap(),
        dispatch(
          updateWorkspaceHomeContentThunk({
            workspaceId: activeWorkspaceId,
            payload: {
              heroImageUrls: workspaceForm.heroImageUrls.slice(0, 4),
              promoTags: parseMultiline(workspaceForm.promoTagsText),
            },
          }),
        ).unwrap(),
      ]);

      setSuccess("Workspace content updated successfully.");
    } catch (saveError) {
      setError(saveError?.error || saveError?.message || "Failed to save content.");
    } finally {
      setSaving(false);
    }
  };
  const miniputDetailRows = ensureAtLeastOneRow(splitMultilineRaw(aboutForm.miniputDetailsText));
  const kwinkDetailRows = ensureAtLeastOneRow(splitMultilineRaw(aboutForm.kwinkDetailsText));
  const isMiniputWorkspace = activeWorkspace?.name === "Miniput";
  const aboutDetailsField = isMiniputWorkspace ? "miniputDetailsText" : "kwinkDetailsText";
  const aboutDetailRows = isMiniputWorkspace ? miniputDetailRows : kwinkDetailRows;
  const promoTagRows = ensureAtLeastOneRow(splitMultilineRaw(workspaceForm.promoTagsText));

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
          <h1 className="text-3xl font-['Bebas_Neue',_sans-serif] tracking-[2px] text-[#0E2A4A]">
            {activeWorkspace?.name || "Workspace"} CONTENT
          </h1>
          <p className="mt-1 text-xs font-bold tracking-wide text-gray-500 uppercase">
            Update showroom details, workspace points, hero images and homepage promo filters.
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

          <section className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-black text-[#1f2937]">{activeWorkspace?.name} Content</h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-600">
                Hero Images: {workspaceForm.heroImageUrls.length}/4
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Workspace Details (one line = one bullet)
                </span>
                <div className="mt-1 space-y-2">
                  {aboutDetailRows.map((rowValue, rowIndex) => {
                    return (
                      <div key={`details-row-${rowIndex}`} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={rowValue}
                          onChange={(event) =>
                            handleAboutMultilineRowChange(aboutDetailsField, rowIndex, event.target.value)
                          }
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#0E2A4A]"
                          placeholder={rowIndex === 0 ? "Size range: 1 to 8" : "2-piece sets: pant + shirt"}
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteAboutMultilineRow(aboutDetailsField, rowIndex)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => handleAddAboutMultilineRow(aboutDetailsField)}
                    className="rounded-lg border border-[#0E2A4A] px-3 py-2 text-xs font-bold text-[#0E2A4A] hover:bg-[#0E2A4A] hover:text-white"
                  >
                    More Points
                  </button>
                </div>
              </div>

              <div className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Homepage Filter Tags (one line = one button)
                </span>
                <div className="mt-1 space-y-2">
                  {promoTagRows.map((rowValue, rowIndex) => (
                    <div key={`promo-row-${rowIndex}`} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={rowValue}
                        onChange={(event) =>
                          handleWorkspaceMultilineRowChange("promoTagsText", rowIndex, event.target.value)
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#0E2A4A]"
                        placeholder={rowIndex === 0 ? "Below 499" : rowIndex === 1 ? "Below 699" : "50% off"}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteWorkspaceMultilineRow("promoTagsText", rowIndex)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddWorkspaceMultilineRow("promoTagsText")}
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
                  <p className="text-xs text-gray-500">
                    Upload up to 4 images for {activeWorkspace?.name || "workspace"} homepage hero.
                  </p>
                </div>

                <label className="inline-flex cursor-pointer items-center rounded-lg bg-[#0E2A4A] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a3d6e]">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (event) => {
                      await handleUploadHeroImages(event.target.files);
                      event.target.value = "";
                    }}
                  />
                  + ADD HERO IMAGES
                </label>
              </div>

              {uploadingCount > 0 ? (
                <p className="mt-2 text-xs font-semibold text-[#0E2A4A]">Uploading image(s)...</p>
              ) : null}

              {workspaceForm.heroImageUrls.length ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {workspaceForm.heroImageUrls.map((imageUrl) => {
                    const imageKey = `${activeWorkspaceId}:${imageUrl}`;
                    const removing = removingImageKey === imageKey;

                    return (
                      <div key={imageKey} className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
                        <img
                          src={imageUrl}
                          alt={`${activeWorkspace?.name || "Workspace"} hero`}
                          className="h-28 w-full rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveHeroImage(imageUrl)}
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

          <div className="sticky bottom-4 z-20">
            <div className="rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
              <button
                type="submit"
                disabled={saving || uploadingCount > 0}
                className="w-full rounded-xl bg-[#0E2A4A] px-5 py-3 text-sm font-black text-white transition hover:bg-[#1a3d6e] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving
                  ? "Saving..."
                  : uploadingCount > 0
                    ? "Wait For Uploads To Finish"
                    : "SAVE ABOUT + HOME CONTENT"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AboutPage;
