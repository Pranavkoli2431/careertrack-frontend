import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

const initialSummary = {
  totalApplications: 0,
  wishlist: 0,
  applied: 0,
  assessment: 0,
  interview: 0,
  offered: 0,
  rejected: 0,
  withdrawn: 0,
};

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [summary, setSummary] = useState(initialSummary);
  const [skillsCount, setSkillsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [summaryResponse, skillsResponse] =
          await Promise.all([
            apiClient.get("/api/dashboard/summary"),
            apiClient.get("/api/skills"),
          ]);

        setSummary(summaryResponse.data);

        setSkillsCount(
          Array.isArray(skillsResponse.data)
            ? skillsResponse.data.length
            : 0
        );
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          navigate("/login", { replace: true });
          toast.error("Session expired. Please sign in again.");
          return;
        }

        toast.error(
          error.response?.data?.message ||
            "Unable to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [logout, navigate]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">
            CAREER MANAGEMENT PLATFORM
          </p>

          <h1>
            Welcome, {user?.fullName || "User"}
          </h1>

          <p>
            Track your applications and professional profile.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </section>

      {loading ? (
        <section className="dashboard-loading">
          Loading dashboard...
        </section>
      ) : (
        <>
          <section className="stats-grid">
            <article className="stat-card">
              <span>Total applications</span>
              <strong>{summary.totalApplications}</strong>
            </article>

            <article className="stat-card">
              <span>Interviews</span>
              <strong>{summary.interview}</strong>
            </article>

            <article className="stat-card">
              <span>Offers</span>
              <strong>{summary.offered}</strong>
            </article>

            <article className="stat-card">
              <span>Skills</span>
              <strong>{skillsCount}</strong>
            </article>
          </section>

          <section className="status-grid">
            <article className="status-card">
              <span>Wishlist</span>
              <strong>{summary.wishlist}</strong>
            </article>

            <article className="status-card">
              <span>Applied</span>
              <strong>{summary.applied}</strong>
            </article>

            <article className="status-card">
              <span>Assessment</span>
              <strong>{summary.assessment}</strong>
            </article>

            <article className="status-card">
              <span>Rejected</span>
              <strong>{summary.rejected}</strong>
            </article>
          </section>
        </>
      )}
    </main>
  );
}

export default DashboardPage;

