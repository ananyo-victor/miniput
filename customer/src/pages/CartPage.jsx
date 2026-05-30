import React, { useEffect } from "react";
import { Trash2 } from 'lucide-react';
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, removeFromCart, updateQuantity } from "../store/cartSlice";
import { openAuthModal } from "../store/customerSlice";
import { fetchAboutThunk } from "../store/aboutSlice";

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const authed = useSelector((state) => state.auth.authed);

  const subtotal = cart.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1), 0);

  const handleQuantityChange = (id, quantity) => {
    if (quantity < 1) {
      return;
    }
    dispatch(updateQuantity({ id, quantity }));
  };

  useEffect(() => {
    dispatch(fetchAboutThunk());
  }, [dispatch]);

  return (
    <div className="mk-shell flex flex-col h-full">
      <section className="bg-[var(--mk-green)] px-5 sm:px-8 py-8 sm:py-10 text-center">
        <p className="mk-bebas text-5xl sm:text-7xl text-white tracking-[0.12em]">CART</p>
      </section>

      {cart.length === 0 ? (
        <main className="flex-1 bg-[var(--mk-bg)] p-6 sm:p-10 flex items-center justify-center">
          <div className="mk-card max-w-md w-full p-8 text-center">
            <p className="text-4xl mb-3">??</p>
            <h2 className="text-xl font-black text-[var(--mk-navy)]">Your cart is empty</h2>
            <p className="mt-2 text-sm text-gray-500">Pick products from the showroom to start a bulk order.</p>
            <Link
              to="/home"
              className="inline-block mt-5 px-5 py-3 rounded-xl text-xs font-black tracking-[0.08em] bg-[var(--mk-navy)] text-[var(--mk-yellow)]"
            >
              BACK TO SHOWROOM
            </Link>
          </div>
        </main>
      ) : (
        <main className="flex-1 bg-[var(--mk-bg)] px-4 sm:px-6 py-5">
          {/* Added a max-width container to prevent infinite stretching on Desktop */}
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_340px] gap-5 w-full">
            <section className="mk-scroll-hidden overflow-y-auto max-h-[calc(100vh-260px)] pr-1">
              {cart.map((item) => {
                const rowId = item.cartItemId || item.id || item._id;
                const quantity = Number(item.quantity || 1);
                const itemTotal = Number(item.price || 0) * quantity;

                return (
                  // Refactored layout to give space back to the middle column
                  <article key={rowId} className="relative mk-card p-4 sm:p-5 mb-4 flex gap-4">
                    <img
                      src={item.imageUrl || item.image || "https://via.placeholder.com/140?text=Item"}
                      alt={item.name}
                      className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-center object-contain bg-gray-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0 flex flex-col">
                      {/* Top Row: Title + Remove Button */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.08em] text-[var(--mk-orange)]">
                            {String(item.brand || "MINIPUT").toUpperCase()}
                          </p>
                          <h3 className="text-base sm:text-lg font-black truncate">{item.name}</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => dispatch(removeFromCart(rowId))}
                          className="text-[var(--mk-red)] tracking-wider shrink-0 mt-1"
                        >
                          <Trash2 className="size-5" />
                        </button>
                      </div>

                      {/* Middle Row: Pricing details */}
                      <div className="mt-1">
                        {item.isDiscountActive && item.originalPrice > item.price ? (
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <p className="text-xs text-gray-400 line-through">Rs {Number(item.originalPrice).toLocaleString()}</p>
                            <p className="text-xs sm:text-sm font-bold text-red-500">Rs {Number(item.price).toLocaleString()}</p>
                            <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black whitespace-nowrap">
                              {item.discountLabel}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm text-gray-500">Rs {Number(item.price || 0).toLocaleString()}</p>
                        )}
                      </div>

                      {/* Bottom Row: Quantity + Total Price */}
                      <div className="mt-3 sm:mt-4 flex flex-wrap justify-between items-center gap-3">
                        <div className="inline-flex items-center gap-2 sm:gap-3 rounded-xl bg-gray-100 border border-gray-200 p-1 sm:p-1.5 w-max">
                          <button
                            type="button"
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white font-black text-gray-700 flex items-center justify-center"
                            onClick={() => handleQuantityChange(rowId, quantity - 1)}
                            disabled={quantity <= 1}
                          >
                            -
                          </button>
                          <span className="w-5 sm:w-7 text-center font-black text-sm">{quantity}</span>
                          <button
                            type="button"
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white font-black text-gray-700 flex items-center justify-center"
                            onClick={() => handleQuantityChange(rowId, quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <p className="text-base sm:text-xl font-black shrink-0">
                          Rs {itemTotal.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="mk-card p-5 sm:p-6 h-fit sticky top-32">
              <h2 className="text-lg font-black text-[var(--mk-navy)] tracking-[0.06em]">ORDER SUMMARY</h2>
              <div className="mt-4 space-y-3 border-b border-gray-200 pb-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Items</span>
                  <span className="font-bold">{cart.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">Rs {subtotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm font-black text-gray-500">TOTAL</span>
                <span className="text-2xl font-black">Rs {subtotal.toLocaleString()}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (authed) {
                    navigate("/order");
                  } else {
                    dispatch(openAuthModal());
                  }
                }}
                className="w-full mt-5 py-3 rounded-xl bg-[var(--mk-navy)] text-[var(--mk-yellow)] text-xs font-black tracking-[0.09em]"
              >
                PLACE ORDER
              </button>

              <button
                type="button"
                onClick={() => dispatch(clearCart())}
                className="w-full mt-2 py-3 rounded-xl bg-white border border-gray-200 text-xs font-black tracking-[0.09em] text-gray-500"
              >
                CLEAR CART
              </button>

              <Link to="/home" className="block text-center mt-4 text-xs font-bold text-gray-500">
                CONTINUE SHOPPING
              </Link>
            </aside>
          </div>
        </main>
      )}
    </div>
  );
};

export default CartPage;
