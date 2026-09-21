function entityClassName(label) {
  return String(label || "OTHER_MEDICAL")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function validEntitiesForText(text, entities) {
  if (!Array.isArray(entities)) {
    return [];
  }

  return entities
    .map((entity, index) => ({
      ...entity,
      start: Number(entity?.start),
      end: Number(entity?.end),
      originalIndex: index,
    }))
    .filter(
      (entity) =>
        Number.isInteger(entity.start) &&
        Number.isInteger(entity.end) &&
        entity.start >= 0 &&
        entity.end > entity.start &&
        entity.end <= text.length,
    )
    .sort((first, second) => {
      if (first.start !== second.start) {
        return first.start - second.start;
      }

      // Prefer the longer span when a response contains entities at the same offset.
      return second.end - first.end;
    });
}

function buildHighlightedText(text, entities) {
  const fragments = [];
  let cursor = 0;

  validEntitiesForText(text, entities).forEach((entity) => {
    // Overlapping entities cannot be represented as one flat text sequence. Keep the first,
    // longest matching span and leave any overlapping data out of the visual rendering.
    if (entity.start < cursor) {
      return;
    }

    if (entity.start > cursor) {
      fragments.push(text.slice(cursor, entity.start));
    }

    const label = entity.label || "OTHER_MEDICAL";
    const confidence = Number(entity.confidence);
    const confidenceText = Number.isFinite(confidence)
      ? `, ${Math.round((confidence <= 1 ? confidence * 100 : confidence))}% confidence`
      : "";

    fragments.push(
      <mark
        className={`highlight highlight--${entityClassName(label)}`}
        key={`${entity.start}-${entity.end}-${entity.originalIndex}`}
        aria-label={`${label}${confidenceText}`}
      >
        {text.slice(entity.start, entity.end)}
      </mark>,
    );

    cursor = entity.end;
  });

  if (cursor < text.length) {
    fragments.push(text.slice(cursor));
  }

  return fragments;
}

function HighlightedText({ text, entities, hasAnalysis }) {
  const displayText = typeof text === "string" ? text : "";
  const content = buildHighlightedText(displayText, entities);

  return (
    <section className="panel highlighted-panel" aria-labelledby="highlighted-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Review</p>
          <h2 id="highlighted-title">Highlighted text</h2>
        </div>
        {hasAnalysis ? <span className="offset-note">Highlights use returned text offsets</span> : null}
      </div>

      {displayText ? (
        <div className="highlighted-copy" aria-label="Original text with extracted entities highlighted">
          {content}
        </div>
      ) : (
        <div className="highlight-empty">
          <p>The submitted text will appear here after analysis.</p>
        </div>
      )}
    </section>
  );
}

export default HighlightedText;
