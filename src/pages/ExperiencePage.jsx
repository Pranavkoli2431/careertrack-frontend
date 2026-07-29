import {
  Briefcase,
  Building2,
  CalendarDays,
  Edit3,
  LoaderCircle,
  MapPin,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";

const employmentTypes = [
  "FULL_TIME",
  "PART_TIME",
  "INTERNSHIP",
  "CONTRACT",
  "FREELANCE",
];

const emptyForm = {
  companyName: "",
  jobTitle: "",
  employmentType: "INTERNSHIP",
  location: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  description: "",
};

function ExperiencePage() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadExperiences = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get("/api/experiences");

      setExperiences(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load experience"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  const formatLabel = (value) =>
    value
      ?.toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");

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

  const openEditForm = (experience) => {
    setEditingId(experience.id);

    setForm({
      companyName: experience.companyName || "",
      jobTitle: experience.jobTitle || "",
      employmentType:
        experience.employmentType || "INTERNSHIP",
      location: experience.location || "",
      startDate: experience.startDate || "",
      endDate: experience.endDate || "",
      currentlyWorking: Boolean(
        experience.currentlyWorking
      ),
      description: experience.description || "",
    });

    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.companyName.trim() ||
      !form.jobTitle.trim() ||
      !form.startDate
    ) {
      toast.error(
        "Company name, job title and start date are required"
      );
      return;
    }

    if (
      !form.currentlyWorking &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      toast.error(
        "End date cannot be before start date"
      );
      return;
    }

    const payload = {
      companyName: form.companyName.trim(),
      jobTitle: form.jobTitle.trim(),
      employmentType: form.employmentType,
      location: form.location.trim() || null,
      startDate: form.startDate,
      endDate: form.currentlyWorking
        ? null
        : form.endDate || null,
      currentlyWorking: form.currentlyWorking,
      description: form.description.trim() || null,
    };

    try {
      setSaving(true);

      if (editingId) {
        await apiClient.put(
          `/api/experiences/${editingId}`,
          payload
        );

        toast.success(
          "Experience updated successfully"
        );
      } else {
        await apiClient.post(
          "/api/experiences",
          payload
        );

        toast.success(
          "Experience added successfully"
        );
      }

      closeForm();
      await loadExperiences();
    } catch (error) {
      const fieldErrors =
        error.response?.data?.fieldErrors;

      const firstError = fieldErrors
        ? Object.values(fieldErrors)[0]
        : null;

      toast.error(
        firstError ||
          error.response?.data?.message ||
          "Unable to save experience"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (experience) => {
    const confirmed = window.confirm(
      `Delete ${experience.jobTitle} at ${experience.companyName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiClient.delete(
        `/api/experiences/${experience.id}`
      );

      toast.success(
        "Experience deleted successfully"
      );

      await loadExperiences();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete experience"
      );
    }
  };

  return (
    <main className="experience-page">
      <section className="experience-heading">
        <div>
          <p className="eyebrow">
            PROFESSIONAL EXPERIENCE
          </p>

          <h1>Experience</h1>

          <p>
            Manage your internships, jobs and professional
            experience.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          Add experience
        </button>
      </section>

      <section className="experience-summary">
        <Briefcase size={25} />

        <div>
          <strong>{experiences.length}</strong>
          <span>Experience records</span>
        </div>
      </section>

      {loading ? (
        <section className="dashboard-loading">
          Loading experience...
        </section>
      ) : experiences.length === 0 ? (
        <section className="empty-state">
          <div className="empty-state-icon">
            <Briefcase size={28} />
          </div>

          <h2>No experience records</h2>

          <p>
            Add an internship, job, contract or freelance
            experience.
          </p>

          <button
            type="button"
            className="primary-action empty-action"
            onClick={openCreateForm}
          >
            <Plus size={18} />
            Add first experience
          </button>
        </section>
      ) : (
        <section className="experience-list">
          {experiences.map((experience) => (
            <article
              key={experience.id}
              className="experience-card"
            >
              <div className="experience-icon">
                <Briefcase size={24} />
              </div>

              <div className="experience-content">
                <div className="experience-card-header">
                  <div>
                    <h2>{experience.jobTitle}</h2>

                    <p>
                      <Building2 size={16} />
                      {experience.companyName}
                    </p>
                  </div>

                  <span className="employment-badge">
                    {formatLabel(
                      experience.employmentType
                    )}
                  </span>
                </div>

                <div className="experience-meta">
                  <span>
                    <CalendarDays size={16} />
                    {formatDate(experience.startDate)}
                    {" — "}
                    {experience.currentlyWorking
                      ? "Present"
                      : formatDate(experience.endDate)}
                  </span>

                  {experience.location && (
                    <span>
                      <MapPin size={16} />
                      {experience.location}
                    </span>
                  )}

                  {experience.currentlyWorking && (
                    <span className="current-work-label">
                      Currently working
                    </span>
                  )}
                </div>

                {experience.description && (
                  <p className="experience-description">
                    {experience.description}
                  </p>
                )}

                <div className="experience-actions">
                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(experience)
                    }
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() =>
                      handleDelete(experience)
                    }
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {formOpen && (
        <div className="modal-backdrop">
          <section className="experience-modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingId
                    ? "Edit experience"
                    : "Add experience"}
                </h2>

                <p>
                  Enter your professional experience details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close experience form"
              >
                <X size={22} />
              </button>
            </div>

            <form
              className="experience-form"
              onSubmit={handleSubmit}
            >
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="companyName">
                    Company name *
                  </label>

                  <input
                    id="companyName"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="Pantech Solutions"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="jobTitle">
                    Job title *
                  </label>

                  <input
                    id="jobTitle"
                    name="jobTitle"
                    value={form.jobTitle}
                    onChange={handleChange}
                    placeholder="Web Development Intern"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="employmentType">
                    Employment type *
                  </label>

                  <select
                    id="employmentType"
                    name="employmentType"
                    value={form.employmentType}
                    onChange={handleChange}
                  >
                    {employmentTypes.map((type) => (
                      <option key={type} value={type}>
                        {formatLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="location">
                    Location
                  </label>

                  <input
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Pune, Maharashtra"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="startDate">
                    Start date *
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

                <span>I am currently working here</span>
              </label>

              <div className="form-field">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  maxLength="2000"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your responsibilities, technologies and achievements..."
                />
              </div>

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
                      ? "Update experience"
                      : "Add experience"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default ExperiencePage;