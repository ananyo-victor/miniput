import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router";
import ProductCard from "../components/products/ProductCard";
import { fetchProducts } from "../store/productsSlice";
import { fetchHomeContent, setActiveBrand, setActiveCategory } from "../store/homeSlice";

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeCategory = (value) => normalizeText(value).replace(/[\s_-]+/g, "");

const CATEGORY_ALIASES = {
  tshirt: ["tshirt", "shirt", "tee"],
  jeans: ["jeans", "pant", "pants", "trouser", "trousers"],
  jacket: ["jacket", "hoodie", "coat"],
  set: ["set", "sets", "dress", "combo"],
  shorts: ["short", "shorts"]
};

const emptyBrandContent = {
  heroImageUrls: [],
  promoTags: []
};

const parsePriceCapFromTag = (tag) => {
  const text = normalizeText(tag);
  const match = text.match(/(?:below|under|upto|up to|less than)\s*(?:rs\.?|inr|\u20b9)?\s*([0-9]+(?:\.[0-9]+)?)/i);
  return match ? Number(match[1]) : null;
};

const parsePercentOffFromTag = (tag) => {
  const text = normalizeText(tag);
  const match = text.match(/([0-9]+(?:\.[0-9]+)?)\s*%\s*off/i);
  return match ? Number(match[1]) : null;
};

