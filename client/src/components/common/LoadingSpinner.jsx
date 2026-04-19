function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p className="loading-text">{text}</p>
    </div>
  );
}

export default LoadingSpinner;
