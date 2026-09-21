function AnalyzeButton({ loading, onClick }) {
  return (
    <button className="analyze-button" type="button" onClick={onClick} disabled={loading}>
      {loading ? <span className="button-loader" aria-hidden="true" /> : null}
      <span>{loading ? "Analyzing text…" : "Analyze Text"}</span>
    </button>
  );
}

export default AnalyzeButton;
