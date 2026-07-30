import type { Product } from "../types/types"
import { Rating } from '@smastrom/react-rating';
import { useCartContext } from "../context/CartContext";

const ProductCard:React.FC<{product: Product}> = ({product}) => {
  const { addToCart } = useCartContext();

  return (
    <div className="col-md-5 p-3 d-flex flex-column align-items-center gap-3 shadow">
        <h3>{product.title}</h3>
        <img src={product.image} alt={product.title} className="w-25"/>
        <p>${product.price}</p>
        <h5>{product.category.toUpperCase()}</h5>
        <Rating style={{ maxWidth: 150 }} value={product.rating.rate} readOnly/>
        <p>Ratings: {product.rating.count}</p>
        <p>{product.description}</p>
        <button className="btn btn-primary" onClick={() => addToCart(product)}>
          Add to Cart
        </button>
    </div>
  )
}

export default ProductCard