function Disclaimer() {
  return (
    <aside className="disclaimer" aria-labelledby="disclaimer-title">
      <div className="disclaimer-mark" aria-hidden="true">i</div>
      <div>
        <p className="eyebrow">Important scope limitation</p>
        <h2 id="disclaimer-title">Experimental information extraction demo</h2>
        <p>
          Demo only — MemoryCare NER extracts information from text and is not a medical diagnostic or treatment
          system. Do not enter real patient data.
        </p>
      </div>
    </aside>
  );
}

export default Disclaimer;
