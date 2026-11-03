import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles/app.css";

const csrf = () => document.querySelector('meta[name="csrf-token"]')?.content;

const api = (path, method = "GET", body) =>
  fetch(path, {
    method,
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf() },
    body: body ? JSON.stringify(body) : undefined,
  });

function AuthForm() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  function switchMode(next) {
    setMode(next);
    setError("");
    setNotice("");
    setPassword("");
    setConfirm("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (isSignup && password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setBusy(true);
    try {
      const res = await api(
        isSignup ? "/api/signup" : "/api/login",
        "POST",
        isSignup
          ? { email, password, password_confirmation: confirm }
          : { email, password }
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      if (isSignup) {
        switchMode("login");
        setNotice("Account created! Please log in.");
      } else {
        window.location.reload();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h1>{isSignup ? "Create account" : "Welcome back"}</h1>
      <p className="subtitle">
        {isSignup ? "Sign up to get started" : "Log in to your account"}
      </p>

      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder={isSignup ? "At least 8 characters" : "Your password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={isSignup ? 8 : undefined}
            required
          />
        </div>

        {isSignup && (
          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
        )}

        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
        </button>
      </form>

      <p className="switch">
        {isSignup ? "Already have an account? " : "Don't have an account? "}
        <button
          type="button"
          className="link-btn"
          onClick={() => switchMode(isSignup ? "login" : "signup")}
        >
          {isSignup ? "Log in" : "Sign up"}
        </button>
      </p>
    </div>
  );
}

function Welcome({ user }) {
  async function handleLogout() {
    await api("/api/logout", "DELETE");
    window.location.reload();
  }

  return (
    <div className="card welcome">
      <div className="avatar">{user.email[0].toUpperCase()}</div>
      <h1>Welcome!</h1>
      <p className="email">{user.email}</p>
      <button className="btn btn-secondary" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page">
      {loading ? null : user ? <Welcome user={user} /> : <AuthForm />}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);