const getNumericValue = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const productMatchesPromoTag = (product, tag) => {
  const normalizedTag = normalizeText(tag);
  if (!normalizedTag || normalizedTag === "all") {
    return true;
  }
  const effectivePrice = product.isDiscountActive ? product.finalPrice : getNumericValue(product.price);

  const priceCap = parsePriceCapFromTag(normalizedTag);
  if (priceCap !== null) {
    return effectivePrice <= priceCap;
  }

  const percentOff = parsePercentOffFromTag(normalizedTag);
  if (percentOff !== null) {
    if (product.isDiscountActive && product.discountPercent >= percentOff) {
      return true;
    }

    const sellingPrice = effectivePrice;
    const basePrice = getNumericValue(
      product.originalPrice ?? product.mrp ?? product.listPrice ?? product.compareAtPrice ?? product.price
    );

    if (basePrice > 0 && basePrice > sellingPrice) {
      const discountPercent = ((basePrice - sellingPrice) / basePrice) * 100;
      return discountPercent >= percentOff;
    }
  }

  const searchableText = [product.name, product.category, product.description, product.brand]
    .map((item) => normalizeText(item))
    .join(" ");

  return searchableText.includes(normalizedTag);
};

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { brand } = useParams();
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.products);
  const { activeBrand, activeCategory, homeContentByBrand } = useSelector((state) => state.home);
  const workspaces = useSelector((state) => state.workspace.items);

  const [activePromoTagByBrand, setActivePromoTagByBrand] = useState({
    Miniput: "all",
    Kwink: "all"
  });
  const [heroIndexByBrand, setHeroIndexByBrand] = useState({
    Miniput: 0,
    Kwink: 0
  });

  useEffect(() => {
    dispatch(fetchHomeContent());
  }, [dispatch]);

  const urlBrand = useMemo(() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    const possibleBrand = normalizeText(brand || pathParts[pathParts.length - 1]);

    if (possibleBrand === "miniput") {
      return "Miniput";
    }

    if (possibleBrand === "kwink") {
      return "Kwink";
    }

    return null;
  }, [brand, location.pathname]);

  useEffect(() => {
    if (urlBrand && urlBrand !== activeBrand) {
      dispatch(setActiveBrand(urlBrand));
      dispatch(setActiveCategory("all"));
    }
  }, [urlBrand, activeBrand, dispatch]);

  useEffect(() => {
    dispatch(setActiveCategory("all"));
  }, [activeBrand, dispatch]);

  const activeWorkspace = useMemo(() => {
    const activeBrandSlug = normalizeCategory(activeBrand);

    return workspaces.find((workspace) => {
      const workspaceSlug = normalizeCategory(workspace?.slug || workspace?.name);
      return workspaceSlug === activeBrandSlug;
    });
  }, [activeBrand, workspaces]);

  const activeWorkspaceId = activeWorkspace?.id || "";

  useEffect(() => {
    if (!activeWorkspaceId) return;
    dispatch(fetchProducts({ includeHidden: false, workspaceId: activeWorkspaceId }));
  }, [activeWorkspaceId, dispatch]);

  const currentBrandContent = homeContentByBrand[activeBrand] || emptyBrandContent;
  const heroImages = Array.isArray(currentBrandContent.heroImageUrls)
    ? currentBrandContent.heroImageUrls.slice(0, 4)
    : [];
  const promoTags = Array.isArray(currentBrandContent.promoTags) ? currentBrandContent.promoTags : [];

  useEffect(() => {
    const currentIndex = Number(heroIndexByBrand[activeBrand] || 0);

    if (!heroImages.length) {
      if (currentIndex !== 0) {
        setHeroIndexByBrand((prev) => ({ ...prev, [activeBrand]: 0 }));
      }
      return;
    }

    if (currentIndex >= heroImages.length) {
      setHeroIndexByBrand((prev) => ({ ...prev, [activeBrand]: 0 }));
    }
  }, [activeBrand, heroImages, heroIndexByBrand]);

  const goToPrevHero = () => {
    setHeroIndexByBrand((prev) => {
      const idx = Number(prev[activeBrand] || 0);
      const length = heroImages.length || 1;
      const newIndex = (idx - 1 + length) % length;
      return { ...prev, [activeBrand]: newIndex };
    });
  };

  const goToNextHero = () => {
    setHeroIndexByBrand((prev) => {
      const idx = Number(prev[activeBrand] || 0);
      const length = heroImages.length || 1;
      const newIndex = (idx + 1) % length;
      return { ...prev, [activeBrand]: newIndex };
    });
  };

  const goToHeroIndex = (index) => {
    setHeroIndexByBrand((prev) => ({ ...prev, [activeBrand]: index }));
  };

  useEffect(() => {
    if (!heroImages.length || heroImages.length < 2) return;
    const interval = setInterval(() => {
      setHeroIndexByBrand((prev) => {
        const idx = Number(prev[activeBrand] || 0);
        const next = (idx + 1) % heroImages.length;
        return { ...prev, [activeBrand]: next };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [activeBrand, heroImages]);

  const activePromoTag = activePromoTagByBrand[activeBrand] || "all";

  const filteredProducts = useMemo(() => {
    const normalizedActiveCategory = normalizeCategory(activeCategory);
    const acceptedCategories = new Set(
      (CATEGORY_ALIASES[normalizedActiveCategory] || [normalizedActiveCategory]).map((item) =>
        normalizeCategory(item)
      )
    );

    return products.filter((product) => {
      const brandMatch = activeWorkspaceId
        ? product.workspaceId === activeWorkspaceId
        : normalizeText(product.brand) === normalizeText(activeBrand);

      const categoryMatch =
        normalizedActiveCategory === "all" ||
        acceptedCategories.has(normalizeCategory(product.category));

      const promoMatch = productMatchesPromoTag(product, activePromoTag);

      return brandMatch && categoryMatch && promoMatch;
    });
  }, [products, activeBrand, activeCategory, activePromoTag]);

  const activeHeroImage = heroImages.length
    ? heroImages[Math.min(heroIndexByBrand[activeBrand] || 0, heroImages.length - 1)]
    : "";

  return (
    <div className="flex-1 flex flex-col bg-[#f5f5f5] pb-10">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden w-full bg-yellow-300">
        {activeHeroImage ? (
          <div className="relative bg-red-300 mx-auto w-full md:h-[500px]">

            <div className="absolute inset-0 bg-center bg-cover blur-xl scale-110" style={{ backgroundImage: `url(${activeHeroImage})` }} />
            <img
              src={activeHeroImage}
              alt={`${activeBrand} hero`}
              className="relative h-full w-full object-contain object-center"
            />
            {heroImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goToPrevHero}
                  className="absolute left-3 top-[40%] hidden -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-md transition hover:bg-white sm:block lg:left-6 z-20"
                  aria-label="Previous hero"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0E2A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={goToNextHero}
                  className="absolute right-3 top-[40%] hidden -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-md transition hover:bg-white sm:block lg:right-6 z-20"
                  aria-label="Next hero"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0E2A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-16 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-white/70 px-2.5 py-1.5 backdrop-blur z-20">
                  {heroImages.map((_, i) => {
                    const isActiveDot = i === (heroIndexByBrand[activeBrand] || 0);
                    return (
                      <button
                        key={`dot-${i}`}
                        type="button"
                        onClick={() => goToHeroIndex(i)}
                        className={`h-2 w-2 rounded-full ${isActiveDot ? "bg-[#0E2A4A]" : "border border-gray-300 bg-white/80"}`}
                        aria-label={`Go to hero ${i + 1}`}
                      />
                    );
                  })}
                </div>
              </>
            )}
            {/* Gradient Overlay to blend Hero into background */}
            <div className="absolute inset-x-0 bottom-0 h-32 lg:h-48 bg-gradient-to-t from-[#f5f5f5] to-transparent pointer-events-none z-10" />
          </div>
        ) : (
          <div
            className={`relative mx-auto flex h-[260px] w-full max-w-[1440px] items-center px-6 sm:h-[400px] lg:h-[500px] sm:px-10 lg:px-16 ${
              activeBrand === "Miniput" ? "bg-[var(--mk-navy)]" : "bg-[#1f3a1f]"
            }`}
          >
            <div className="-mt-16">
              <h1
                className={`tracking-tighter leading-none text-white drop-shadow-md ${
                  activeBrand === "Miniput"
                    ? "mk-bebas text-[clamp(48px,10vw,120px)]"
                    : "text-5xl lg:text-7xl italic font-black [font-family:'Nunito',sans-serif]"
                }`}
              >
                {activeBrand.toUpperCase()}
              </h1>
            </div>
            {/* Gradient Overlay to blend Hero into background */}
            <div className="absolute inset-x-0 bottom-0 h-32 lg:h-48 bg-gradient-to-t from-[#f5f5f5] to-transparent pointer-events-none z-10" />
          </div>
        )}
      </section>

      {/* FLOATING PROMO TAGS */}
      <div className="sticky top-[60px] lg:top-[75px] z-30 mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 lg:-mt-28 mb-4 lg:mb-6">
        <div className="flex gap-2 overflow-x-auto bg-white/50 rounded-xl lg:rounded-2xl shadow-sm p-3 border border-gray-100 items-center mk-scroll-hidden">
          <button
            type="button"
            onClick={() =>
              setActivePromoTagByBrand((prev) => ({
                ...prev,
                [activeBrand]: "all"
              }))
            }
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-[10px] font-black ${
              activePromoTag === "all"
                ? "border-[#0E2A4A] bg-[#0E2A4A] text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            ALL OFFERS
          </button>

          {promoTags.map((tag, index) => {
            const normalizedTag = normalizeText(tag);
            const isActive = normalizedTag && normalizedTag === normalizeText(activePromoTag);

            return (
              <button
                key={`${activeBrand}-promo-${index}`}
                type="button"
                onClick={() =>
                  setActivePromoTagByBrand((prev) => ({
                    ...prev,
                    [activeBrand]: tag
                  }))
                }
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-[11px] lg:text-[12px] font-black tracking-wide transition ${
                  isActive
                    ? "border-[#0E2A4A] bg-[#0E2A4A] text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {String(tag || "").toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* FLOATING PRODUCTS MAIN SECTION */}
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 sm:px-6 lg:px-8 relative z-20">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
            <p className="text-gray-400 font-semibold text-lg">Loading products...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
            <p className="text-red-400 font-semibold text-lg">{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
            <p className="text-slate-400 font-semibold text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() =>
                  navigate(`/product/${product.id}`, {
                    state: { product }
                  })
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
