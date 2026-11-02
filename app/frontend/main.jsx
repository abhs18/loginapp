import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const csrf = () => document.querySelector('meta[name="csrf-token"]')?.content;

const api = (path, method = "GET", body) =>
  fetch(path, {
    method,
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf() },
    body: body ? JSON.stringify(body) : undefined,
  });

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    const res = await api("/api/login", "POST", { email, password });
    if (res.ok) window.location.reload();
    else setError((await res.json()).error);
  }

  async function handleLogout() {
    await api("/api/logout", "DELETE");
    window.location.reload();
  }

  if (loading) return <p>Loading...</p>;

  if (user) {
    return (
      <div>
        <h1>Welcome, {user.email}!</h1>
        <button onClick={handleLogout}>Log out</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <h1>Login</h1>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <br />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <br />
      <button type="submit">Log in</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}

createRoot(document.getElementById("root")).render(<App />);