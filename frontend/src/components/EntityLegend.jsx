const ENTITY_TYPES = [
  ["SYMPTOM", "Reported symptoms"],
  ["CONDITION", "Health condition terms"],
  ["MEDICATION", "Medication mentions"],
  ["PROCEDURE", "Tests or assessments"],
  ["BODY_PART", "Anatomical references"],
  ["AGE", "Age mentions"],
  ["DATE", "Calendar references"],
  ["DURATION", "Time spans"],
  ["PERSON", "Person references"],
  ["OTHER_MEDICAL", "Other health terms"],
];

function entityClassName(label) {
  return label.toLowerCase().replace(/_/g, "-");
}

function EntityLegend() {
  return (
    <section className="panel legend-panel" aria-labelledby="legend-title">
      <div className="panel-heading compact-heading">
        <div>
          <p className="eyebrow">Reference</p>
          <h2 id="legend-title">Entity legend</h2>
        </div>
      </div>
      <ul className="legend-list">
        {ENTITY_TYPES.map(([label, description]) => (
          <li key={label}>
            <span className={`legend-swatch legend-swatch--${entityClassName(label)}`} aria-hidden="true" />
            <div>
              <strong>{label}</strong>
              <span>{description}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default EntityLegend;
