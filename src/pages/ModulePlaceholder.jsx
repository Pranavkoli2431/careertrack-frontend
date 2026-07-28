function ModulePlaceholder({
  title,
  description,
}) {
  return (
    <main className="module-page">
      <section className="module-heading">
        <p className="eyebrow">
          CAREERTRACK
        </p>

        <h1>{title}</h1>

        <p>{description}</p>
      </section>

      <section className="empty-state">
        <div className="empty-state-icon">
          CT
        </div>

        <h2>{title} page is ready</h2>

        <p>
          The page layout and routing are
          complete. CRUD integration will be
          added next.
        </p>
      </section>
    </main>
  );
}

export default ModulePlaceholder;
