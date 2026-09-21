function entityClassName(label) {
  return String(label || "OTHER_MEDICAL")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatConfidence(confidence) {
  const value = Number(confidence);

  if (!Number.isFinite(value)) {
    return "—";
  }

  const percentage = value <= 1 ? value * 100 : value;
  return `${Math.round(Math.min(100, Math.max(0, percentage)))}%`;
}

function EntityResults({ entities }) {
  if (!entities.length) {
    return (
      <div className="no-entities" role="status">
        <h3>No entities found</h3>
        <p>The demo engine did not identify a supported entity in this text.</p>
      </div>
    );
  }

  return (
    <section className="entity-results" aria-labelledby="entity-table-title">
      <div className="section-label-row">
        <h3 id="entity-table-title">Extracted entities</h3>
        <span>{entities.length} detected</span>
      </div>

      <div className="table-wrap">
        <table>
          <caption className="sr-only">Entities extracted from the submitted text</caption>
          <thead>
            <tr>
              <th scope="col">Entity</th>
              <th scope="col">Type</th>
              <th scope="col">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((entity, index) => {
              const label = entity?.label || "OTHER_MEDICAL";
              return (
                <tr key={`${entity?.start ?? "entity"}-${entity?.end ?? index}-${label}`}>
                  <td data-label="Entity" className="entity-name">{entity?.text || "—"}</td>
                  <td data-label="Type">
                    <span className={`entity-type entity-type--${entityClassName(label)}`}>{label}</span>
                  </td>
                  <td data-label="Confidence" className="confidence">{formatConfidence(entity?.confidence)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default EntityResults;
