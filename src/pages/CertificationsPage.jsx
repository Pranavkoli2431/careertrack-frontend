import {
  Award,
  CalendarDays,
  Edit3,
  ExternalLink,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";
import "../styles/certifications.css";

const emptyForm = {
  certificateName: "",
  issuingOrganization: "",
  issueDate: "",
  expirationDate: "",
  doesNotExpire: true,
  credentialId: "",
  credentialUrl: "",
};

function CertificationsPage() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadCertifications = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get(
        "/api/certifications"
      );

      setCertifications(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load certifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertifications();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox" ? checked : value,
      ...(name === "doesNotExpire" && checked
        ? { expirationDate: "" }
        : {}),
    }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEditForm = (certification) => {
    setEditingId(certification.id);

    setForm({
      certificateName:
        certification.certificateName || "",
      issuingOrganization:
        certification.issuingOrganization || "",
      issueDate: certification.issueDate || "",
      expirationDate:
        certification.expirationDate || "",
      doesNotExpire: Boolean(
        certification.doesNotExpire
      ),
      credentialId:
        certification.credentialId || "",
      credentialUrl:
        certification.credentialUrl || "",
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

      return (
        url.protocol === "http:" ||
        url.protocol === "https:"
      );
    } catch {
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.certificateName.trim() ||
      !form.issuingOrganization.trim()
    ) {
      toast.error(
        "Certificate name and issuing organization are required"
      );
      return;
    }

    if (!isValidUrl(form.credentialUrl)) {
      toast.error(
        "Credential URL must start with http:// or https://"
      );
      return;
    }

    if (
      !form.doesNotExpire &&
      form.issueDate &&
      form.expirationDate &&
      form.expirationDate < form.issueDate
    ) {
      toast.error(
        "Expiration date cannot be before issue date"
      );
      return;
    }

    const payload = {
      certificateName:
        form.certificateName.trim(),
      issuingOrganization:
        form.issuingOrganization.trim(),
      issueDate: form.issueDate || null,
      expirationDate: form.doesNotExpire
        ? null
        : form.expirationDate || null,
      doesNotExpire: form.doesNotExpire,
      credentialId:
        form.credentialId.trim() || null,
      credentialUrl:
        form.credentialUrl.trim() || null,
    };

    try {
      setSaving(true);

      if (editingId) {
        await apiClient.put(
          `/api/certifications/${editingId}`,
          payload
        );

        toast.success(
          "Certification updated successfully"
        );
      } else {
        await apiClient.post(
          "/api/certifications",
          payload
        );

        toast.success(
          "Certification added successfully"
        );
      }

      closeForm();
      await loadCertifications();
    } catch (error) {
      const fieldErrors =
        error.response?.data?.fieldErrors;

      const firstError = fieldErrors
        ? Object.values(fieldErrors)[0]
        : null;

      toast.error(
        firstError ||
          error.response?.data?.message ||
          "Unable to save certification"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    certification
  ) => {
    const confirmed = window.confirm(
      `Delete ${certification.certificateName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiClient.delete(
        `/api/certifications/${certification.id}`
      );

      toast.success(
        "Certification deleted successfully"
      );

      await loadCertifications();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete certification"
      );
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="certifications-page">
      <section className="certifications-heading">
        <div>
          <p className="eyebrow">
            PROFESSIONAL CERTIFICATES
          </p>

          <h1>Certifications</h1>

          <p>
            Manage certificates, credentials and
            verification links.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          Add certification
        </button>
      </section>

      <section className="certifications-summary">
        <Award size={25} />

        <div>
          <strong>{certifications.length}</strong>
          <span>Total certifications</span>
        </div>
      </section>

      {loading ? (
        <section className="dashboard-loading">
          Loading certifications...
        </section>
      ) : certifications.length === 0 ? (
        <section className="empty-state">
          <div className="empty-state-icon">
            <Award size={28} />
          </div>

          <h2>No certifications added</h2>

          <p>
            Add an internship, course or professional
            certification.
          </p>

          <button
            type="button"
            className="primary-action empty-action"
            onClick={openCreateForm}
          >
            <Plus size={18} />
            Add first certification
          </button>
        </section>
      ) : (
        <section className="certifications-grid">
          {certifications.map(
            (certification) => (
              <article
                key={certification.id}
                className="certification-card"
              >
                <div className="certification-card-header">
                  <div className="certification-icon">
                    <Award size={24} />
                  </div>

                  {certification.doesNotExpire && (
                    <span className="no-expiry-badge">
                      No expiration
                    </span>
                  )}
                </div>

                <h2>
                  {certification.certificateName}
                </h2>

                <p className="certification-issuer">
                  {certification.issuingOrganization}
                </p>

                <div className="certification-dates">
                  <span>
                    <CalendarDays size={16} />
                    Issued{" "}
                    {formatDate(
                      certification.issueDate
                    )}
                  </span>

                  {!certification.doesNotExpire &&
                    certification.expirationDate && (
                      <span>
                        Expires{" "}
                        {formatDate(
                          certification.expirationDate
                        )}
                      </span>
                    )}
                </div>

                {certification.credentialId && (
                  <p className="credential-id">
                    Credential ID:{" "}
                    <strong>
                      {certification.credentialId}
                    </strong>
                  </p>
                )}

                {certification.credentialUrl && (
                  <a
                    className="credential-link"
                    href={
                      certification.credentialUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={16} />
                    View credential
                  </a>
                )}

                <div className="certification-actions">
                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(certification)
                    }
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() =>
                      handleDelete(certification)
                    }
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </article>
            )
          )}
        </section>
      )}

      {formOpen && (
        <div className="modal-backdrop">
          <section className="certification-modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingId
                    ? "Edit certification"
                    : "Add certification"}
                </h2>

                <p>
                  Enter your certificate and
                  credential details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close certification form"
              >
                <X size={22} />
              </button>
            </div>

            <form
              className="certification-form"
              onSubmit={handleSubmit}
            >
              <div className="form-field">
                <label htmlFor="certificateName">
                  Certificate name *
                </label>

                <input
                  id="certificateName"
                  name="certificateName"
                  maxLength="200"
                  value={form.certificateName}
                  onChange={handleChange}
                  placeholder="Web Development Internship Certificate"
                />
              </div>

              <div className="form-field">
                <label htmlFor="issuingOrganization">
                  Issuing organization *
                </label>

                <input
                  id="issuingOrganization"
                  name="issuingOrganization"
                  maxLength="200"
                  value={
                    form.issuingOrganization
                  }
                  onChange={handleChange}
                  placeholder="Pantech Solutions"
                />
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="issueDate">
                    Issue date
                  </label>

                  <input
                    id="issueDate"
                    name="issueDate"
                    type="date"
                    value={form.issueDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="expirationDate">
                    Expiration date
                  </label>

                  <input
                    id="expirationDate"
                    name="expirationDate"
                    type="date"
                    value={form.expirationDate}
                    onChange={handleChange}
                    disabled={form.doesNotExpire}
                  />
                </div>
              </div>

              <label className="checkbox-field">
                <input
                  name="doesNotExpire"
                  type="checkbox"
                  checked={form.doesNotExpire}
                  onChange={handleChange}
                />

                <span>
                  This certificate does not expire
                </span>
              </label>

              <div className="form-field">
                <label htmlFor="credentialId">
                  Credential ID
                </label>

                <input
                  id="credentialId"
                  name="credentialId"
                  maxLength="200"
                  value={form.credentialId}
                  onChange={handleChange}
                  placeholder="Optional credential ID"
                />
              </div>

              <div className="form-field">
                <label htmlFor="credentialUrl">
                  Credential URL
                </label>

                <input
                  id="credentialUrl"
                  name="credentialUrl"
                  type="url"
                  maxLength="500"
                  value={form.credentialUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/credential"
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
                      ? "Update certification"
                      : "Add certification"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default CertificationsPage;