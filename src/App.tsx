import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import { ProductProvider } from "./context/ProductContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "./app/store";
import Cart from "./components/Cart";
import { AuthProvider } from "./context/AuthContext";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Navbar from "./components/Navbar/Navbar";
import CartSync from "./features/cart/CartSync";
import ProductEditor from "./pages/ProductEditor";
import OrderDetail from "./pages/OrderDetail";
import { useAuth } from "./context/AuthContext";
import type { ReactNode } from "react";
const client = new QueryClient();
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, authReady } = useAuth();

  if (!authReady) return null;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
function App() {
  return (
    <QueryClientProvider client={client}>
      <Provider store={store}>
        <ProductProvider>
          <AuthProvider>
            <CartSync />
            <BrowserRouter>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route
                  path="/orders/:orderId"
                  element={
                    <RequireAuth>
                      <OrderDetail />
                    </RequireAuth>
                  }
                />
                <Route path="/cart" element={<Cart />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/Logout" element={<Logout />} />
                <Route
                  path="/products/new"
                  element={
                    <RequireAuth>
                      <ProductEditor />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/products/:id/edit"
                  element={
                    <RequireAuth>
                      <ProductEditor />
                    </RequireAuth>
                  }
                />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ProductProvider>
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
