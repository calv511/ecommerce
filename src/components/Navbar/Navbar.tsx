import { useAuth } from "../../context/AuthContext";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import "./Navbar.css";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "link is-active" : "link";

const Navbar = () => {
  const { user } = useAuth();
  const items = useSelector((state: RootState) => state.cart.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="nav-container">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="nav-brand-mark" aria-hidden="true">
            🛍
          </span>
          <span className="nav-brand-text">Storefront</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/cart" className={navLinkClass}>
            Cart{totalItems > 0 ? ` (${totalItems})` : ""}
          </NavLink>
        </div>

        <div className="nav-links nav-links--end">
          {user ? (
            <>
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
              <NavLink to="/logout" className={navLinkClass}>
                Logout
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <Link to="/register" className="link link--cta">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
