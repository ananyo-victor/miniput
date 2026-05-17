import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router";
import ProductCard from "../components/products/ProductCard";
import { fetchProducts } from "../store/productsSlice";
import { setActiveBrand, setActiveCategory } from "../store/homeSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const { activeBrand, activeCategory } = useSelector((state) => state.home);

  const [activePromoTagByBrand, setActivePromoTagByBrand] = useState({
    Miniput: "all",
    Kwink: "all"
  });
  const [heroIndexByBrand, setHeroIndexByBrand] = useState({
    Miniput: 0,
    Kwink: 0
  });
  const [homeContentByBrand, setHomeContentByBrand] = useState({
    Miniput: { ...emptyBrandContent },
    Kwink: { ...emptyBrandContent }
  });

  useEffect(() => {
    dispatch(fetchProducts(false));
  }, [dispatch]);

  useEffect(() => {
    const loadHomeContent = async () => {
      try {
        const [miniputRes, kwinkRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/content/home/miniput`),
          axios.get(`${API_BASE_URL}/api/content/home/kwink`)
        ]);

        setHomeContentByBrand({
          Miniput: {
            heroImageUrls: Array.isArray(miniputRes?.data?.heroImageUrls)
              ? miniputRes.data.heroImageUrls.slice(0, 4)
              : [],
            promoTags: Array.isArray(miniputRes?.data?.promoTags) ? miniputRes.data.promoTags : []
          },
          Kwink: {
            heroImageUrls: Array.isArray(kwinkRes?.data?.heroImageUrls)
              ? kwinkRes.data.heroImageUrls.slice(0, 4)
              : [],
            promoTags: Array.isArray(kwinkRes?.data?.promoTags) ? kwinkRes.data.promoTags : []
          }
        });
      } catch {
        setHomeContentByBrand({
          Miniput: { ...emptyBrandContent },
          Kwink: { ...emptyBrandContent }
        });
      }
    };

    loadHomeContent();
  }, []);

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
      const brandMatch = normalizeText(product.brand) === normalizeText(activeBrand);

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
    <div className="flex-1 flex flex-col">
      <section className={`relative overflow-hidden h-[200px] sm:h-[300px]`}>
        {activeHeroImage ? (
          <div className="w-full h-full relative">
            <img
              src={activeHeroImage}
              alt={`${activeBrand} hero`}
              className="w-full h-full object-fill sm:object-contain object-center transition-opacity duration-1000"
            />

            {heroImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goToPrevHero}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md"
                  aria-label="Previous hero"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0E2A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={goToNextHero}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md"
                  aria-label="Next hero"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0E2A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {heroImages.map((_, i) => {
                    const isActiveDot = i === (heroIndexByBrand[activeBrand] || 0);
                    return (
                      <button
                        key={`dot-${i}`}
                        type="button"
                        onClick={() => goToHeroIndex(i)}
                        className={`w-2 h-2 rounded-full ${isActiveDot ? "bg-[#0E2A4A]" : "bg-white/80 border"}`}
                        aria-label={`Go to hero ${i + 1}`}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            className={`relative max-w-6xl h-full mx-auto flex justify-between items-end gap-4 ${activeBrand === "Miniput" ? "bg-[var(--mk-yellow)]" : "bg-[#5A7A3A]"
              }`}
          >
            <div className="p-8 pb-12">
              <h1
                className={`tracking-tighter leading-none ${activeBrand === "Miniput"
                    ? "mk-bebas text-[clamp(36px,6vw,72px)] bg-[linear-gradient(90deg,#E85A1D,#FFB800,#3aa34a,#0E2A4A,#c03fa1)] bg-clip-text text-transparent"
                    : "text-4xl italic font-black text-white [font-family:'Nunito',sans-serif]"
                  }`}
              >
                {activeBrand}
              </h1>
              <p className="text-xs font-black tracking-[0.3em] opacity-90 mt-2">
                {activeBrand === "Miniput" ? "KIDS" : "YOUR SHIRT, YOUR STORY"}
              </p>
            </div>
          </div>
        )}
      </section>

      <div className="bg-white border-b border-gray-100 sticky top-[100px] z-30 ">

        <div className="flex gap-2 overflow-x-auto px-4 py-3">
          <button
            type="button"
            onClick={() =>
              setActivePromoTagByBrand((prev) => ({
                ...prev,
                [activeBrand]: "all"
              }))
            }
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] font-black tracking-wide transition text ${activePromoTag === "all"
                ? "border-[#0E2A4A] bg-[#0E2A4A] text-white"
                : "border-gray-300 bg-white text-gray-600"
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
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-black tracking-wide transition ${isActive
                    ? "border-[#0E2A4A] bg-[#0E2A4A] text-white"
                    : "border-gray-300 bg-white text-gray-600"
                  }`}
              >
                {String(tag || "").toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      <main className="p-4 sm:p-8 flex-1 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="text-center text-gray-400 py-20 font-semibold">Loading products...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-20 font-semibold">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-400 py-20 font-semibold">No products found</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
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
