import React from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, removeFromCart, updateQuantity } from "../store/customerSlice";

const CustomerCartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.customer.cart);

  const subtotal = cart.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1), 0);

  const handleQuantityChange = (id, quantity) => {
    if (quantity < 1) {
      return;
    }
    dispatch(updateQuantity({ id, quantity }));
  };

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
              to="/customer/shop"
              className="inline-block mt-5 px-5 py-3 rounded-xl text-xs font-black tracking-[0.08em] bg-[var(--mk-navy)] text-[var(--mk-yellow)]"
            >
              BACK TO SHOWROOM
            </Link>
          </div>
        </main>
      ) : (
        <main className="flex-1 bg-[var(--mk-bg)] px-4 sm:px-6 py-5 grid lg:grid-cols-[1fr_340px] gap-5">
          <section className="mk-scroll-hidden overflow-y-auto max-h-[calc(100vh-260px)] pr-1">
            {cart.map((item) => {
              const rowId = item.cartItemId || item.id || item._id;
              const quantity = Number(item.quantity || 1);
              const itemTotal = Number(item.price || 0) * quantity;

              return (
                <article key={rowId} className="mk-card p-4 sm:p-5 mb-4 flex gap-4 items-start">
                  <img
                    src={item.imageUrl || item.image || "https://via.placeholder.com/140?text=Item"}
                    alt={item.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-gray-100"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold tracking-[0.08em] text-[var(--mk-orange)]">
                      {String(item.brand || "MINIPUT").toUpperCase()}
                    </p>
                    <h3 className="text-lg font-black truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500">Rs {Number(item.price || 0).toLocaleString()} each</p>

                    <div className="mt-3 inline-flex items-center gap-3 rounded-xl bg-gray-100 border border-gray-200 p-1.5">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-lg bg-white font-black text-gray-700"
                        onClick={() => handleQuantityChange(rowId, quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-7 text-center font-black">{quantity}</span>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-lg bg-white font-black text-gray-700"
                        onClick={() => handleQuantityChange(rowId, quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => dispatch(removeFromCart(rowId))}
                      className="text-[var(--mk-red)] text-sm font-black"
                    >
                      REMOVE
                    </button>
                    <p className="mt-8 text-lg sm:text-xl font-black">Rs {itemTotal.toLocaleString()}</p>
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
              onClick={() => navigate("/customer/order")}
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

            <Link to="/customer/shop" className="block text-center mt-4 text-xs font-bold text-gray-500">
              CONTINUE SHOPPING
            </Link>
          </aside>
        </main>
      )}
    </div>
  );
};

export default CustomerCartPage;