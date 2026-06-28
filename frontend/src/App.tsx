import { useState } from "react";
import { isAuthenticated } from "./services/authService";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

const App = () => {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [page, setPage] = useState<"login" | "register">("login");

  if (authenticated) {
    return <DashboardPage onLogout={() => setAuthenticated(false)} />;
  }

  return page === "login" ? (
    <LoginPage
      onLogin={() => setAuthenticated(true)}
      onRegisterClick={() => setPage("register")}
    />
  ) : (
    <RegisterPage
      onRegister={() => setPage("login")}
      onLoginClick={() => setPage("login")}
    />
  );
};

export default App;