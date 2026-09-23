import './PageLoader.css';

function PageLoader() {
  return (
    <div className="page-loader-container">
      <div className="spinner-glow"></div>
      <p className="loader-text">⚡ Dynamically loading route via <code>React.lazy()</code>...</p>
    </div>
  );
}

export default PageLoader;
