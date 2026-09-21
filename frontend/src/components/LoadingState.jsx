function LoadingState() {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <div>
        <h3>Analyzing text</h3>
        <p>The demo NER engine is identifying supported healthcare terms.</p>
      </div>
    </div>
  );
}

export default LoadingState;
