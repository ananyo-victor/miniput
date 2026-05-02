import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { ShoppingCart, LogOut } from "lucide-react";
import { fetchProducts } from "../../store/productsSlice";
import { addToCart, createOrderThunk, setCustomerField } from "../../store/customerSlice";

const fallbackImage = "https://images.unsplash.com/photo-1522771917563-ee55471f1b66?w=400";

export default function CustomerPage({ onLogout }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const customer = useSelector((s) => s.customer);
  const products = useSelector((s) => s.products.items);

  const total = useMemo(() => customer.cart.reduce((sum, item) => sum + Number(item.price || 0), 0), [customer.cart]);

  useEffect(() => {
    dispatch(fetchProducts(false)).unwrap().catch((err) => console.error(`Unable to load products: ${err.message}`));
  }, [dispatch]);

  const submitOrder = async () => {
    if (!customer.address.trim()) return alert("Please enter your address");
    if (!customer.cart.length) return alert("Cart is empty");

    const items = customer.cart.map((i) => ({ _id: i._id, name: i.name, category: i.category, price: i.price, quantity: 1 }));
    const itemStr = customer.cart.map((i) => `*Product:* ${i.name}\n*ID:* ${i._id}\n*Qty:* 1 @ Rs ${i.price}`).join("\n\n");

    try {
      await dispatch(createOrderThunk({ customerPhone: customer.phone.trim(), items, totalPrice: total, address: customer.address.trim() })).unwrap();
      const message = `*NEW ORDER RECEIVED*\n\n*Items:*\n${itemStr}\n\n*Grand Total: Rs ${total}*\n\n*Address:*\n${customer.address.trim()}`;
      window.open(`https://wa.me/8597903406?text=${encodeURIComponent(message)}`);
      alert("Order submitted successfully.");
    } catch (error) {
      alert(`Order submission failed: ${error.message}`);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-stone-50">
      <header className="flex justify-between items-center px-4 py-4 bg-white border-b border-slate-200">
        <strong className="text-lg font-bold">MINIPUT x KWINK</strong>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => (customer.cart.length ? dispatch(setCustomerField({ key: "isCheckoutOpen", value: true })) : alert("Cart is empty"))} 
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 flex items-center gap-2"
          >
            <ShoppingCart size={18} /> Cart ({customer.cart.length})
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="p-4 grid grid-cols-2 gap-3">
        {products.map((p) => (
          <div key={p._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <img src={p.imageUrl || fallbackImage} alt={p.name} className="w-full h-40 object-cover" />
            <div className="p-2.5">
              <div className="text-sm font-medium">{p.name}</div>
              <strong className="text-lg text-blue-600">Rs {p.price}</strong>
              <button onClick={() => dispatch(addToCart(p))} className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 text-sm">Add to Cart</button>
            </div>
          </div>
        ))}
      </main>

      {customer.isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/30 z-110 p-4">
          <div className="bg-white mt-32 rounded-2xl p-4">
            <h2 className="text-lg font-bold mb-4">Checkout</h2>
            <textarea value={customer.address} onChange={(e) => dispatch(setCustomerField({ key: "address", value: e.target.value }))} rows={3} placeholder="Enter your full shop address" className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4" />
            <div className="mb-4 space-y-1">
              {customer.cart.map((item, idx) => <div key={`${item._id}-${idx}`} className="text-sm">{item.name} - Rs {item.price}</div>)}
            </div>
            <h3 className="text-lg font-bold mb-4">Total: Rs {total}</h3>
            <button onClick={submitOrder} className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 mb-2">Buy Now via WhatsApp</button>
            <button onClick={() => dispatch(setCustomerField({ key: "isCheckoutOpen", value: false }))} className="w-full bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-400">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
