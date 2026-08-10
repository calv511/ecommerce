import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import {
  removeFromCart,
  setQuantity,
  clearCart,
} from "../features/cart/cartSlice";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../lib/firebase/firestore";
import fallbackImage from "../assets/hero.png";

type CartItemImageProps = {
  src: string;
  alt: string;
};

const CartItemImage: React.FC<CartItemImageProps> = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState(src);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className="img-fluid"
      style={{ maxHeight: 120 }}
      onError={() => {
        if (imageSrc !== fallbackImage) {
          setImageSrc(fallbackImage);
        }
      }}
    />
  );
};

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const items = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    setCheckoutMessage("");
    setCheckoutError("");

    if (!user) {
      setCheckoutError("Please sign in before checking out.");
      navigate("/login");
      return;
    }

    setIsSaving(true);
    try {
      await createOrder(user.uid, items, totalItems, totalPrice);
      dispatch(clearCart());
      setCheckoutMessage("Checkout successful. Your order has been placed.");
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Unable to place your order. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
        <h2 className="mb-0">Shopping Cart</h2>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate("/")}
        >
          Back Home
        </button>
      </div>
      {checkoutMessage ? (
        <div className="alert alert-success" role="alert">
          {checkoutMessage}
        </div>
      ) : null}
      {checkoutError ? (
        <div className="alert alert-danger" role="alert">
          {checkoutError}
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
            disabled={items.length === 0 || isSaving}
          >
            {isSaving ? "Placing order..." : "Checkout"}
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
                  <CartItemImage
                    key={item.id}
                    src={item.image}
                    alt={item.title}
                  />
                </div>
                <div className="col-md-8">
                  <h5 className="mb-1">{item.title}</h5>
                  <p className="mb-1">Price: ${item.price}</p>
                  <label
                    className="form-label mb-1"
                    htmlFor={`quantity-${item.id}`}
                  >
                    Quantity
                  </label>
                  <input
                    id={`quantity-${item.id}`}
                    type="number"
                    min="1"
                    className="form-control w-auto"
                    value={item.quantity}
                    onChange={(event) => {
                      const nextQuantity = Number(event.target.value);
                      if (!Number.isNaN(nextQuantity)) {
                        dispatch(
                          setQuantity({ id: item.id, quantity: nextQuantity }),
                        );
                      }
                    }}
                  />
                </div>
                <div className="col-md-2 text-md-end">
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => dispatch(removeFromCart(item.id))}
                  >
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
