import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8001/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Save in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      // Update React state so Navbar changes immediately
      setUser({ token: data.token, username: data.username });

      setSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch {
      setError("Server error");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    fontSize: "15px",
    cursor: "pointer",
    background: success ? "#16a34a" : "#2563eb",
    color: "white",
    transition: "background 0.2s ease",
  };

  return (
    <div style={{ maxWidth: "420px", margin: "90px auto" }}>
      <h2 style={{ fontSize: "28px", marginBottom: "24px" }}>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          style={inputStyle}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          style={inputStyle}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}

        <button
          style={buttonStyle}
          onMouseEnter={(e) => {
            if (!success) e.target.style.background = "#1d4ed8";
          }}
          onMouseLeave={(e) => {
            if (!success)
              e.target.style.background = success ? "#16a34a" : "#2563eb";
          }}
        >
          {success ? "Logged in successfully" : "Login"}
        </button>

        <div style={{ textAlign: "center", marginTop: "18px", color: "#6b7280" }}>
          OR
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "8px",
            color: "#2563eb",
            cursor: "pointer",
            fontWeight: "500",
          }}
          onClick={() => navigate("/register")}
        >
          Register
        </div>
      </form>
    </div>
  );
}

export default Login;
