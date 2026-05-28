import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import ProductCard from "../components/products/ProductCard";
import { fetchProducts } from "../store/productsSlice";
import { fetchWorkspaceHomeContentThunk, setActiveCategory } from "../store/homeSlice";
import { setActiveWorkspaceLocal } from "../store/userSlice";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCardSkeleton from "../components/skeletonLoader/ProductCardSkeleton";

const ITEMS_PER_PAGE = 24;

const normalizeText = (value) => String(value || "").trim().toLowerCase();
const normalizeCategory = (value) => normalizeText(value).replace(/[\s_-]+/g, "");

const CATEGORY_ALIASES = {
  tshirt: ["tshirt", "shirt", "tee"],
  jeans: ["jeans", "pant", "pants", "trouser", "trousers"],
  jacket: ["jacket", "hoodie", "coat"],
  set: ["set", "sets", "dress", "combo"],
  shorts: ["short", "shorts"],
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

const productMatchesPromoTag = (product, tag) => {
  const normalizedTag = normalizeText(tag);
  if (!normalizedTag || normalizedTag === "all") return true;

  const effectivePrice = product.isDiscountActive ? Number(product.finalPrice) : Number(product.price);

  const priceCap = parsePriceCapFromTag(normalizedTag);
  if (priceCap !== null) return effectivePrice <= priceCap;

  const percentOff = parsePercentOffFromTag(normalizedTag);
  if (percentOff !== null) {
    if (product.isDiscountActive && Number(product.discountPercent) >= percentOff) return true;
    const basePrice = Number(product.originalPrice ?? product.price);
    if (basePrice > 0 && basePrice > effectivePrice) {
      return ((basePrice - effectivePrice) / basePrice) * 100 >= percentOff;
    }
  }

  return [product.name, product.category, product.description]
    .map((item) => normalizeText(item))
    .join(" ")
    .includes(normalizedTag);
};

const productMatchesSearchQuery = (product, query) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    product?.name,
    product?.articleId,
    product?.category,
    product?.description
  ];

  return searchableValues
    .map((item) => normalizeText(item))
    .join(" ")
    .includes(normalizedQuery);
};

