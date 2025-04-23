import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentTexts, setCommentTexts] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const { isAuthenticated } = useContext(AuthContext);
  const [currentUsername, setCurrentUsername] = useState(null);

  // Получаем username из JWT токена
  useEffect(() => {
    const getUsernameFromToken = () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return null;

        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.username || null;
      } catch (err) {
        console.error("Error parsing token:", err);
        return null;
      }
    };

    if (isAuthenticated) {
      const username = getUsernameFromToken();
      setCurrentUsername(username);
    } else {
      setCurrentUsername(null);
    }
  }, [isAuthenticated]);

  // Обработчики комментариев
  const handleCommentChange = (postId, text) => {
    setCommentTexts(prev => ({
      ...prev,
      [postId]: text
    }));
  };

  const handleAddComment = async (postId) => {
    if (!commentTexts[postId]?.trim()) return;
  
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `http://localhost:8081/posts/${postId}/comments`, // или /comments/post/${postId}
        { text: commentTexts[postId] },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
  
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, comments: [...(post.comments || []), response.data] }
          : post
      ));
      setCommentTexts(prev => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Error adding comment:", err);
      setError(err.response?.data?.error || "Failed to add comment");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.delete(
        `http://localhost:8081/posts/${postId}/comments/${commentId}`, // Обновленный URL
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
  
      setPosts(posts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.filter(c => c.id !== commentId)
            }
          : post
      ));
    } catch (err) {
      console.error("Full error details:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.error || "Failed to delete comment");
    }
  };
  // Остальные обработчики (для постов)
  const handleDeletePost = async (postId) => {
    if (!isAuthenticated) {
      alert("You need to be logged in to delete a post.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`http://localhost:8081/posts/${postId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.error || "Failed to delete post");
    }
  };


  const newLocal = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
  
      const response = await axios.get("http://localhost:8081/posts", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: { includeComments: true }
      });
  
      // Убедитесь, что комментарии есть в ответе
      console.log("Fetched posts:", response.data);
      setPosts(response.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err.response?.data?.error || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };
  const fetchPosts = newLocal;

  useEffect(() => {
    fetchPosts();
  }, [isAuthenticated]);

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Recent Posts</h2>
      {posts.length === 0 ? (
        <p>No posts yet. Be the first to post!</p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {posts.map((post) => (
            <div key={post.id} style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "5px",
              position: "relative"
            }}>
              {isAuthenticated && currentUsername === post.author && (
                <button
                  onClick={() => handleDeletePost(post.id)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "#ff4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "5px 10px",
                    cursor: "pointer"
                  }}
                >
                  Delete Post
                </button>
              )}

              <h3 style={{ marginTop: "40px" }}>{post.title}</h3>
              <p>{post.content}</p>

              <div style={{ marginTop: "15px" }}>
                <button
                  onClick={() => setExpandedComments(prev => ({
                    ...prev,
                    [post.id]: !prev[post.id]
                  }))}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#007bff",
                    cursor: "pointer",
                    padding: "5px 0"
                  }}
                >
                  {expandedComments[post.id] ? "Hide" : "Show"} Comments (
                  {post.comments?.length || 0})
                </button>

                {expandedComments[post.id] && (
                  <div style={{ marginTop: "10px" }}>
                  {post.comments?.map(comment => (
    <div key={comment.id} style={{
        padding: "10px",
        margin: "5px 0",
        background: "#f5f5f5",
        borderRadius: "4px",
        position: "relative"
    }}>
        <p>{comment.text}</p>
        <small>
            By: <strong>{comment.author}</strong> at {new Date(comment.created_at).toLocaleString()}
        </small>
        
        {isAuthenticated && currentUsername === comment.author && (
            <button
                onClick={() => handleDeleteComment(post.id, comment.id)}
                style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#ff4444",
                    fontSize: "1.2rem"
                }}
            >
                ×
            </button>
        )}
    </div>
))}

                    {isAuthenticated && (
                      <div style={{ marginTop: "15px" }}>
                        <textarea
                          value={commentTexts[post.id] || ""}
                          onChange={(e) => handleCommentChange(post.id, e.target.value)}
                          placeholder="Write a comment..."
                          style={{
                            width: "100%",
                            padding: "8px",
                            marginBottom: "5px",
                            border: "1px solid #ddd",
                            borderRadius: "4px"
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentTexts[post.id]?.trim()}
                          style={{
                            padding: "5px 10px",
                            background: !commentTexts[post.id]?.trim() ? "#cccccc" : "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: !commentTexts[post.id]?.trim() ? "not-allowed" : "pointer"
                          }}
                        >
                          Add Comment
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;