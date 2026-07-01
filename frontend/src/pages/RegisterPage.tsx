import { useState } from "react";
import { register } from "../services/authService";

interface Props {
  onRegister: () => void;
  onLoginClick: () => void;
}

// Password must be 8+ chars, have uppercase, lowercase, number, and symbol
const validatePassword = (pwd: string) => {
  const errors = [];
  if (pwd.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(pwd)) errors.push("One uppercase letter");
  if (!/[a-z]/.test(pwd)) errors.push("One lowercase letter");
  if (!/[0-9]/.test(pwd)) errors.push("One number");
  if (!/[^A-Za-z0-9]/.test(pwd)) errors.push("One symbol (!@#$...)");
  return errors;
};

const RegisterPage = ({ onRegister, onLoginClick }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordErrors = validatePassword(password);
  const strength = 5 - passwordErrors.length; // 0–5

  const strengthLabel = ["", "Weak", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-emerald-400"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordErrors.length > 0) {
      setError("Password doesn't meet requirements.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(email, password);
      onRegister();
    } catch {
      setError("Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex-col justify-between p-12">
        <div>
          <span className="text-blue-400 font-bold text-xl tracking-wide">FX Tracker</span>
        </div>
        <div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Start tracking<br />currencies today.
          </h1>
          <p className="text-slate-400 text-lg">
            Free account. No credit card. Live exchange rates powered by Frankfurter.
          </p>
        </div>
        <div className="flex gap-6 text-slate-500 text-sm">
          <span>EUR · USD · GBP</span>
          <span>CHF · JPY · CAD</span>
        </div>
      </div>

      <div className="flex-1 bg-slate-950 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8">
            <span className="text-blue-400 font-bold text-xl">FX Tracker</span>
          </div>

          <h2 className="text-white text-2xl font-semibold mb-1">Create account</h2>
          <p className="text-slate-400 text-sm mb-8">Free forever. Sign up in seconds.</p>

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
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />

              {/* Strength bar — only shows once user starts typing */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-slate-700"}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-start">
                    <ul className="text-xs text-slate-500 space-y-0.5">
                      {passwordErrors.map((e) => (
                        <li key={e} className="flex items-center gap-1">
                          <span className="text-red-500">✗</span> {e}
                        </li>
                      ))}
                    </ul>
                    {strength > 0 && (
                      <span className="text-xs font-medium" style={{color: strength >= 4 ? '#34d399' : strength === 3 ? '#60a5fa' : '#f87171'}}>
                        {strengthLabel}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg bg-slate-800 border text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition
                  ${confirm.length > 0 && confirm !== password
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : confirm.length > 0 && confirm === password
                    ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500"
                    : "border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                  }`}
              />
              {confirm.length > 0 && confirm !== password && (
                <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
              )}
              {confirm.length > 0 && confirm === password && (
                <p className="text-emerald-400 text-xs mt-1">Passwords match ✓</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || passwordErrors.length > 0 || password !== confirm}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-slate-500 text-sm text-center mt-6">
            Already have an account?{" "}
            <span
              onClick={onLoginClick}
              className="text-blue-400 hover:text-blue-300 cursor-pointer transition"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;