import axios, {type AxiosResponse} from 'axios';
import type { Category, Product } from '../types/types';

const apiClient = axios.create({
    baseURL: 'https://fakestoreapi.com'
})

export const fetchProducts = ():Promise<AxiosResponse<Product[]>> => apiClient.
get<Product[]>('/products')

export const fetchProductsByCategory = (category: string): Promise<AxiosResponse<Product[]>> =>
    apiClient.get<Product[]>(`/products/category/${category}`)

export const fetchCategories = ():Promise<AxiosResponse<Category[]>> => apiClient.
get<Category[]>('/products/categories')