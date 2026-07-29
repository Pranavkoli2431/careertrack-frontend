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

const initialCounts = {
  skills: 0,
  education: 0,
  experiences: 0,
  projects: 0,
  certifications: 0,
};

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [summary, setSummary] = useState(initialSummary);
  const [counts, setCounts] = useState(initialCounts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCount = (response) =>
      Array.isArray(response.data)
        ? response.data.length
        : 0;

    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [
          summaryResponse,
          skillsResponse,
          educationResponse,
          experiencesResponse,
          projectsResponse,
          certificationsResponse,
        ] = await Promise.all([
          apiClient.get("/api/dashboard/summary"),
          apiClient.get("/api/skills"),
          apiClient.get("/api/education"),
          apiClient.get("/api/experiences"),
          apiClient.get("/api/projects"),
          apiClient.get("/api/certifications"),
        ]);

        setSummary(summaryResponse.data);

        setCounts({
          skills: getCount(skillsResponse),
          education: getCount(educationResponse),
          experiences: getCount(experiencesResponse),
          projects: getCount(projectsResponse),
          certifications: getCount(certificationsResponse),
        });
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          navigate("/login", { replace: true });
          toast.error(
            "Session expired. Please sign in again."
          );
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
              <strong>{counts.skills}</strong>
            </article>

            <article className="stat-card">
              <span>Education</span>
              <strong>{counts.education}</strong>
            </article>

            <article className="stat-card">
              <span>Experience</span>
              <strong>{counts.experiences}</strong>
            </article>

            <article className="stat-card">
              <span>Projects</span>
              <strong>{counts.projects}</strong>
            </article>

            <article className="stat-card">
              <span>Certifications</span>
              <strong>{counts.certifications}</strong>
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