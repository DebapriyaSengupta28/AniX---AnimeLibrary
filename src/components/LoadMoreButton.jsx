import PropTypes from "prop-types";

function LoadMoreButton({ onClick, isLoading }) {
  return (
    <div style={{ textAlign: "center" }}>
      <button
        onClick={onClick}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#ff00ff",
          color: "white",
          border: "2px solid transparent",
          borderRadius: "5px",
          cursor: "pointer",
          transition:
            "background-color 0.3s, border-color 0.3s, color 0.3s",
          outline: "none",
        }}
        className="load-more-button"
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "transparent";
          e.target.style.borderColor = "#ff00ff";
          e.target.style.color = "#ff00ff";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "#ff00ff";
          e.target.style.borderColor = "transparent";
          e.target.style.color = "white";
        }}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Load More"}
      </button>
    </div>
  );
}

LoadMoreButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default LoadMoreButton;