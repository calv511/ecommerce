import { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";
import type { Product } from "../types/types";

// Define action types
// An action is an instruction to change the state
type ProductAction = 
    { type: 'SET_PRODUCTS'; payload: Product[]}
    | {type: 'SET_SELECTED_CATEGORY'; payload: string};


interface ProductState {
    products: Product[];
    selectedCategory: string;
}

// Initial state
// const [name, setName] = useState("")
const initialState:ProductState = {
    products: [],
    selectedCategory: ''
}

// Reducer function listens for actions and changes the state based on
// the action type and returns the updated state
const productReducer = (
    state: ProductState,
    action: ProductAction
): ProductState => {
    switch (action.type) {
        case 'SET_PRODUCTS':
            return { ...state, products: action.payload };
        case 'SET_SELECTED_CATEGORY':
            return { ...state, selectedCategory: action.payload };
        default:
            throw new Error('Unhandled action type: ${action.type}');
    }
};

// create context
interface ProductContextType {
    products: Product[];
    selectedCategory: string;
    // The dispatch function allows us to trigger actions to update the state
    // const [name, setName] = useState("")
    dispatch: React.Dispatch<ProductAction>
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

// Provider component
interface ProductProviderProps {
    children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(productReducer, initialState);

    return (
        <ProductContext.Provider value={{ ...state, dispatch }}>
            {children}
        </ProductContext.Provider>
    );
};

// Custom hook for accessing the context
export const useProductContext = (): ProductContextType => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProductContext must be used within a ProductProvider');
    }
    return context;
};