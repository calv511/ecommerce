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
    <div className="cart-item-media">
      <img
        src={imageSrc}
        alt={alt}
        onError={() => {
          if (imageSrc !== fallbackImage) {
            setImageSrc(fallbackImage);
          }
        }}
      />
    </div>
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
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Shopping cart</h1>
          <p className="page-subtitle">
            {totalItems === 0
              ? "Nothing here yet"
              : `${totalItems} ${totalItems === 1 ? "item" : "items"}`}
          </p>
        </div>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/")}
        >
          Continue shopping
        </button>
      </div>

      {checkoutMessage ? (
        <div className="form-message form-message--success" role="status">
          {checkoutMessage}
        </div>
      ) : null}
      {checkoutError ? (
        <div className="form-message form-message--error" role="alert">
          {checkoutError}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Browse products
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="d-flex flex-column gap-3">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <CartItemImage
                  key={item.id}
                  src={item.image}
                  alt={item.title}
                />

                <div>
                  <h2 className="cart-item-title">{item.title}</h2>
                  <p className="cart-item-price">
                    ${item.price.toFixed(2)} each
                  </p>
                  <label
                    className="field-label"
                    htmlFor={`quantity-${item.id}`}
                  >
                    Quantity
                  </label>
                  <input
                    id={`quantity-${item.id}`}
                    type="number"
                    min="1"
                    className="form-control form-control-sm cart-qty"
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

                <div className="cart-item-actions text-end">
                  <div className="product-price mb-2">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => dispatch(removeFromCart(item.id))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <h2 className="section-title">Order summary</h2>
            <div className="cart-summary-row">
              <span>Items</span>
              <span>{totalItems}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="cart-summary-total">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <button
              className="btn btn-success w-100 mt-3"
              onClick={handleCheckout}
              disabled={items.length === 0 || isSaving}
            >
              {isSaving ? "Placing order..." : "Checkout"}
            </button>
            {!user ? (
              <p className="page-subtitle text-center mt-2 mb-0">
                You'll need to sign in first.
              </p>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
