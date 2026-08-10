import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import "bootstrap/dist/css/bootstrap.min.css";
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

const client = new QueryClient();

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
                <Route path="/cart" element={<Cart />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/Logout" element={<Logout />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ProductProvider>
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
