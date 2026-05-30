import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router";
import ProductDetail from "../components/products/ProductDetail";
import { addToCart, openAuthModal } from "../store/customerSlice";
import { fetchProducts } from "../store/productsSlice";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((state) => state.products);
  const authed = useSelector((state) => state.customer.authed);
  const [hasRequestedProducts, setHasRequestedProducts] = useState(false);
  const isWaitingForProducts = !products.length && !hasRequestedProducts;

  const selectedProduct = useMemo(
    () => location.state?.product || products.find((item) => item.id === productId),
    [location.state, productId, products]
  );

  const currentIndex = useMemo(
    () => products.findIndex((item) => item.id === selectedProduct?.id),
    [products, selectedProduct]
  );

  const goToIndex = (index) => {
    if (index < 0 || index >= products.length) return;
    const nextProduct = products[index];
    navigate(`/product/${nextProduct.id}`, { state: { product: nextProduct } });
  };

  useEffect(() => {
    if (!products.length && !hasRequestedProducts) {
      setHasRequestedProducts(true);
      dispatch(fetchProducts(false));
    }
  }, [dispatch, hasRequestedProducts, products.length]);

  useEffect(() => {
    if (!loading && !isWaitingForProducts && !selectedProduct) {
      navigate("/home", { replace: true });
    }
  }, [isWaitingForProducts, loading, navigate, selectedProduct]);

  if (!selectedProduct) return null;

  return (
    <ProductDetail
      product={selectedProduct}
      onBack={() => navigate("/home")}
      onPrev={() => goToIndex(currentIndex - 1)}
      onNext={() => goToIndex(currentIndex + 1)}
      onAddToCart={(payload) => dispatch(addToCart(payload))}
      onOrderNow={(payload) => {
        if (authed) {
          navigate("/order", {
            state: {
              directOrderItem: payload,
            },
          });
        } else {
          dispatch(openAuthModal());
        }
      }}
    />
  );
};

export default ProductDetailPage;
