import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await apiClient.post("/api/auth/register", {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      toast.success("Account created. Please sign in.");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 700);
    } catch (error) {
      const fieldErrors = error.response?.data?.fieldErrors;
      const firstFieldError = fieldErrors
        ? Object.values(fieldErrors)[0]
        : null;

      toast.error(
        firstFieldError ||
        error.response?.data?.message ||
        "Unable to create account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">CareerTrack</div>

        <h1>Create your account</h1>

        <p className="subtitle">
          Start tracking your career journey.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Pranav Koli"
          />

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="pranav@example.com"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a strong password"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="switch-text">
          Already registered?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
