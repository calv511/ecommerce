import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ProductProvider } from './context/ProductContext';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
function App() {
  const client = new QueryClient()
  return (
    <QueryClientProvider client={client}>
    <ProductProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/profile" element={<Profile/>}/>
      </Routes>
    </BrowserRouter>
    </ProductProvider>
    </QueryClientProvider>
  )
}

export default App
