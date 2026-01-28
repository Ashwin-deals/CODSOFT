import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

function Home({ search, category }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("https://codsoft-j0yg.onrender.com/api/products/")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || p.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: "24px", background: "#f5f7fa", minHeight: "100vh" }}>
      {filtered.length === 0 ? (
        <p style={{ color: "#6b7280", fontSize: "16px" }}>
          Product not available.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
