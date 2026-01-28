import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

function Navbar({ search, setSearch, category, setCategory, user, setUser }) {
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const count = cart.reduce((s, i) => s + i.qty, 0);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
    navigate("/");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        padding: "14px 24px",
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Link
        to="/"
        style={{
          textDecoration: "none",
          fontSize: "24px",
          fontWeight: "700",
          color: "#111827",
          whiteSpace: "nowrap",
        }}
      >
        CoreMarket
      </Link>

      <div style={{ display: "flex", gap: "10px", flex: 1 }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
          }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
          }}
        >
          <option value="All">All</option>
          <option value="Accessories">Accessories</option>
          <option value="Clothing">Clothing</option>
          <option value="Electronics">Electronics</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none", color: "#2563eb" }}>
          🏠 Home
        </Link>

        <Link to="/cart" style={{ textDecoration: "none", color: "#2563eb" }}>
          🛒 Cart ({count})
        </Link>

        {user ? (
          <>
            <span style={{ fontWeight: "500" }}>👤 {user.username}</span>
            <span
              onClick={logout}
              style={{ color: "#ef4444", cursor: "pointer", fontWeight: "500" }}
            >
              Logout
            </span>
          </>
        ) : (
          <Link to="/login" style={{ textDecoration: "none", color: "#2563eb" }}>
            🔐 Login
          </Link>
        )}
      </div>
    </div>
  );
}

export default Navbar;
