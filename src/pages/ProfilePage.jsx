import { ExternalLink, LoaderCircle, MapPin, Save, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

const emptyProfile = {
  headline: "",
  bio: "",
  phone: "",
  city: "",
  state: "",
  country: "",
  desiredRole: "",
  linkedinUrl: "",
  githubUrl: "",
  portfolioUrl: "",
};

function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const response = await apiClient.get(
          "/api/profile/me"
        );

        setProfile({
          headline: response.data.headline || "",
          bio: response.data.bio || "",
          phone: response.data.phone || "",
          city: response.data.city || "",
          state: response.data.state || "",
          country: response.data.country || "",
          desiredRole: response.data.desiredRole || "",
          linkedinUrl: response.data.linkedinUrl || "",
          githubUrl: response.data.githubUrl || "",
          portfolioUrl: response.data.portfolioUrl || "",
        });
      } catch (error) {
        if (error.response?.status !== 404) {
          toast.error(
            error.response?.data?.message ||
              "Unable to load profile"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const cleanValue = (value) => {
    const trimmedValue = value.trim();

    return trimmedValue || null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      headline: cleanValue(profile.headline),
      bio: cleanValue(profile.bio),
      phone: cleanValue(profile.phone),
      city: cleanValue(profile.city),
      state: cleanValue(profile.state),
      country: cleanValue(profile.country),
      desiredRole: cleanValue(profile.desiredRole),
      linkedinUrl: cleanValue(profile.linkedinUrl),
      githubUrl: cleanValue(profile.githubUrl),
      portfolioUrl: cleanValue(profile.portfolioUrl),
    };

    try {
      setSaving(true);

      const response = await apiClient.put(
        "/api/profile/me",
        payload
      );

      setProfile({
        headline: response.data.headline || "",
        bio: response.data.bio || "",
        phone: response.data.phone || "",
        city: response.data.city || "",
        state: response.data.state || "",
        country: response.data.country || "",
        desiredRole: response.data.desiredRole || "",
        linkedinUrl: response.data.linkedinUrl || "",
        githubUrl: response.data.githubUrl || "",
        portfolioUrl: response.data.portfolioUrl || "",
      });

      toast.success("Profile saved successfully");
    } catch (error) {
      const fieldErrors =
        error.response?.data?.fieldErrors;

      const firstFieldError = fieldErrors
        ? Object.values(fieldErrors)[0]
        : null;

      toast.error(
        firstFieldError ||
          error.response?.data?.message ||
          "Unable to save profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="dashboard-loading">
        Loading profile...
      </section>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-heading">
        <div>
          <p className="eyebrow">
            PROFESSIONAL PROFILE
          </p>

          <h1>My Profile</h1>

          <p>
            Maintain your career information and
            professional links.
          </p>
        </div>

        <UserRound size={52} />
      </section>

      <section className="profile-identity-card">
        <div className="profile-avatar-large">
          {user?.fullName
            ?.charAt(0)
            ?.toUpperCase() || "U"}
        </div>

        <div>
          <h2>{user?.fullName || "User"}</h2>
          <p>{user?.email || ""}</p>

          {profile.headline && (
            <span>{profile.headline}</span>
          )}
        </div>
      </section>

      <form
        className="profile-form-card"
        onSubmit={handleSubmit}
      >
        <div className="profile-section-heading">
          <div>
            <h2>Professional information</h2>
            <p>
              Add information visible in your
              CareerTrack profile.
            </p>
          </div>
        </div>

        <div className="profile-form-grid">
          <div className="form-field profile-full-width">
            <label htmlFor="headline">
              Professional headline
            </label>

            <input
              id="headline"
              name="headline"
              value={profile.headline}
              onChange={handleChange}
              placeholder="Java Backend Developer"
            />
          </div>

          <div className="form-field">
            <label htmlFor="desiredRole">
              Desired role
            </label>

            <input
              id="desiredRole"
              name="desiredRole"
              value={profile.desiredRole}
              onChange={handleChange}
              placeholder="Spring Boot Developer"
            />
          </div>

          <div className="form-field">
            <label htmlFor="phone">
              Phone number
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={profile.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="form-field">
            <label htmlFor="city">
              City
            </label>

            <input
              id="city"
              name="city"
              value={profile.city}
              onChange={handleChange}
              placeholder="Pune"
            />
          </div>

          <div className="form-field">
            <label htmlFor="state">
              State
            </label>

            <input
              id="state"
              name="state"
              value={profile.state}
              onChange={handleChange}
              placeholder="Maharashtra"
            />
          </div>

          <div className="form-field profile-full-width">
            <label htmlFor="country">
              Country
            </label>

            <div className="input-with-icon">
              <MapPin size={18} />

              <input
                id="country"
                name="country"
                value={profile.country}
                onChange={handleChange}
                placeholder="India"
              />
            </div>
          </div>

          <div className="form-field profile-full-width">
            <label htmlFor="bio">
              Professional bio
            </label>

            <textarea
              id="bio"
              name="bio"
              rows="5"
              value={profile.bio}
              onChange={handleChange}
              placeholder="Write a short summary about your skills, education and career goals..."
            />
          </div>
        </div>

        <div className="profile-section-divider" />

        <div className="profile-section-heading">
          <div>
            <h2>Professional links</h2>
            <p>
              Add your LinkedIn, GitHub and
              portfolio URLs.
            </p>
          </div>
        </div>

        <div className="profile-form-grid">
          <div className="form-field profile-full-width">
            <label htmlFor="linkedinUrl">
              LinkedIn URL
            </label>

            <div className="input-with-icon">
              <ExternalLink size={18} />

              <input
                id="linkedinUrl"
                name="linkedinUrl"
                type="url"
                value={profile.linkedinUrl}
                onChange={handleChange}
                placeholder="https://www.linkedin.com/in/username"
              />
            </div>
          </div>

          <div className="form-field profile-full-width">
            <label htmlFor="githubUrl">
              GitHub URL
            </label>

            <div className="input-with-icon">
              <ExternalLink size={18} />

              <input
                id="githubUrl"
                name="githubUrl"
                type="url"
                value={profile.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/username"
              />
            </div>
          </div>

          <div className="form-field profile-full-width">
            <label htmlFor="portfolioUrl">
              Portfolio URL
            </label>

            <input
              id="portfolioUrl"
              name="portfolioUrl"
              type="url"
              value={profile.portfolioUrl}
              onChange={handleChange}
              placeholder="https://yourportfolio.com"
            />
          </div>
        </div>

        <div className="profile-actions">
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
              ? "Saving profile..."
              : "Save profile"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default ProfilePage;


