import type { Product } from "../types/types"
import { Rating } from '@smastrom/react-rating';
import { useEffect, useState } from "react";
import { useCartContext } from "../context/useCartContext";

const ProductCard:React.FC<{product: Product}> = ({product}) => {
  const { addToCart } = useCartContext();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (!isAdded) {
      return;
    }

    const timer = window.setTimeout(() => setIsAdded(false), 1500);

    return () => window.clearTimeout(timer);
  }, [isAdded]);

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
  };

  return (
    <div className="col-md-5 p-3 d-flex flex-column align-items-center gap-3 shadow">
        <h3>{product.title}</h3>
        <img src={product.image} alt={product.title} className="w-25"/>
        <p>${product.price}</p>
        <h5>{product.category.toUpperCase()}</h5>
        <Rating style={{ maxWidth: 150 }} value={product.rating.rate} readOnly/>
        <p>Ratings: {product.rating.count}</p>
        <p>{product.description}</p>
        <button className={`btn ${isAdded ? "btn-success" : "btn-primary"}`} onClick={handleAddToCart}>
          {isAdded ? "Added to Cart" : "Add to Cart"}
        </button>
    </div>
  )
}

export default ProductCard