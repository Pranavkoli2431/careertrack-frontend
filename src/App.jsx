import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ApplicationsPage from "./pages/ApplicationsPage";
import CertificationsPage from "./pages/CertificationsPage";
import DashboardPage from "./pages/DashboardPage";
import EducationPage from "./pages/EducationPage";
import ExperiencePage from "./pages/ExperiencePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ProjectsPage from "./pages/ProjectsPage";
import RegisterPage from "./pages/RegisterPage";
import SkillsPage from "./pages/SkillsPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/applications"
            element={<ApplicationsPage />}
          />

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

          <Route
            path="/skills"
            element={<SkillsPage />}
          />

          <Route
            path="/education"
            element={<EducationPage />}
          />

          <Route
            path="/experiences"
            element={<ExperiencePage />}
          />

          <Route
            path="/projects"
            element={<ProjectsPage />}
          />

          <Route
            path="/certifications"
            element={<CertificationsPage />}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default App;