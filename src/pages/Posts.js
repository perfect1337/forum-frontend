import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Posts = () => {
  const [posts, setPosts] = useState([]); // Инициализируем пустым массивом
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated } = useContext(AuthContext);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      if (!token && !isAuthenticated) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get("http://localhost:8081/posts", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Убедимся, что response.data существует и является массивом
      setPosts(response.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err.response?.data?.error || "Failed to load posts");
      setPosts([]); // Сбрасываем posts в пустой массив при ошибке
      
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPosts();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;
  if (loading) return <div>Loading posts...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Recent Posts</h2>
      {posts && posts.length === 0 ? ( // Добавляем проверку на существование posts
        <p>No posts yet. Be the first to post!</p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {posts && posts.map((post) => ( // Добавляем проверку на существование posts
            <div key={post.id} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "5px" }}>
              <h3 style={{ marginTop: 0 }}>{post.title}</h3>
              <p>{post.content}</p>
              <div style={{ marginTop: "10px", color: "#666", fontSize: "0.9em" }}>
                <span>Posted by: {post.author || "Anonymous"}</span>
                <span style={{ float: "right" }}>
                  {new Date(post.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;