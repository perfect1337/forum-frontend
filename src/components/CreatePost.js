import React, { useState, useContext, useEffect } from "react";
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
  const [currentUser, setCurrentUser] = useState({ 
    username: null,
    userId: null,
    role: 'user'
  });

  // Улучшенный парсер JWT токена
  const parseJwtToken = (token) => {
    try {
      console.log("Original token:", token);
      
      if (!token || typeof token !== 'string') {
        throw new Error('Token is missing or not a string');
      }
      
      // Удаляем возможные кавычки и префикс "Bearer "
      token = token.replace(/^"(.*)"$/, '$1').replace(/^Bearer\s+/i, '');
      
      console.log("Processed token:", token);
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error(`Invalid token format: expected 3 parts, got ${parts.length}`);
      }
  
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Token parsing error:", err);
      localStorage.removeItem('access_token');
      return null;
    }
  };
  // Получаем данные пользователя из токена
  useEffect(() => {
    const getUserData = () => {
      const token = localStorage.getItem("access_token");
      console.log("Token from localStorage:", token); // Добавьте этот лог
      
      if (!token) return null;
      
      try {
        const payload = parseJwtToken(token);
        console.log("Parsed payload:", payload); // Добавьте этот лог
        
        if (!payload) return null;
        
        return {
          username: payload.username || payload.sub || "User",
          userId: payload.user_id || payload.sub,
          role: payload.role || 'user'
        };
      } catch (err) {
        console.error("Failed to parse token:", err);
        return null;
      }
    };
  
    if (isAuthenticated) {
      const userData = getUserData();
      console.log("User data from token:", userData); // Добавьте этот лог
      if (userData) {
        setCurrentUser(userData);
      }
    }
  }, [isAuthenticated]);

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
      if (!token) {
        throw new Error("No authentication token found");
      }
  
      // Проверяем токен перед отправкой
      const payload = parseJwtToken(token);
      console.log("Token payload:", payload); // Добавьте этот лог
      
      if (!payload) {
        throw new Error("Invalid token - parsing failed");
      }
  
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        throw new Error("Token expired");
      }
  
      const response = await axios.post(
        "http://localhost:8081/posts",
        {
          title: formData.title,
          content: formData.content,
          authorId: payload.user_id || payload.sub, // Используем ID из токена
          authorName: payload.username || payload.sub // Используем имя из токена
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );
      
      setFormData({ title: "", content: "" });
      if (onPostCreated) onPostCreated(response.data);
    } catch (err) {
      console.error("Post creation error:", err);
      setError(err.response?.data?.error || err.message || "Failed to create post");
      
      // Если ошибка связана с токеном, предлагаем перелогиниться
      if (err.message.includes("token")) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem('access_token');
      }
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
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "1rem" 
      }}>
        <h2>Create New Post</h2>
        {currentUser.username && (
          <div style={{ 
            fontSize: "0.9rem", 
            color: "#666",
            background: "#f5f5f5",
            padding: "0.5rem 1rem",
            borderRadius: "20px"
          }}>
            Posting as: <strong style={{ color: "#333" }}>{currentUser.username}</strong>
          </div>
        )}
      </div>
      
      {error && (
        <div style={{ 
          color: "#dc3545", 
          marginBottom: "1rem", 
          padding: "0.5rem", 
          background: "#f8d7da", 
          border: "1px solid #f5c6cb", 
          borderRadius: "4px"
        }}>
          {error}
        </div>
      )}

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
          disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
          style={{
            padding: "0.75rem 1.5rem",
            background: isSubmitting || !formData.title.trim() || !formData.content.trim() 
              ? "#cccccc" 
              : "#007bff",
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