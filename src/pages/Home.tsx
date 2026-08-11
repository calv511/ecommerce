// import { useEffect} from "react";
import type { Category, Product } from "../types/types";
import ProductCard from "../components/ProductCard";
import { useProductContext } from "../context/ProductContext";
import { useQuery } from "@tanstack/react-query";
import {
  fetchCategories,
  fetchProducts,
  fetchProductsByCategory,
} from "../api/api";
import { useEffect } from "react";
const Home: React.FC = () => {
  const { products, dispatch, selectedCategory } = useProductContext();

  const { data: allProductsData } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: categoryProductsData } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: () => fetchProductsByCategory(selectedCategory),
    enabled: Boolean(selectedCategory),
  });

  useEffect(() => {
    if (allProductsData) {
      dispatch({ type: "SET_PRODUCTS", payload: allProductsData.data });
    }
  }, [dispatch, allProductsData]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const filteredProducts = selectedCategory
    ? (categoryProductsData?.data ?? [])
    : products;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Shop all products</h1>
          <p className="page-subtitle">
            {filteredProducts.length > 0
              ? `${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"}${selectedCategory ? ` in ${selectedCategory}` : ""}`
              : "Loading products..."}
          </p>
        </div>
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
          {categories?.data.map((category: Category) => (
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

      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
        {filteredProducts.map((product: Product) => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>
    </div>
  );
};

export default Home;
