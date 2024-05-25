function ScrollToTopButton() {
    const handleScrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };
  
    return (
      <button
        onClick={handleScrollToTop}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: "#ff00ff",
          color: "white",
          border: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <i className="fas fa-arrow-up" style={{ fontSize: "24px" }}></i>
      </button>
    );
  }
  
  export default ScrollToTopButton;