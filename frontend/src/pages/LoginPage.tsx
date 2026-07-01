import { useState } from "react";
import { login } from "../services/authService";

interface Props {
  onLogin: () => void;
  onRegisterClick: () => void;
}

const LoginPage = ({ onLogin, onRegisterClick }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      onLogin();
    } catch {
      setError("Wrong email or password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel — visible on medium screens and up */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex-col justify-between p-12">
        <div>
          <span className="text-blue-400 font-bold text-xl tracking-wide">FX Tracker</span>
        </div>
        <div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Real-time currency<br />rates at a glance.
          </h1>
          <p className="text-slate-400 text-lg">
            Track, compare, and monitor exchange rates — all in one place.
          </p>
        </div>
        <div className="flex gap-6 text-slate-500 text-sm">
          <span>EUR · USD · GBP</span>
          <span>CHF · JPY · CAD</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 bg-slate-950 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="md:hidden mb-8">
            <span className="text-blue-400 font-bold text-xl">FX Tracker</span>
          </div>

          <h2 className="text-white text-2xl font-semibold mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-8">Sign in to your account</p>

          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition mt-2"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-slate-500 text-sm text-center mt-6">
            Don't have an account?{" "}
            <span
              onClick={onRegisterClick}
              className="text-blue-400 hover:text-blue-300 cursor-pointer transition"
            >
              Create one
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;