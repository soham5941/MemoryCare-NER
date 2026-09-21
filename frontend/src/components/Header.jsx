function Header() {
  return (
    <header className="site-header">
      <div className="header-content">
        <a className="brand" href="#main-content" aria-label="MemoryCare NER home">
          <span className="brand-mark" aria-hidden="true">MC</span>
          <span>
            <strong>MemoryCare NER</strong>
            <small>Healthcare Text Intelligence</small>
          </span>
        </a>

        <div className="engine-status" aria-label="NER Engine: Demo Mode">
          <span className="status-dot" aria-hidden="true" />
          <span>NER Engine: Demo Mode</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
