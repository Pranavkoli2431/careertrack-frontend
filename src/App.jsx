import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ApplicationsPage from "./pages/ApplicationsPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ModulePlaceholder from "./pages/ModulePlaceholder";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route element={<PublicRoute />}>
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route path="/applications" element={<ApplicationsPage />} />

          <Route
            path="/profile"
            element={
              <ModulePlaceholder
                title="Profile"
                description="Manage your personal and professional information."
              />
            }
          />

          <Route
            path="/skills"
            element={
              <ModulePlaceholder
                title="Skills"
                description="Add and manage your technical and professional skills."
              />
            }
          />

          <Route
            path="/education"
            element={
              <ModulePlaceholder
                title="Education"
                description="Maintain your academic qualifications."
              />
            }
          />

          <Route
            path="/experiences"
            element={
              <ModulePlaceholder
                title="Experience"
                description="Manage internships and professional experience."
              />
            }
          />

          <Route
            path="/projects"
            element={
              <ModulePlaceholder
                title="Projects"
                description="Showcase your strongest development projects."
              />
            }
          />

          <Route
            path="/certifications"
            element={
              <ModulePlaceholder
                title="Certifications"
                description="Store and manage your professional certificates."
              />
            }
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;


