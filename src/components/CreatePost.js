import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const CreatePost = ({ onPostCreated }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: "",
    content: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        "http://localhost:8081/posts",
        {
          title: formData.title,
          content: formData.content
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      setFormData({ title: "", content: "" });
      if (onPostCreated) onPostCreated(response.data);
    } catch (err) {
      console.error("Post creation error:", err);
      setError(err.response?.data?.error || err.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{ 
      margin: "2rem 0", 
      padding: "1.5rem", 
      border: "1px solid #e1e1e1", 
      borderRadius: "8px", 
      background: "#fff", 
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <h2>Create New Post</h2>
      {error && <div style={{ 
        color: "#dc3545", 
        marginBottom: "1rem", 
        padding: "0.5rem", 
        background: "#f8d7da", 
        border: "1px solid #f5c6cb", 
        borderRadius: "4px"
      }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "1rem"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="title" style={{ fontWeight: "500" }}>Title:</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={100}
            style={{
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "1rem"
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="content" style={{ fontWeight: "500" }}>Content:</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={5}
            style={{
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "1rem",
              minHeight: "120px",
              resize: "vertical"
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "0.75rem 1.5rem",
            background: isSubmitting ? "#cccccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontSize: "1rem",
            transition: "background 0.2s",
            alignSelf: "flex-start"
          }}
        >
          {isSubmitting ? (
            <>
              <span style={{
                display: "inline-block",
                width: "1rem",
                height: "1rem",
                border: "2px solid rgba(255,255,255,0.3)",
                borderRadius: "50%",
                borderTopColor: "white",
                animation: "spin 1s ease-in-out infinite",
                marginRight: "0.5rem"
              }} />
              Creating...
            </>
          ) : (
            "Create Post"
          )}
        </button>
      </form>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CreatePost;