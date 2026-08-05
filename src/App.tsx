import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ProductProvider } from './context/ProductContext';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "./app/store";
import Cart from "./components/Cart";
import { AuthProvider } from "./context/AuthContext";

function App() {
  const client = new QueryClient();

  return (
    <QueryClientProvider client={client}>
      <Provider store={store}>
        <ProductProvider>
          <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </BrowserRouter>
          </AuthProvider>
        </ProductProvider>
      </Provider>
    </QueryClientProvider>
  );
}

export default App
