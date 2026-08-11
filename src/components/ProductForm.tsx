import { useEffect, useState, type FormEvent } from "react";
import type { Product } from "../types/types";

export type ProductValues = Omit<Product, "id" | "rating">;

const emptyProduct: ProductValues = {
  title: "",
  price: 0,
  description: "",
  category: "",
  image: "",
};

interface ProductFormProps {
  product?: Product | null;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (product: ProductValues) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, submitLabel, submitting, onSubmit }) => {
  const [values, setValues] = useState<ProductValues>(emptyProduct);

  useEffect(() => {
    setValues(product ? ({ title: product.title, price: product.price, description: product.description, category: product.category, image: product.image }) : emptyProduct);
  }, [product]);

  const update = (field: keyof ProductValues, value: string) => {
    setValues((current) => ({ ...current, [field]: field === "price" ? Number(value) : value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <form className="surface p-4" onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="field-label" htmlFor="product-title">Title</label>
        <input className="form-control" id="product-title" value={values.title} onChange={(e) => update("title", e.target.value)} required />
      </div>
      <div className="mb-3">
        <label className="field-label" htmlFor="product-price">Price</label>
        <input className="form-control" id="product-price" type="number" min="0" step="0.01" value={values.price} onChange={(e) => update("price", e.target.value)} required />
      </div>
      <div className="mb-3">
        <label className="field-label" htmlFor="product-description">Description</label>
        <textarea className="form-control" id="product-description" rows={4} value={values.description} onChange={(e) => update("description", e.target.value)} required />
      </div>
      <div className="mb-3">
        <label className="field-label" htmlFor="product-category">Category</label>
        <input className="form-control" id="product-category" value={values.category} onChange={(e) => update("category", e.target.value)} required />
      </div>
      <div className="mb-4">
        <label className="field-label" htmlFor="product-image">Image URL</label>
        <input className="form-control" id="product-image" type="url" value={values.image} onChange={(e) => update("image", e.target.value)} required />
      </div>
      <button className="btn btn-primary" disabled={submitting} type="submit">{submitting ? "Saving..." : submitLabel}</button>
    </form>
  );
};

export default ProductForm;
