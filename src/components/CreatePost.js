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
    setError("");

    if (!formData.title.trim() || !formData.content.trim()) {
        setError("Title and content are required");
        return;
    }

    setIsSubmitting(true);

    try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("Authentication required");

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

  // Rest of your component code remains the same...
  const styles = {
    // ... (keep all your existing styles)
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={styles.postFormContainer}>
      <h2>Create New Post</h2>
      {error && <div style={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.postForm}>
        <div style={styles.formGroup}>
          <label htmlFor="title" style={styles.label}>Title:</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={100}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="content" style={styles.label}>Content:</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={5}
            style={styles.textarea}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            ...styles.submitButton,
            ...(isSubmitting ? styles.submitButtonDisabled : {})
          }}
          onMouseOver={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.background = '#0056b3'; // Directly use the color value
            }
          }}
          onMouseOut={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.background = '#007bff'; // Directly use the color value
            }
          }}
        >
          {isSubmitting ? (
            <>
              <span style={styles.spinner}></span>
              Creating...
            </>
          ) : (
            "Create Post"
          )}
        </button>
      </form>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CreatePost;