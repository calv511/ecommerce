import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrderById } from "../lib/firebase/firestore";

const OrderDetail: React.FC = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderById(orderId!),
    enabled: Boolean(orderId && user),
    retry: false,
  });

  if (isLoading) {
    return <div className="page"><p className="page-subtitle">Loading order...</p></div>;
  }

  if (isError || !order || order.userId !== user?.uid) {
    return (
      <div className="page">
        <h1 className="page-title">Order not found</h1>
        <p className="page-subtitle">This order does not exist or is not available to you.</p>
        <Link className="btn btn-primary" to="/profile">Back to profile</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Order {order.id}</h1>
          <p className="page-subtitle">
            {order.createdAt?.toDate().toLocaleDateString(undefined, {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
        <Link to="/profile" className="btn btn-outline-primary">Back to orders</Link>
      </div>

      <section className="card-panel">
        <h2 className="section-title">Items</h2>
        <ul className="order-detail-list">
          {order.items.map((item) => (
            <li key={item.id} className="order-detail-item">
              <img src={item.image} alt={item.title} />
              <div className="order-detail-product">
                <div className="order-date">{item.title}</div>
                <div className="order-meta">${item.price.toFixed(2)} each · Quantity: {item.quantity}</div>
              </div>
              <div className="order-total">${(item.price * item.quantity).toFixed(2)}</div>
            </li>
          ))}
        </ul>
        <div className="order-detail-total">Order total <span>${order.totalPrice.toFixed(2)}</span></div>
      </section>
    </div>
  );
};

export default OrderDetail;
