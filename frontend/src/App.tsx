import { Navigate, Route, Routes } from "react-router-dom";
import { AuthHydrate } from "./components/AuthHydrate";
import { Layout } from "./components/Layout";
import { ThemeSync } from "./components/ThemeSync";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Budgets } from "./pages/Budgets";
import { Dashboard } from "./pages/Dashboard";
import { Goals } from "./pages/Goals";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Settings } from "./pages/Settings";
import { Transactions } from "./pages/Transactions";

export default function App() {
  return (
    <>
      <AuthHydrate />
      <ThemeSync />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
