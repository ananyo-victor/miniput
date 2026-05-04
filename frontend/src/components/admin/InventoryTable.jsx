import React from "react";

const InventoryTable = ({ products, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Product Detail</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Stock Status</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-blue-50/30 transition group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    {/* Tiny thumbnail placeholder */}
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                      <img src={product.image || 'https://via.placeholder.com/40'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 group-hover:text-blue-600 transition">
                        {product.name}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">SKU: {product.sku || `MPK-${product.id}`}</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase">
                    {product.category}
                  </span>
                </td>

                <td className="px-6 py-5 font-black text-gray-900">
                  ₹{product.price.toLocaleString()}
                </td>

                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                      <span className={`text-sm font-bold ${product.stock > 10 ? 'text-gray-700' : 'text-red-600'}`}>
                        {product.stock} in stock
                      </span>
                    </div>
                    {product.stock <= 5 && (
                      <span className="text-[10px] text-red-400 font-bold uppercase mt-1">Critical Low</span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onEdit(product)}
                      className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition duration-200"
                      title="Edit Product"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button 
                      onClick={() => onDelete(product.id)}
                      className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition duration-200"
                      title="Remove Product"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Empty State */}
      {products.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-gray-400 font-bold uppercase tracking-widest">No products found in inventory</p>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;