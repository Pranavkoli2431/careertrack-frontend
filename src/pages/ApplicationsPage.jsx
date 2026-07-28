import {
  BriefcaseBusiness,
  CalendarDays,
  Edit3,
  ExternalLink,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";

const statusOptions = [
  "WISHLIST",
  "APPLIED",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFERED",
  "REJECTED",
  "WITHDRAWN",
];

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
  jobUrl: "",
  location: "",
  employmentType: "FULL_TIME",
  applicationStatus: "WISHLIST",
  appliedDate: "",
  deadline: "",
  notes: "",
};

function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);

      const response = await apiClient.get(
        "/api/applications",
        {
          params: statusFilter
            ? { status: statusFilter }
            : {},
        }
      );

      setApplications(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load applications"
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEditForm = (application) => {
    setEditingId(application.id);

    setForm({
      companyName: application.companyName || "",
      jobTitle: application.jobTitle || "",
      jobUrl: application.jobUrl || "",
      location: application.location || "",
      employmentType:
        application.employmentType || "FULL_TIME",
      applicationStatus:
        application.applicationStatus || "WISHLIST",
      appliedDate: application.appliedDate || "",
      deadline: application.deadline || "",
      notes: application.notes || "",
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
      !form.jobTitle.trim()
    ) {
      toast.error(
        "Company name and job title are required"
      );
      return;
    }

    const payload = {
      companyName: form.companyName.trim(),
      jobTitle: form.jobTitle.trim(),
      jobUrl: form.jobUrl.trim() || null,
      location: form.location.trim() || null,
      employmentType: form.employmentType,
      applicationStatus: form.applicationStatus,
      appliedDate: form.appliedDate || null,
      deadline: form.deadline || null,
      notes: form.notes.trim() || null,
    };

    try {
      setSaving(true);

      if (editingId) {
        await apiClient.put(
          `/api/applications/${editingId}`,
          payload
        );

        toast.success(
          "Application updated successfully"
        );
      } else {
        await apiClient.post(
          "/api/applications",
          payload
        );

        toast.success(
          "Application added successfully"
        );
      }

      closeForm();
      await loadApplications();
    } catch (error) {
      const fieldErrors =
        error.response?.data?.fieldErrors;

      const firstFieldError = fieldErrors
        ? Object.values(fieldErrors)[0]
        : null;

      toast.error(
        firstFieldError ||
          error.response?.data?.message ||
          "Unable to save application"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (applicationId) => {
    const confirmed = window.confirm(
      "Delete this job application?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiClient.delete(
        `/api/applications/${applicationId}`
      );

      toast.success(
        "Application deleted successfully"
      );

      await loadApplications();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete application"
      );
    }
  };

  const formatLabel = (value) =>
    value
      ?.toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");

  const formatDate = (value) => {
    if (!value) {
      return "Not specified";
    }

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString();
  };

  return (
    <main className="applications-page">
      <section className="applications-heading">
        <div>
          <p className="eyebrow">
            JOB APPLICATION TRACKER
          </p>

          <h1>Applications</h1>

          <p>
            Track every opportunity from wishlist
            to final result.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          Add application
        </button>
      </section>

      <section className="applications-toolbar">
        <div>
          <label htmlFor="statusFilter">
            Filter by status
          </label>

          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="">All statuses</option>

            {statusOptions.map((status) => (
              <option
                key={status}
                value={status}
              >
                {formatLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <span className="application-count">
          {applications.length} application(s)
        </span>
      </section>

      {loading ? (
        <section className="dashboard-loading">
          Loading applications...
        </section>
      ) : applications.length === 0 ? (
        <section className="empty-state">
          <div className="empty-state-icon">
            <BriefcaseBusiness size={27} />
          </div>

          <h2>No applications found</h2>

          <p>
            Add your first job application and
            begin tracking its progress.
          </p>

          <button
            type="button"
            className="primary-action empty-action"
            onClick={openCreateForm}
          >
            <Plus size={18} />
            Add application
          </button>
        </section>
      ) : (
        <section className="applications-grid">
          {applications.map((application) => (
            <article
              key={application.id}
              className="application-card"
            >
              <div className="application-card-header">
                <div>
                  <h2>
                    {application.jobTitle}
                  </h2>

                  <p>
                    {application.companyName}
                  </p>
                </div>

                <span
                  className={`status-badge status-${application.applicationStatus?.toLowerCase()}`}
                >
                  {formatLabel(
                    application.applicationStatus
                  )}
                </span>
              </div>

              <div className="application-details">
                <span>
                  <BriefcaseBusiness size={16} />
                  {formatLabel(
                    application.employmentType
                  )}
                </span>

                <span>
                  <CalendarDays size={16} />
                  Applied:{" "}
                  {formatDate(
                    application.appliedDate
                  )}
                </span>

                {application.location && (
                  <span>
                    Location: {application.location}
                  </span>
                )}

                {application.deadline && (
                  <span>
                    Deadline:{" "}
                    {formatDate(
                      application.deadline
                    )}
                  </span>
                )}
              </div>

              {application.notes && (
                <p className="application-notes">
                  {application.notes}
                </p>
              )}

              <div className="application-actions">
                {application.jobUrl && (
                  <a
                    href={application.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={16} />
                    Job link
                  </a>
                )}

                <button
                  type="button"
                  onClick={() =>
                    openEditForm(application)
                  }
                >
                  <Edit3 size={16} />
                  Edit
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() =>
                    handleDelete(application.id)
                  }
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
          <section className="application-modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingId
                    ? "Edit application"
                    : "Add application"}
                </h2>

                <p>
                  Enter the job opportunity details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
              >
                <X size={22} />
              </button>
            </div>

            <form
              className="application-form"
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
                    placeholder="Accenture"
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
                    placeholder="Java Backend Developer"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="employmentType">
                    Employment type
                  </label>

                  <select
                    id="employmentType"
                    name="employmentType"
                    value={form.employmentType}
                    onChange={handleChange}
                  >
                    {employmentTypes.map((type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {formatLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="applicationStatus">
                    Status
                  </label>

                  <select
                    id="applicationStatus"
                    name="applicationStatus"
                    value={form.applicationStatus}
                    onChange={handleChange}
                  >
                    {statusOptions.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {formatLabel(status)}
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
                    placeholder="Pune"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="jobUrl">
                    Job URL
                  </label>

                  <input
                    id="jobUrl"
                    name="jobUrl"
                    type="url"
                    value={form.jobUrl}
                    onChange={handleChange}
                    placeholder="https://company.com/job"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="appliedDate">
                    Applied date
                  </label>

                  <input
                    id="appliedDate"
                    name="appliedDate"
                    type="date"
                    value={form.appliedDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="deadline">
                    Deadline
                  </label>

                  <input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={form.deadline}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="notes">
                  Notes
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  rows="4"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Referral, interview details or preparation notes..."
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
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update application"
                      : "Add application"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default ApplicationsPage;
