
import { useCartContext } from "../context/useCartContext";

const Cart: React.FC = () => {
  const { items, removeFromCart } = useCartContext();

  return (
    <div className="container py-4">
      <h2 className="mb-4">Shopping Cart</h2>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {items.map((item) => (
            <div key={item.id} className="card p-3 shadow-sm">
              <div className="row g-3 align-items-center">
                <div className="col-md-2 text-center">
                  <img src={item.image} alt={item.title} className="img-fluid" style={{ maxHeight: 120 }} />
                </div>
                <div className="col-md-8">
                  <h5 className="mb-1">{item.title}</h5>
                  <p className="mb-1">Price: ${item.price}</p>
                  <p className="mb-0">Count: {item.quantity}</p>
                </div>
                <div className="col-md-2 text-md-end">
                  <button className="btn btn-outline-danger" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cart;