import { useContext } from "react";
import { CartContext } from "../context/CartContext";

function Cart() {
  const { cart, updateQty, removeFromCart, clearCart } =
    useContext(CartContext);

  const total = cart.reduce(
    (sum, item) => sum + item.qty * parseFloat(item.price),
    0
  );

  const smallBtn = {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#e5e7eb",
    fontWeight: "600",
  };

  return (
    <div style={{ padding: "32px", maxWidth: "900px", margin: "0 auto" }}>
      <h2>Your Cart</h2>

      {cart.length === 0 && <p>Your cart is empty.</p>}

      {cart.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "12px",
            marginBottom: "12px",
            background: "#fff",
          }}
        >
          <img
            src={item.image}
            alt={item.name}
            style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
          />

          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0 }}>{item.name}</h4>
            <p style={{ margin: "4px 0", color: "#2563eb" }}>
              ₹{item.price}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              style={smallBtn}
              onClick={() => updateQty(item.id, -1)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#d1d5db")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#e5e7eb")
              }
            >
              −
            </button>

            <span style={{ minWidth: "20px", textAlign: "center" }}>
              {item.qty}
            </span>

            <button
              style={smallBtn}
              onClick={() => updateQty(item.id, 1)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#d1d5db")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#e5e7eb")
              }
            >
              +
            </button>
          </div>

          <button
            onClick={() => removeFromCart(item.id)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              background: "#ef4444",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "600",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#dc2626")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#ef4444")
            }
          >
            Remove
          </button>
        </div>
      ))}

      {cart.length > 0 && (
        <>
          <h3 style={{ marginTop: "20px" }}>
            Total: ₹{total.toFixed(2)}
          </h3>

          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button
              onClick={clearCart}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Clear Cart
            </button>

            <button
              style={{
                background: "#16a34a",
                color: "#fff",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#15803d")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#16a34a")
              }
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
