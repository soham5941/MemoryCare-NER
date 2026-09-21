function reportedOrDerived(statistics, key, fallback) {
  const reported = Number(statistics?.[key]);
  return Number.isFinite(reported) && reported >= 0 ? Math.round(reported) : fallback;
}

function Statistics({ entities, statistics }) {
  const counts = entities.reduce((allCounts, entity) => {
    const label = String(entity?.label || "OTHER_MEDICAL").toUpperCase();
    return { ...allCounts, [label]: (allCounts[label] || 0) + 1 };
  }, {});

  const cards = [
    {
      label: "Total entities",
      value: reportedOrDerived(statistics, "total", entities.length),
      tone: "total",
    },
    {
      label: "Symptoms",
      value: reportedOrDerived(statistics, "SYMPTOM", counts.SYMPTOM || 0),
      tone: "symptom",
    },
    {
      label: "Medications",
      value: reportedOrDerived(statistics, "MEDICATION", counts.MEDICATION || 0),
      tone: "medication",
    },
    {
      label: "Conditions",
      value: reportedOrDerived(statistics, "CONDITION", counts.CONDITION || 0),
      tone: "condition",
    },
    {
      label: "Dates / durations",
      value:
        reportedOrDerived(statistics, "DATE", counts.DATE || 0) +
        reportedOrDerived(statistics, "DURATION", counts.DURATION || 0),
      tone: "date",
    },
  ];

  return (
    <section className="statistics" aria-label="Entity statistics">
      <div className="stat-grid">
        {cards.map((card) => (
          <div className={`stat-card stat-card--${card.tone}`} key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Statistics;
