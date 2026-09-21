function TextInput({ value, onChange, disabled }) {
  return (
    <div className="text-input-field">
      <label htmlFor="clinical-text">Clinical note</label>
      <textarea
        id="clinical-text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste or type a fictional healthcare note here…"
        maxLength={10000}
        disabled={disabled}
        spellCheck="true"
        aria-describedby="clinical-text-helper clinical-text-count"
      />
      <div className="input-meta">
        <p id="clinical-text-helper">Use fictional or de-identified demo text only. This prototype does not store notes.</p>
        <span id="clinical-text-count" aria-live="polite">{value.length.toLocaleString()} / 10,000</span>
      </div>
    </div>
  );
}

export default TextInput;
