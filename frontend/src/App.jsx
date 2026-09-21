import { useState } from "react";
import AnalyzeButton from "./components/AnalyzeButton";
import Disclaimer from "./components/Disclaimer";
import EntityLegend from "./components/EntityLegend";
import EntityResults from "./components/EntityResults";
import Header from "./components/Header";
import HighlightedText from "./components/HighlightedText";
import LoadingState from "./components/LoadingState";
import Statistics from "./components/Statistics";
import TextInput from "./components/TextInput";
import { analyzeText } from "./services/api";

const SAMPLE_NOTE =
  "Patient is a 68-year-old individual reporting progressive memory loss and increasing confusion over the past six months. Family members report difficulty remembering recent events. The patient is currently taking Donepezil. A cognitive assessment and MRI of the brain are planned.";

function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setResults(null);
      setError("Enter some clinical text before starting an analysis.");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      // Send the exact displayed text so entity offsets remain valid for highlighting.
      const response = await analyzeText(text);
      setResults(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to analyze the text. Please make sure the backend services are running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setText(SAMPLE_NOTE);
    setResults(null);
    setError("");
  };

  const handleClear = () => {
    setText("");
    setResults(null);
    setError("");
  };

  const entities = Array.isArray(results?.entities) ? results.entities : [];

  return (
    <div className="app-shell">
      <Header />

      <main className="dashboard" id="main-content">
        <section className="workspace-grid" aria-label="NER workspace">
          <section className="panel input-panel" aria-labelledby="input-title">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Step 1</p>
                <h1 id="input-title">Input clinical text</h1>
              </div>
              <span className="demo-chip">Fictional data only</span>
            </div>

            <TextInput value={text} onChange={setText} disabled={loading} />

            <div className="action-row">
              <div className="secondary-actions">
                <button className="secondary-button" type="button" onClick={handleLoadSample} disabled={loading}>
                  Load sample
                </button>
                <button
                  className="secondary-button secondary-button--quiet"
                  type="button"
                  onClick={handleClear}
                  disabled={loading || (!text && !results && !error)}
                >
                  Clear
                </button>
              </div>
              <AnalyzeButton loading={loading} onClick={handleAnalyze} />
            </div>

            {error ? (
              <div className="error-message" role="alert">
                <span className="error-mark" aria-hidden="true">!</span>
                <p>{error}</p>
              </div>
            ) : null}
          </section>

          <section className="panel results-panel" aria-labelledby="results-title">
            <div className="panel-heading results-heading">
              <div>
                <p className="eyebrow">Step 2</p>
                <h2 id="results-title">Analysis results</h2>
              </div>
              {results ? <span className="complete-chip">Analysis complete</span> : null}
            </div>

            {loading ? <LoadingState /> : null}

            {!loading && results ? (
              <div className="results-content">
                <Statistics entities={entities} statistics={results.statistics} />
                <EntityResults entities={entities} />
              </div>
            ) : null}

            {!loading && !results ? (
              <div className="results-empty" aria-live="polite">
                <span className="empty-marker" aria-hidden="true">+</span>
                <div>
                  <h3>Ready when you are</h3>
                  <p>Enter a fictional healthcare note, then select Analyze Text to view extracted entities.</p>
                </div>
              </div>
            ) : null}
          </section>
        </section>

        <HighlightedText text={text} entities={results ? entities : []} hasAnalysis={Boolean(results)} />

        <section className="support-grid" aria-label="Entity reference and safety notice">
          <EntityLegend />
          <Disclaimer />
        </section>
      </main>
    </div>
  );
}

export default App;
