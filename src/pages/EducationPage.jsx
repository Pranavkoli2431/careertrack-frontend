import {
  CalendarDays,
  Edit3,
  GraduationCap,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";

const emptyForm = {
  institutionName: "",
  degree: "",
  fieldOfStudy: "",
  startDate: "",
  endDate: "",
  currentlyStudying: false,
  grade: "",
  description: "",
};

function EducationPage() {
  const [educationList, setEducationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadEducation = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/education");
      setEducationList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load education"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEducation();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "currentlyStudying" && checked
        ? { endDate: "" }
        : {}),
    }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEditForm = (education) => {
    setEditingId(education.id);

    setForm({
      institutionName: education.institutionName || "",
      degree: education.degree || "",
      fieldOfStudy: education.fieldOfStudy || "",
      startDate: education.startDate || "",
      endDate: education.endDate || "",
      currentlyStudying: Boolean(education.currentlyStudying),
      grade: education.grade || "",
      description: education.description || "",
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
      !form.institutionName.trim() ||
      !form.degree.trim() ||
      !form.fieldOfStudy.trim() ||
      !form.startDate
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (
      !form.currentlyStudying &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      toast.error("End date cannot be before start date");
      return;
    }

    const payload = {
      institutionName: form.institutionName.trim(),
      degree: form.degree.trim(),
      fieldOfStudy: form.fieldOfStudy.trim(),
      startDate: form.startDate,
      endDate: form.currentlyStudying
        ? null
        : form.endDate || null,
      currentlyStudying: form.currentlyStudying,
      grade: form.grade.trim() || null,
      description: form.description.trim() || null,
    };

    try {
      setSaving(true);

      if (editingId) {
        await apiClient.put(`/api/education/${editingId}`, payload);
        toast.success("Education updated successfully");
      } else {
        await apiClient.post("/api/education", payload);
        toast.success("Education added successfully");
      }

      closeForm();
      await loadEducation();
    } catch (error) {
      const fieldErrors = error.response?.data?.fieldErrors;
      const firstError = fieldErrors
        ? Object.values(fieldErrors)[0]
        : null;

      toast.error(
        firstError ||
          error.response?.data?.message ||
          "Unable to save education"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (education) => {
    const confirmed = window.confirm(
      `Delete ${education.degree} from ${education.institutionName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiClient.delete(`/api/education/${education.id}`);
      toast.success("Education deleted successfully");
      await loadEducation();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to delete education"
      );
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Present";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="education-page">
      <section className="education-heading">
        <div>
          <p className="eyebrow">ACADEMIC QUALIFICATIONS</p>
          <h1>Education</h1>
          <p>Manage your degrees, courses and academic qualifications.</p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          Add education
        </button>
      </section>

      <section className="education-summary">
        <GraduationCap size={25} />

        <div>
          <strong>{educationList.length}</strong>
          <span>Education records</span>
        </div>
      </section>

      {loading ? (
        <section className="dashboard-loading">
          Loading education...
        </section>
      ) : educationList.length === 0 ? (
        <section className="empty-state">
          <div className="empty-state-icon">
            <GraduationCap size={28} />
          </div>

          <h2>No education records</h2>
          <p>Add your B.Tech, PGCP-AC or another qualification.</p>

          <button
            type="button"
            className="primary-action empty-action"
            onClick={openCreateForm}
          >
            <Plus size={18} />
            Add first education
          </button>
        </section>
      ) : (
        <section className="education-list">
          {educationList.map((education) => (
            <article className="education-card" key={education.id}>
              <div className="education-icon">
                <GraduationCap size={24} />
              </div>

              <div className="education-content">
                <div className="education-card-header">
                  <div>
                    <h2>{education.degree}</h2>
                    <p>{education.institutionName}</p>
                  </div>

                  {education.currentlyStudying && (
                    <span className="current-badge">
                      Currently studying
                    </span>
                  )}
                </div>

                <h3>{education.fieldOfStudy}</h3>

                <div className="education-meta">
                  <span>
                    <CalendarDays size={16} />
                    {formatDate(education.startDate)}
                    {" — "}
                    {education.currentlyStudying
                      ? "Present"
                      : formatDate(education.endDate)}
                  </span>

                  {education.grade && (
                    <span>Grade: {education.grade}</span>
                  )}
                </div>

                {education.description && (
                  <p className="education-description">
                    {education.description}
                  </p>
                )}

                <div className="education-actions">
                  <button
                    type="button"
                    onClick={() => openEditForm(education)}
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleDelete(education)}
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
          <section className="education-modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingId ? "Edit education" : "Add education"}
                </h2>
                <p>Enter your academic details.</p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            <form className="education-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="institutionName">
                  Institution name *
                </label>
                <input
                  id="institutionName"
                  name="institutionName"
                  value={form.institutionName}
                  onChange={handleChange}
                  placeholder="College or institute name"
                />
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="degree">Degree or course *</label>
                  <input
                    id="degree"
                    name="degree"
                    value={form.degree}
                    onChange={handleChange}
                    placeholder="Bachelor of Technology"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="fieldOfStudy">
                    Field of study *
                  </label>
                  <input
                    id="fieldOfStudy"
                    name="fieldOfStudy"
                    value={form.fieldOfStudy}
                    onChange={handleChange}
                    placeholder="Computer Science"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="startDate">Start date *</label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="endDate">End date</label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    disabled={form.currentlyStudying}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="grade">Grade or CGPA</label>
                  <input
                    id="grade"
                    name="grade"
                    value={form.grade}
                    onChange={handleChange}
                    placeholder="8.2 CGPA"
                  />
                </div>

                <label className="checkbox-field">
                  <input
                    name="currentlyStudying"
                    type="checkbox"
                    checked={form.currentlyStudying}
                    onChange={handleChange}
                  />
                  <span>I am currently studying here</span>
                </label>
              </div>

              <div className="form-field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Achievements, coursework or activities"
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
                    <LoaderCircle className="spinner" size={18} />
                  ) : (
                    <Save size={18} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update education"
                      : "Add education"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default EducationPage;
