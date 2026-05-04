import React, { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router";
import ProductDetail from "../../components/customer/ProductDetail";
import { DEMO_PRODUCTS } from "../../data/demoProducts";
import { addToCart } from "../../store/customerSlice";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const products = DEMO_PRODUCTS;
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
    navigate(`/customer/product/${nextProduct.id}`, { state: { product: nextProduct } });
  };

  useEffect(() => {
    if (!selectedProduct) {
      navigate("/customer/shop", { replace: true });
    }
  }, [selectedProduct, navigate]);

  if (!selectedProduct) return null;

  return (
    <ProductDetail
      product={selectedProduct}
      onBack={() => navigate("/customer/shop")}
      onPrev={() => goToIndex(currentIndex - 1)}
      onNext={() => goToIndex(currentIndex + 1)}
      onAddToCart={(payload) => dispatch(addToCart(payload))}
      onOrderNow={(payload) => {
        dispatch(addToCart(payload));
        navigate("/customer/cart");
      }}
    />
  );
};

export default ProductDetailPage;
