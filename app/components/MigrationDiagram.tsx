const steps = [
  ["Discover", "Find the systems, people, data and dependencies."],
  ["Extract", "Recover usable records and documents from the source."],
  ["Clean", "Resolve duplicates, gaps and inconsistent history."],
  ["Map", "Match old fields and relationships to the new system."],
  ["Transform", "Build import files or integrations the platform accepts."],
  ["Test", "Try representative data and everyday business tasks."],
  ["Migrate", "Run rehearsed loads with a repeatable process."],
  ["Validate", "Reconcile counts, totals, relationships and documents."],
  ["Cut over", "Switch with approval, a fallback and post-move checks."],
  ["Document", "Hand over the mapping, results and legacy archive plan."],
];

export function MigrationProcess() {
  return (
    <ol className="migration-process">
      {steps.map(([title, description], index) => (
        <li key={title}>
          <span className="migration-step-number">
            {String(index + 1).padStart(2, "0")}
            <span aria-hidden="true">
              {index === steps.length - 1 ? "✓" : "→"}
            </span>
          </span>
          <h3>{title}</h3>
          <p>{description}</p>
        </li>
      ))}
    </ol>
  );
}

export function MigrationDiagram() {
  return (
    <figure
      className="migration-diagram"
      aria-label="Migration from existing business systems through Netherwood into your chosen platform"
    >
      <div className="migration-diagram-heading">
        <span>Your next chapter</span>
        <span aria-hidden="true">01 → 02</span>
      </div>
      <div className="migration-diagram-sources">
        <p className="migration-diagram-label">What you have today</p>
        <div>
          <span>Legacy applications</span>
          <span>SQL Server & Access</span>
          <span>Spreadsheets & files</span>
          <span>Years of business history</span>
        </div>
      </div>
      <div className="migration-diagram-connector" aria-hidden="true">
        ↓
      </div>
      <div className="migration-diagram-work">
        <span className="migration-diagram-label">
          Netherwood Data Partners
        </span>
        <strong>Make the data ready.</strong>
        <p>Extract · Clean · Map · Test · Reconcile</p>
      </div>
      <div className="migration-diagram-connector" aria-hidden="true">
        ↓
      </div>
      <div className="migration-diagram-destination">
        <span className="migration-diagram-label">The platform you choose</span>
        <strong>A better place for your business to work.</strong>
        <p>Business software · Cloud platforms · Industry SaaS</p>
      </div>
      <figcaption>A planned move. A checked result. Your data.</figcaption>
    </figure>
  );
}
