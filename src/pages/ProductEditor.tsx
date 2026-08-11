import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import ProductForm, { type ProductValues } from "../components/ProductForm";
import { useAuth } from "../context/AuthContext";
import { createProduct, deleteProduct, getProductById, updateProduct } from "../lib/firebase/firestore";

const ProductEditor: React.FC = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { user, authReady } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productQuery = useQuery({ queryKey: ["product", id], queryFn: () => getProductById(id!), enabled: isEditing });
  const invalidateProducts = () => queryClient.invalidateQueries({ queryKey: ["products"] });
  const saveMutation = useMutation({
    mutationFn: (values: ProductValues) => isEditing
      ? updateProduct(id!, values)
      : createProduct({ ...values, rating: { rate: 0, count: 0 } }).then(() => undefined),
    onSuccess: async () => { await invalidateProducts(); navigate("/"); },
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(id!),
    onSuccess: async () => { await invalidateProducts(); navigate("/"); },
  });

  if (authReady && !user) return <Navigate to="/Login" replace />;
  if (!authReady || (isEditing && productQuery.isPending)) return <div className="page">Loading product...</div>;
  if (isEditing && !productQuery.data) return <div className="page">Product not found.</div>;

  const error = saveMutation.error || deleteMutation.error;
  return (
    <main className="page" style={{ maxWidth: 760 }}>
      <div className="page-header"><div><h1 className="page-title">{isEditing ? "Edit product" : "Add product"}</h1></div><Link className="btn btn-outline-primary" to="/">Cancel</Link></div>
      {error && <p className="form-message text-danger bg-white">Unable to save product. Please try again.</p>}
      <ProductForm key={productQuery.data?.id ?? "new"} product={productQuery.data} submitLabel={isEditing ? "Save changes" : "Create product"} submitting={saveMutation.isPending} onSubmit={(values) => saveMutation.mutate(values)} />
      {isEditing && <div className="mt-4"><button className="btn btn-outline-danger" disabled={deleteMutation.isPending} onClick={() => { if (window.confirm("Delete this product? This cannot be undone.")) deleteMutation.mutate(); }}>{deleteMutation.isPending ? "Deleting..." : "Delete product"}</button></div>}
    </main>
  );
};

export default ProductEditor;
