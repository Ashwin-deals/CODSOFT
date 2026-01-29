import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8001"
    : "https://codsoft-j0yg.onrender.com";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // User created in Django DB
      navigate("/login");
    } catch {
      setError("Server error");
    }
  };

  return (
    <div style={{ maxWidth: "420px", margin: "90px auto" }}>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ width: "100%", padding: "12px", marginBottom: "14px" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "12px", marginBottom: "14px" }}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button style={{ width: "100%", padding: "12px" }}>
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
