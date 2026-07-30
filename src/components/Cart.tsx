
import { useState } from "react";
import { useCartContext } from "../context/useCartContext";

const Cart: React.FC = () => {
  const { items, removeFromCart, clearCart } = useCartContext();
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    clearCart();
    setCheckoutMessage("Checkout successful. Your cart has been cleared.");
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Shopping Cart</h2>
      {checkoutMessage ? (
        <div className="alert alert-success" role="alert">
          {checkoutMessage}
        </div>
      ) : null}
      <div className="card p-3 mb-4 shadow-sm bg-light">
        <div className="row g-3">
          <div className="col-md-6">
            <strong>Total products:</strong> {totalItems}
          </div>
          <div className="col-md-6 text-md-end">
            <strong>Total price:</strong> ${totalPrice.toFixed(2)}
          </div>
        </div>
        <div className="mt-3 text-md-end">
          <button
            className="btn btn-success"
            onClick={handleCheckout}
            disabled={items.length === 0}
          >
            Checkout
          </button>
        </div>
      </div>
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