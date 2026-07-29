import { useProductContext } from "../context/ProductContext"
import type { Product } from "../types/types"

const Profile:React.FC = () => {
  const { products } = useProductContext()
  return (
    <div>
      {products.map((product:Product)=>(
        <h1>{product.title}</h1>
      ))}
    </div>
  )
}

export default Profile