const HomePage = () => {
  const { workspaceSlug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items: products, loading, error } = useSelector((state) => state.products);
  const { activeCategory, searchQuery, homeContent } = useSelector((state) => state.home);
  const workspaces = useSelector((state) => state.workspace.items);
  const activeWorkspace = useSelector((state) => state.user.activeWorkspace);
  const activeWorkspaceId = useSelector((state) => state.user.selectedWorkspaceId);

  const [activePromoTag, setActivePromoTag] = useState("all");
  const [heroIndex, setHeroIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!workspaceSlug || !workspaces.length) return;
    const workspace = workspaces.find((item) => item.slug === workspaceSlug);
    if (!workspace) return;
    dispatch(setActiveWorkspaceLocal(workspace));
    dispatch(setActiveCategory("all"));
  }, [dispatch, workspaceSlug, workspaces]);

  useEffect(() => {
    if (!activeWorkspace && workspaces.length) {
      navigate(`/home/${workspaces[0].slug}`, {
        replace: true,
      });
    }
  }, [activeWorkspace, navigate, workspaces]);

  useEffect(() => {
    if (!activeWorkspaceId) return;
    dispatch(fetchProducts({ includeHidden: false, workspaceId: activeWorkspaceId }));
    dispatch(fetchWorkspaceHomeContentThunk(activeWorkspaceId));
  }, [dispatch, activeWorkspaceId]);

  const heroImages = homeContent.heroImageUrls || [];
  const promoTags = homeContent.promoTags || [];

  useEffect(() => {
    setHeroIndex(0);
    setActivePromoTag("all");
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (heroIndex >= heroImages.length) setHeroIndex(0);
  }, [heroImages, heroIndex]);

  useEffect(() => {
    if (heroImages.length < 2) return;
    const interval = setInterval(() => setHeroIndex((prev) => (prev + 1) % heroImages.length), 5000);
    return () => clearInterval(interval);
  }, [heroImages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeWorkspaceId, activeCategory, activePromoTag, searchQuery]);

  const filteredProducts = useMemo(() => {
    const normalizedActiveCategory = normalizeCategory(activeCategory);
    const acceptedCategories = new Set((CATEGORY_ALIASES[normalizedActiveCategory] || [normalizedActiveCategory]).map(normalizeCategory));

    return products.filter((product) => {
      const categoryMatch = normalizedActiveCategory === "all" || acceptedCategories.has(normalizeCategory(product.category));
      return categoryMatch
        && productMatchesPromoTag(product, activePromoTag)
        && productMatchesSearchQuery(product, searchQuery);
    });
  }, [products, activeCategory, activePromoTag, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const activeHeroImage = heroImages.length ? heroImages[Math.min(heroIndex, heroImages.length - 1)] : "";

  return (
    <div className="flex-1 flex flex-col bg-[#f5f5f5]">
      <section className="relative overflow-hidden bg-white">
        {activeHeroImage ? (
          <div className="relative mx-auto w-full md:h-[500px]">
            <img src={activeHeroImage} alt={`${activeWorkspace?.name || "Workspace"} hero`} className="h-full w-full object-cover object-top transition-opacity duration-1000" />
            <div className="absolute inset-x-0 bottom-0 h-24 lg:h-36 bg-gradient-to-t from-[#f5f5f5] to-transparent pointer-events-none"></div>
            {heroImages.length > 1 && (
              <>
                <button type="button" onClick={() => setHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)} className="absolute left-3 top-1/3 hidden -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-md transition hover:bg-white sm:block lg:left-6 text-[#0E2A4A]"><ChevronLeft size={20} /></button>
                <button type="button" onClick={() => setHeroIndex((prev) => (prev + 1) % heroImages.length)} className="absolute right-3 top-1/3 hidden -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-md transition hover:bg-white sm:block lg:right-6 text-[#0E2A4A]"><ChevronRight size={20} /></button>
              </>
            )}
          </div>
        ) : (
          <div className="relative mx-auto flex h-[200px] w-full max-w-[1440px] items-end justify-between gap-4 sm:h-[240px] lg:h-[300px] bg-[#0E2A4A]">
            <div className="px-6 pb-12 sm:px-10 lg:px-16">
              <h1 className="tracking-tighter leading-none mk-bebas text-[clamp(36px,6vw,72px)] text-white">{activeWorkspace?.name || "Workspace"}</h1>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-24 lg:h-36 bg-gradient-to-t from-[#f5f5f5] to-transparent pointer-events-none"></div>
          </div>
        )}
      </section>

      <div className="relative z-20 mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 -mt-12 lg:-mt-24">
        <div className="bg-white/50 shadow-sm border border-gray-200 rounded-2xl p-3 mb-6 flex gap-2 overflow-x-auto mk-scroll-hidden">
          <button type="button" onClick={() => setActivePromoTag("all")} className={`whitespace-nowrap rounded-full border px-4 py-2 text-[10px] font-black tracking-wide transition ${activePromoTag === "all" ? "border-[#0E2A4A] bg-[#0E2A4A] text-white" : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>ALL OFFERS</button>
          {promoTags.map((tag, index) => {
            const isActive = normalizeText(tag) === normalizeText(activePromoTag);
            return (
              <button key={`${activeWorkspaceId}-promo-${index}`} type="button" onClick={() => setActivePromoTag(tag)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-[10px] font-black tracking-wide transition ${isActive ? "border-[#0E2A4A] bg-[#0E2A4A] text-white" : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"}`}>{String(tag || "").toUpperCase()}</button>
            );
          })}
        </div>

        <main className="pb-16">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 mb-10">
              {Array.from({ length: 12 }).map((_, index) => (
                <ProductCardSkeleton
                  key={`skeleton-${index}`}
                />
              ))}
            </div>

          ) : error ? (
            <div className="text-center text-red-400 py-20 font-semibold bg-white rounded-xl shadow-sm">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-gray-400 py-20 font-semibold bg-white rounded-xl shadow-sm">No products found</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 mb-10">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onClick={(item) => navigate(`/product/${item.id}`, { state: { product: item } })} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pb-6">
                  <button type="button" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 disabled:opacity-50">PREV</button>
                  <span className="text-xs font-bold text-gray-500">{currentPage} / {totalPages}</span>
                  <button type="button" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 disabled:opacity-50">NEXT</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default HomePage;
