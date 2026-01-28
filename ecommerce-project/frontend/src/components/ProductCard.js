import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";

function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  }

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        padding: "14px",
        borderRadius: "14px",
        boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
        background: "#fff",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.12)";
        const overlay = e.currentTarget.querySelector(".img-overlay");
        overlay.style.opacity = "0.25";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
        const overlay = e.currentTarget.querySelector(".img-overlay");
        overlay.style.opacity = "0";
      }}
    >
      <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden" }}>
        <img
          src={product.image}
          alt={product.name}
          style={{ width: "100%", height: "220px", objectFit: "cover" }}
        />
        <div
          className="img-overlay"
          style={{
            position: "absolute",
            inset: 0,
            background: "black",
            opacity: 0,
            transition: "opacity 0.2s ease",
          }}
        />
      </div>

      <h3 style={{ margin: "10px 0 4px" }}>{product.name}</h3>
      <p style={{ margin: "2px 0", fontWeight: "600", color: "#2563eb" }}>
        ₹{product.price}
      </p>

      <p
        style={{
          fontSize: "13px",
          color: "#555",
          marginTop: "6px",
          minHeight: "38px",
        }}
      >
        {product.description}
      </p>

      <button
        onClick={handleAdd}
        style={{
          marginTop: "10px",
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "none",
          background: added ? "#16a34a" : "#2563eb",
          color: "#fff",
          cursor: "pointer",
          fontWeight: "600",
          transition: "background 0.2s ease, transform 0.1s ease",
        }}
        onMouseEnter={(e) => {
          if (!added) e.currentTarget.style.background = "#1e40af";
        }}
        onMouseLeave={(e) => {
          if (!added) e.currentTarget.style.background = "#2563eb";
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(0.97)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {added ? "Added ✓" : "Add to Cart"}
      </button>
    </div>
  );
}

export default ProductCard;
