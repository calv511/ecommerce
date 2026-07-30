// import { useEffect} from "react";
import type { Category, Product } from "../types/types";
import ProductCard from "../components/ProductCard";
import { useProductContext } from "../context/ProductContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchProducts, fetchProductsByCategory } from "../api/api";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

const Home:React.FC = () => {
    const navigate = useNavigate();
    const { products, dispatch, selectedCategory } = useProductContext();
    const items = useSelector((state: RootState) => state.cart.items);

    const { data: allProductsData } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts,
    });

    const { data: categoryProductsData } = useQuery({
        queryKey: ['products', selectedCategory],
        queryFn: () => fetchProductsByCategory(selectedCategory),
        enabled: Boolean(selectedCategory),
    });

    useEffect(() => {
        if (allProductsData) {
            dispatch({ type: 'SET_PRODUCTS', payload: allProductsData.data });
        }
    }, [dispatch, allProductsData]);

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const filteredProducts = selectedCategory
        ? (categoryProductsData?.data ?? [])
        : products;

  return (
    <div>
        <select onChange={(e) =>
            dispatch({ type: "SET_SELECTED_CATEGORY", payload: e.target.value })
        }
            value={selectedCategory}
        >
        <option value=''>All Categories</option>
        {categories?.data.map((category: Category) => (
            <option value={category} key={category}>{category}</option>
        ))}
        </select>
        <button
            className='btn'
            onClick={() => dispatch({ type: 'SET_SELECTED_CATEGORY', payload: '' })}
        >
            Clear Filter
        </button>
        <button onClick={()=>navigate('/profile')}>Go to Profile Page</button>
        <button onClick={()=>navigate('/cart')}>Go to Cart ({items.length})</button>
    <div className="d-flex flex-wrap gap-5 justify-content-center">
        {filteredProducts.map((product: Product)=>(
            <ProductCard product={product} key={product.id}/>
        ))}
    </div>
    </div>
  )
}

export default Home