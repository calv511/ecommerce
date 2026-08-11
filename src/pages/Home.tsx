import type { Product } from "../types/types";
import ProductCard from "../components/ProductCard";
import { useProductContext } from "../context/ProductContext";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../lib/firebase/firestore";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home: React.FC = () => {
  const { products, dispatch, selectedCategory } = useProductContext();
  const { user } = useAuth();

  const {
    data: allProductsData,
    isPending,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  useEffect(() => {
    if (allProductsData) {
      dispatch({ type: "SET_PRODUCTS", payload: allProductsData });
    }
  }, [dispatch, allProductsData]);

  const categories = [...new Set(products.map((product) => product.category))];

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Shop all products</h1>
          <p className="page-subtitle">
            {isPending
              ? "Loading products..."
              : error
                ? "Could not load products"
                : `${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"}${selectedCategory ? ` in ${selectedCategory}` : ""}`}
          </p>
        </div>
        {user && (
          <Link className="btn btn-primary" to="/products/new">
            Add product
          </Link>
        )}
      </div>

      <div className="toolbar">
        <label className="toolbar-label" htmlFor="category-filter">
          Category
        </label>
        <select
          id="category-filter"
          className="form-select w-auto"
          onChange={(e) =>
            dispatch({ type: "SET_SELECTED_CATEGORY", payload: e.target.value })
          }
          value={selectedCategory}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option value={category} key={category}>
              {category}
            </option>
          ))}
        </select>
        {selectedCategory ? (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() =>
              dispatch({ type: "SET_SELECTED_CATEGORY", payload: "" })
            }
          >
            Clear filter
          </button>
        ) : null}
      </div>

      {isPending ? (
        <div className="empty-state">
          <p className="mb-0">Loading products...</p>
        </div>
      ) : error ? (
        <div className="form-message form-message--error" role="alert">
          Could not load products: {error.message}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          {selectedCategory ? (
            <p className="mb-0">No products in {selectedCategory}.</p>
          ) : (
            <>
              <p>The catalog is empty.</p>
              {user ? (
                <Link className="btn btn-primary" to="/products/new">
                  Add the first product
                </Link>
              ) : (
                <p className="mb-0">Sign in to add the first product.</p>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {filteredProducts.map((product: Product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
