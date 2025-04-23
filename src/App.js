import React, { useState, useEffect } from "react";
import CreatePost from "./components/CreatePost";
import Posts from "./pages/Posts";
import Register from "./components/Register";
import Login from "./components/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Chat from './components/Chat';
const AppContent = () => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    setIsAuthenticated(false);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1>Forum</h1>
  
        <div>
          {!isAuthenticated ? (
            <>
              <button onClick={() => setShowLogin(true)} style={{ marginRight: "10px" }}>Login</button>
              <button onClick={() => setShowRegister(true)}>Register</button>
            </>
          ) : (
            <button onClick={handleLogout}>Logout</button>
          )}
        </div>
      </header>

      {showLogin && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "right", alignItems: "center" }}>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "5px" }}>
            <Login onSuccess={handleLoginSuccess} />
            <button onClick={() => setShowLogin(false)} style={{ marginTop: "10px" }}>Close</button>
          </div>
        </div>
      )}

      {showRegister && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "right", alignItems: "center" }}>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "5px" }}>
            <Register />
            <button onClick={() => setShowRegister(false)} style={{ marginTop: "10px" }}>Close</button>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '20px' }}>
  <div style={{ flex: 2 }}>
    {isAuthenticated && <CreatePost />}
    <Posts />
  </div>
  <div style={{ flex: 1 }}>
    <Chat />
  </div>
</div>
      {isAuthenticated && <CreatePost />}
      <Posts />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
