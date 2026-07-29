import {
  CalendarDays,
  Code2,
  Edit3,
  ExternalLink,
  Folder,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";
import "../styles/projects.css";

const emptyForm = {
  projectTitle: "",
  description: "",
  techStack: "",
  githubUrl: "",
  liveUrl: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
};

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadProjects = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get("/api/projects");

      setProjects(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "currentlyWorking" && checked
        ? { endDate: "" }
        : {}),
    }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEditForm = (project) => {
    setEditingId(project.id);

    setForm({
      projectTitle: project.projectTitle || "",
      description: project.description || "",
      techStack: project.techStack || "",
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      currentlyWorking: Boolean(project.currentlyWorking),
    });

    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const isValidUrl = (value) => {
    if (!value.trim()) {
      return true;
    }

    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.projectTitle.trim()) {
      toast.error("Project title is required");
      return;
    }

    if (!isValidUrl(form.githubUrl)) {
      toast.error(
        "GitHub URL must start with http:// or https://"
      );
      return;
    }

    if (!isValidUrl(form.liveUrl)) {
      toast.error(
        "Live URL must start with http:// or https://"
      );
      return;
    }

    if (
      !form.currentlyWorking &&
      form.startDate &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      toast.error(
        "End date cannot be before start date"
      );
      return;
    }

    const payload = {
      projectTitle: form.projectTitle.trim(),
      description: form.description.trim() || null,
      techStack: form.techStack.trim() || null,
      githubUrl: form.githubUrl.trim() || null,
      liveUrl: form.liveUrl.trim() || null,
      startDate: form.startDate || null,
      endDate: form.currentlyWorking
        ? null
        : form.endDate || null,
      currentlyWorking: form.currentlyWorking,
    };

    try {
      setSaving(true);

      if (editingId) {
        await apiClient.put(
          `/api/projects/${editingId}`,
          payload
        );

        toast.success(
          "Project updated successfully"
        );
      } else {
        await apiClient.post(
          "/api/projects",
          payload
        );

        toast.success(
          "Project added successfully"
        );
      }

      closeForm();
      await loadProjects();
    } catch (error) {
      const fieldErrors =
        error.response?.data?.fieldErrors;

      const firstError = fieldErrors
        ? Object.values(fieldErrors)[0]
        : null;

      toast.error(
        firstError ||
          error.response?.data?.message ||
          "Unable to save project"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project) => {
    const confirmed = window.confirm(
      `Delete ${project.projectTitle}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiClient.delete(
        `/api/projects/${project.id}`
      );

      toast.success(
        "Project deleted successfully"
      );

      await loadProjects();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete project"
      );
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Present";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-US",
      {
        month: "short",
        year: "numeric",
      }
    );
  };

  const getTechnologies = (techStack) =>
    techStack
      ? techStack
          .split(",")
          .map((technology) => technology.trim())
          .filter(Boolean)
      : [];

  return (
    <main className="projects-page">
      <section className="projects-heading">
        <div>
          <p className="eyebrow">
            DEVELOPMENT PORTFOLIO
          </p>

          <h1>Projects</h1>

          <p>
            Showcase your development projects, technologies
            and source-code links.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          Add project
        </button>
      </section>

      <section className="projects-summary">
        <Folder size={25} />

        <div>
          <strong>{projects.length}</strong>
          <span>Total projects</span>
        </div>
      </section>

      {loading ? (
        <section className="dashboard-loading">
          Loading projects...
        </section>
      ) : projects.length === 0 ? (
        <section className="empty-state">
          <div className="empty-state-icon">
            <Code2 size={28} />
          </div>

          <h2>No projects added</h2>

          <p>
            Add CareerTrack, CargoSphere or another
            development project.
          </p>

          <button
            type="button"
            className="primary-action empty-action"
            onClick={openCreateForm}
          >
            <Plus size={18} />
            Add first project
          </button>
        </section>
      ) : (
        <section className="projects-grid">
          {projects.map((project) => (
            <article
              key={project.id}
              className="project-card"
            >
              <div className="project-card-header">
                <div className="project-icon">
                  <Code2 size={24} />
                </div>

                {project.currentlyWorking && (
                  <span className="project-current-badge">
                    In progress
                  </span>
                )}
              </div>

              <h2>{project.projectTitle}</h2>

              {(project.startDate || project.endDate) && (
                <div className="project-date">
                  <CalendarDays size={16} />

                  {project.startDate
                    ? formatDate(project.startDate)
                    : "Not specified"}

                  {" â€” "}

                  {project.currentlyWorking
                    ? "Present"
                    : project.endDate
                      ? formatDate(project.endDate)
                      : "Not specified"}
                </div>
              )}

              {project.description && (
                <p className="project-description">
                  {project.description}
                </p>
              )}

              {project.techStack && (
                <div className="technology-list">
                  {getTechnologies(project.techStack).map(
                    (technology) => (
                      <span key={technology}>
                        {technology}
                      </span>
                    )
                  )}
                </div>
              )}

              {(project.githubUrl || project.liveUrl) && (
                <div className="project-links">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Code2 size={16} />
                      Source code
                    </a>
                  )}

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={16} />
                      Live project
                    </a>
                  )}
                </div>
              )}

              <div className="project-actions">
                <button
                  type="button"
                  onClick={() => openEditForm(project)}
                >
                  <Edit3 size={16} />
                  Edit
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => handleDelete(project)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {formOpen && (
        <div className="modal-backdrop">
          <section className="project-modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingId
                    ? "Edit project"
                    : "Add project"}
                </h2>

                <p>
                  Enter your project and technology details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close project form"
              >
                <X size={22} />
              </button>
            </div>

            <form
              className="project-form"
              onSubmit={handleSubmit}
            >
              <div className="form-field">
                <label htmlFor="projectTitle">
                  Project title *
                </label>

                <input
                  id="projectTitle"
                  name="projectTitle"
                  maxLength="200"
                  value={form.projectTitle}
                  onChange={handleChange}
                  placeholder="CareerTrack"
                />
              </div>

              <div className="form-field">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  maxLength="3000"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Explain what the project does and the problem it solves."
                />
              </div>

              <div className="form-field">
                <label htmlFor="techStack">
                  Technology stack
                </label>

                <input
                  id="techStack"
                  name="techStack"
                  maxLength="1000"
                  value={form.techStack}
                  onChange={handleChange}
                  placeholder="Java, Spring Boot, React, PostgreSQL"
                />

                <small>
                  Separate technologies using commas.
                </small>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="githubUrl">
                    GitHub URL
                  </label>

                  <input
                    id="githubUrl"
                    name="githubUrl"
                    type="url"
                    maxLength="500"
                    value={form.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/username/project"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="liveUrl">
                    Live URL
                  </label>

                  <input
                    id="liveUrl"
                    name="liveUrl"
                    type="url"
                    maxLength="500"
                    value={form.liveUrl}
                    onChange={handleChange}
                    placeholder="https://project.example.com"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="startDate">
                    Start date
                  </label>

                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="endDate">
                    End date
                  </label>

                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    disabled={form.currentlyWorking}
                  />
                </div>
              </div>

              <label className="checkbox-field">
                <input
                  name="currentlyWorking"
                  type="checkbox"
                  checked={form.currentlyWorking}
                  onChange={handleChange}
                />

                <span>
                  I am currently working on this project
                </span>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-action"
                  disabled={saving}
                >
                  {saving ? (
                    <LoaderCircle
                      className="spinner"
                      size={18}
                    />
                  ) : (
                    <Save size={18} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update project"
                      : "Add project"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default ProjectsPage;