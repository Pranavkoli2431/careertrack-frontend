import {
  Edit3,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";

const proficiencyOptions = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
];

const emptyForm = {
  skillName: "",
  proficiency: "BEGINNER",
  yearsOfExperience: "0",
};

function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadSkills = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get("/api/skills");

      setSkills(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load skills"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

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

  const openEditForm = (skill) => {
    setEditingId(skill.id);

    setForm({
      skillName: skill.skillName || "",
      proficiency:
        skill.proficiency || "BEGINNER",
      yearsOfExperience:
        skill.yearsOfExperience?.toString() || "0",
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

    if (!form.skillName.trim()) {
      toast.error("Skill name is required");
      return;
    }

    const experience = Number(
      form.yearsOfExperience
    );

    if (
      Number.isNaN(experience) ||
      experience < 0
    ) {
      toast.error(
        "Years of experience must be 0 or greater"
      );
      return;
    }

    const payload = {
      skillName: form.skillName.trim(),
      proficiency: form.proficiency,
      yearsOfExperience: experience,
    };

    try {
      setSaving(true);

      if (editingId) {
        await apiClient.put(
          `/api/skills/${editingId}`,
          payload
        );

        toast.success(
          "Skill updated successfully"
        );
      } else {
        await apiClient.post(
          "/api/skills",
          payload
        );

        toast.success(
          "Skill added successfully"
        );
      }

      closeForm();
      await loadSkills();
    } catch (error) {
      const fieldErrors =
        error.response?.data?.fieldErrors;

      const firstFieldError = fieldErrors
        ? Object.values(fieldErrors)[0]
        : null;

      toast.error(
        firstFieldError ||
          error.response?.data?.message ||
          "Unable to save skill"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (skill) => {
    const confirmed = window.confirm(
      `Delete ${skill.skillName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiClient.delete(
        `/api/skills/${skill.id}`
      );

      toast.success(
        "Skill deleted successfully"
      );

      await loadSkills();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete skill"
      );
    }
  };

  return (
    <main className="skills-page">
      <section className="skills-heading">
        <div>
          <p className="eyebrow">
            PROFESSIONAL SKILLS
          </p>

          <h1>Skills</h1>

          <p>
            Manage your technical and professional
            capabilities.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          Add skill
        </button>
      </section>

      <section className="skills-summary">
        <div>
          <Wrench size={24} />

          <div>
            <strong>{skills.length}</strong>
            <span>Total skills</span>
          </div>
        </div>

        <p>
          Add your strongest skills and keep the
          proficiency level updated.
        </p>
      </section>

      {loading ? (
        <section className="dashboard-loading">
          Loading skills...
        </section>
      ) : skills.length === 0 ? (
        <section className="empty-state">
          <div className="empty-state-icon">
            <Wrench size={27} />
          </div>

          <h2>No skills added</h2>

          <p>
            Add Java, Spring Boot, PostgreSQL or
            another professional skill.
          </p>

          <button
            type="button"
            className="primary-action empty-action"
            onClick={openCreateForm}
          >
            <Plus size={18} />
            Add first skill
          </button>
        </section>
      ) : (
        <section className="skills-grid">
          {skills.map((skill) => (
            <article
              key={skill.id}
              className="skill-card"
            >
              <div className="skill-card-top">
                <div className="skill-icon">
                  <Wrench size={21} />
                </div>

                <span
                  className={`skill-level skill-level-${skill.proficiency?.toLowerCase()}`}
                >
                  {formatLabel(
                    skill.proficiency
                  )}
                </span>
              </div>

              <h2>{skill.skillName}</h2>

              <div className="skill-experience">
                <span>Experience</span>

                <strong>
                  {skill.yearsOfExperience ?? 0}{" "}
                  year(s)
                </strong>
              </div>

              <div className="skill-progress">
                <div
                  className={`skill-progress-value progress-${skill.proficiency?.toLowerCase()}`}
                />
              </div>

              <div className="skill-actions">
                <button
                  type="button"
                  onClick={() =>
                    openEditForm(skill)
                  }
                >
                  <Edit3 size={16} />
                  Edit
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() =>
                    handleDelete(skill)
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
          <section className="skill-modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingId
                    ? "Edit skill"
                    : "Add skill"}
                </h2>

                <p>
                  Enter your proficiency and
                  experience details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close skill form"
              >
                <X size={22} />
              </button>
            </div>

            <form
              className="skill-form"
              onSubmit={handleSubmit}
            >
              <div className="form-field">
                <label htmlFor="skillName">
                  Skill name *
                </label>

                <input
                  id="skillName"
                  name="skillName"
                  value={form.skillName}
                  onChange={handleChange}
                  placeholder="Java"
                />
              </div>

              <div className="form-field">
                <label htmlFor="proficiency">
                  Proficiency
                </label>

                <select
                  id="proficiency"
                  name="proficiency"
                  value={form.proficiency}
                  onChange={handleChange}
                >
                  {proficiencyOptions.map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {formatLabel(option)}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="yearsOfExperience">
                  Years of experience
                </label>

                <input
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={form.yearsOfExperience}
                  onChange={handleChange}
                  placeholder="1.5"
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
                      ? "Update skill"
                      : "Add skill"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default SkillsPage;
