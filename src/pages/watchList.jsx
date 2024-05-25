import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation2 from "../components/Navigation2";

const WatchList = () => {
  const [animeList, setAnimeList] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Retrieve the saved anime list from local storage
    const savedAnimeList = JSON.parse(localStorage.getItem("animeList")) || [];
    setAnimeList(savedAnimeList);

    // Apply styles to the body element
    document.body.style.backgroundColor = "black";
    document.body.style.color = "white";
    document.body.style.fontFamily = "'Roboto', sans-serif"; // Apply Roboto font to all text

    // Reset styles when the component unmounts
    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
      document.body.style.fontFamily = "";
    };
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const filteredList =
    filter === "all"
      ? animeList
      : animeList.filter((anime) => anime.listType === filter);

  return (
    <div
      style={{
        marginTop: "80px",
        textAlign: "left",
        padding: "20px",
        position: "relative",
      }}
    >
      <Navigation2 />
      <h2>Watch List</h2>
      <div style={{ marginBottom: "20px" }}>
        <button
          style={{
            width: "150px",
            height: "40px",
            backgroundColor: filter === "all" ? "black" : "#ff00ff",
            color: filter === "all" ? "#ff00ff" : "white",
            border: "none",
            padding: "8px 10px",
            borderRadius: "20px",
            cursor: "pointer",
            fontSize: "14px",
            marginRight: "10px",
          }}
          onClick={() => handleFilterChange("all")}
        >
          All
        </button>
        <button
          style={{
            width: "150px",
            height: "40px",
            backgroundColor: filter === "Watching" ? "black" : "#ff00ff",
            color: filter === "Watching" ? "#ff00ff" : "white",
            border: "none",
            padding: "8px 10px",
            borderRadius: "20px",
            cursor: "pointer",
            fontSize: "14px",
            marginRight: "10px",
          }}
          onClick={() => handleFilterChange("Watching")}
        >
          Watching
        </button>
        <button
          style={{
            width: "150px",
            height: "40px",
            backgroundColor: filter === "Plan to Watch" ? "black" : "#ff00ff",
            color: filter === "Plan to Watch" ? "#ff00ff" : "white",
            border: "none",
            padding: "8px 10px",
            borderRadius: "20px",
            cursor: "pointer",
            fontSize: "14px",
            marginRight: "10px",
          }}
          onClick={() => handleFilterChange("Plan to Watch")}
        >
          Plan to Watch
        </button>
        <button
          style={{
            width: "150px",
            height: "40px",
            backgroundColor: filter === "Completed" ? "black" : "#ff00ff",
            color: filter === "Completed" ? "#ff00ff" : "white",
            border: "none",
            padding: "8px 10px",
            borderRadius: "20px",
            cursor: "pointer",
            fontSize: "14px",
            marginRight: "10px",
          }}
          onClick={() => handleFilterChange("Completed")}
        >
          Completed
        </button>
        <button
          style={{
            width: "150px",
            height: "40px",
            backgroundColor: filter === "Dropped" ? "black" : "#ff00ff",
            color: filter === "Dropped" ? "#ff00ff" : "white",
            border: "none",
            padding: "8px 10px",
            borderRadius: "20px",
            cursor: "pointer",
            fontSize: "14px",
            marginRight: "10px",
          }}
          onClick={() => handleFilterChange("Dropped")}
        >
          Dropped
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {filteredList.length === 0 ? (
          <p style={{ gridColumn: "span 6", textAlign: "center" }}>Empty list</p>
        ) : (
          filteredList.map((anime) => (
            <div
              key={anime.id}
              style={{
                width: "200px",
                textAlign: "center",
                marginBottom: "15px",
              }}
            >
              <Link
                to={`/anime/${anime.id}`}
                style={{
                  textDecoration: "none",
                  color: "white",
                  display: "inline-block",
                  cursor: "pointer",
                }}
              >
                <img
                  src={anime.coverImage.extraLarge}
                  alt={anime.title.romaji}
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                    border: "2px solid transparent",
                    transition: "border 0.3s ease",
                    cursor: "pointer",
                    marginBottom: "5px",
                  }}
                  className="poster-image"
                  onMouseEnter={(e) =>
                    (e.target.style.border = "2px solid rgb(188, 31, 102)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.border = "2px solid transparent")
                  }
                />
              </Link>
              <p
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "white",
                  margin: "5px 0",
                }}
              >
                <Link
                  to={`/anime/${anime.id}`}
                  style={{
                    textDecoration: "none",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  {anime.title.romaji}
                </Link>
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WatchList;
