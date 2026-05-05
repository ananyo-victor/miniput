import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteProductThunk, quickAddStockThunk, toggleProductVisibilityThunk } from "../../store/adminSlice";
import { fetchProducts } from "../../store/productsSlice";

const statusMeta = (stock) => {
  if (stock > 50) return { key: "in-stock", label: "IN STOCK", tone: "bg-green-100 text-green-700" };
  if (stock > 15) return { key: "limited", label: "LIMITED", tone: "bg-amber-100 text-amber-700" };
  return { key: "low", label: "LOW", tone: "bg-red-100 text-red-700" };
};

const AdminInventory = () => {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.products);

  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchProducts(true));
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") {
      return products;
    }

    if (activeFilter === "hidden") {
      return products.filter((item) => item.isHidden);
    }

    return products.filter((item) => statusMeta(Number(item.stock || 0)).key === activeFilter);
  }, [activeFilter, products]);

  const counts = useMemo(() => {
    const map = { all: products.length, "in-stock": 0, limited: 0, low: 0, hidden: 0 };

    products.forEach((product) => {
      map[statusMeta(Number(product.stock || 0)).key] += 1;
      if (product.isHidden) {
        map.hidden += 1;
      }
    });

    return map;
  }, [products]);

  const filters = [
    { id: "all", label: "ALL" },
    { id: "in-stock", label: "IN STOCK" },
    { id: "limited", label: "LIMITED" },
    { id: "low", label: "LOW" },
    { id: "hidden", label: "HIDDEN" }
  ];

  const inventoryData = [
  { name: 'Pant Set', brand: 'KWINK', sizes: '26,28,30,32,34,36', price: 499, status: 'in-stock', units: 85, emoji: '👖' },
  { name: 'Babla Shirt', brand: 'MINIPUTT', sizes: '26,28,30,32,34,36', price: 399, status: 'in-stock', units: 90, emoji: '👔' },
  { name: 'Lear Shirt', brand: 'MINIPUTT', sizes: '26,28,30,32,34,36', price: 479, status: 'limited', units: 65, emoji: '👕' },
  { name: 'Pant', brand: 'MINIPUTT', sizes: '26,28,30,32,34,36', price: 479, status: 'limited', units: 37, emoji: '👖' },
  { name: 'Sweater', brand: 'KWINK', sizes: '26,28,30,32,34,36', price: 499, status: 'low', units: 8, emoji: '🧶' },
  { name: 'Coat', brand: 'MINIPUTT', sizes: '26,28,30,32,34,36', price: 399, status: 'in-stock', units: 78, emoji: '🧥' },
];

return (
    <div className="flex-col min-h-screen bg-[#f5f5f5]">

      {/* Inventory Filtering Tabs (Shown in image) */}
      <div className="inv-tabs flex px-3.5 pt-2.5 pb-0 gap-5 bg-white border-b border-[#eee]">
        <div className="inv-tab active in-stock pb-2 text-[13px] font-black tracking-[0.5px] cursor-pointer border-b-3 border-current text-[#2d7d46]">IN STOCK</div>
        <div className="inv-tab limited pb-2 text-[13px] font-black tracking-[0.5px] cursor-pointer border-b-3 border-transparent text-[#999] hover:text-[#d49000]">LIMITED</div>
        <div className="inv-tab low pb-2 text-[13px] font-black tracking-[0.5px] cursor-pointer border-b-3 border-transparent text-[#999] hover:text-[#D63031]">LOW/OUT</div>
      </div>

      {/* Inventory List (Main focus) */}
      <div className="inv-list flex-1 overflow-y-auto px-4 py-3 pb-[100px] md:px-8 md:py-4">
        {inventoryData.map((item, index) => (
          <div key={index} className="inv-item flex items-center gap-3 bg-white rounded-2xl p-3.5 mb-2.5 shadow-md">
            {/* Image Placeholder */}
            <div className="inv-img flex items-center justify-center flex-shrink-0 w-16 h-16 rounded-xl bg-[#e8e8e8] text-[28px]">
              {item.emoji}
            </div>

            {/* Left Info */}
            <div className="inv-info flex-1">
              <div className="inv-name text-sm font-black text-[#1a1a1a] uppercase">{item.name}</div>
              <div className="inv-brand text-xs font-bold text-[#0E2A4A] mb-1">{item.brand}</div>
              <div className="inv-sizes text-xs text-[#666] tracking-wide mb-0.5">SIZE {item.sizes}</div>
            </div>

            {/* Right Price/Status */}
            <div className="inv-price-right flex-col items-end text-right">
              {/* Status Badge */}
              <div className={`status-badge text-xs font-black tracking-wide px-2 py-0.75 rounded-full mb-1 inline-block ${
                  item.status === 'in-stock' ? 'bg-[#e6f4ea] text-[#2d7d46]' :
                  item.status === 'limited' ? 'bg-[#fff8e1] text-[#d49000]' :
                  'bg-[#fde8e8] text-[#D63031]'
                }`}>
                {item.status.toUpperCase()}
              </div>
              
              {/* Unit Count */}
              <div className="inv-unit-count text-xs text-[#999] leading-tight">{item.units} UNITS</div>
              
              {/* Price */}
              <div className="inv-price text-lg font-black text-[#1a1a1a]">₹{item.price}/-</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminInventory;