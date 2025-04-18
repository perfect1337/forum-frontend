import React, { useState } from "react";
import axios from "axios";

const Login = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/auth/login", 
        { email, password },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
        onSuccess();
      } else {
        throw new Error("No access token received");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <button 
          type="submit"
          style={{ 
            padding: "8px 16px", 
            background: "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "4px" 
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;