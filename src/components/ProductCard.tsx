import type { Product } from "../types/types"
import { Rating } from '@smastrom/react-rating';
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../app/store";
import { addToCart } from "../features/cart/cartSlice";
import fallbackImage from "../assets/hero.png";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProductCard:React.FC<{product: Product}> = ({product}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isAdded, setIsAdded] = useState(false);
  const [imageSrc, setImageSrc] = useState(product.image);
  const { user } = useAuth();

  useEffect(() => {
    if (!isAdded) {
      return;
    }

    const timer = window.setTimeout(() => setIsAdded(false), 1500);

    return () => window.clearTimeout(timer);
  }, [isAdded]);

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    setIsAdded(true);
  };

  return (
    <div className="col">
      <article className="product-card">
        <div className="product-media">
          <img
            key={product.id}
            src={imageSrc}
            alt={product.title}
            loading="lazy"
            onError={() => {
              if (imageSrc !== fallbackImage) {
                setImageSrc(fallbackImage);
              }
            }}
          />
        </div>

        <div className="product-body">
          <span className="product-category">{product.category}</span>
          <h3 className="product-title" title={product.title}>
            {product.title}
          </h3>

          <div className="product-rating">
            <Rating style={{ maxWidth: 88 }} value={product.rating.rate} readOnly />
            <span className="product-rating-count">
              {product.rating.rate} ({product.rating.count})
            </span>
          </div>

          <p className="product-desc">{product.description}</p>

          <div className="product-footer">
            <span className="product-price">${product.price.toFixed(2)}</span>
            <div className="d-flex gap-2 align-items-center">
              {user && <Link className="btn btn-sm btn-outline-primary" to={`/products/${product.id}/edit`}>Edit</Link>}
              <button
                className={`btn btn-sm ${isAdded ? "btn-success" : "btn-primary"}`}
                onClick={handleAddToCart}
              >
                {isAdded ? "Added ✓" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

export default ProductCard
