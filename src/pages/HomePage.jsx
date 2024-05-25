import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navigation2 from "../components/Navigation2";
import LoadMoreButton from "../components/LoadMoreButton";
import ScrollToTopButton from "../components/ScrollToTopButton";

function HomePage() {
  const [popularAnime, setPopularAnime] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalPages, setTotalPages] = useState(1); // Track total pages
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  useEffect(() => {
    // Fetch popular anime data from AniList API
    const fetchAnimeData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post("https://graphql.anilist.co", {
          query: `
            query {
              Page(page: ${currentPage}, perPage: 24) {
                pageInfo {
                  total
                  currentPage
                  lastPage
                }
                media(type: ANIME, sort: POPULARITY_DESC) {
                  id
                  title {
                    romaji
                  }
                  coverImage {
                    extraLarge
                  }
                }
              }
            }
          `,
        });
  
        const pageInfo = response.data.data.Page.pageInfo;
        setTotalPages(pageInfo.lastPage);
        setCurrentPage(pageInfo.currentPage);
  
        // Only update the popularAnime state with data from the first page
        if (currentPage === 1) {
          setPopularAnime(response.data.data.Page.media);
        } else {
          // Update popularAnime state by merging new data with existing data
          setPopularAnime(prevAnime => [...prevAnime, ...response.data.data.Page.media]);
        }
      } catch (error) {
        console.error("Error fetching popular anime:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    // Fetch data for the first page when the component mounts
    fetchAnimeData();
  
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
  }, [currentPage]); // Include currentPage in the dependency array
  
  // Function to handle "Load More" button click
  const handleLoadMore = () => {
    if (!isLoading && currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

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
      <h1 style={{ marginBottom: "50px" }}>Popular</h1>
      {popularAnime.length > 0 && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            {popularAnime.map((anime) => (
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
                  {/* Link to the detail page with anime id as URL parameter */}
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
            ))}
          </div>
          {currentPage < totalPages && (
            <LoadMoreButton onClick={handleLoadMore} isLoading={isLoading} />
          )}
        </>
      )}
      {/* ScrollToTopButton component */}
      <ScrollToTopButton />
    </div>
  );
}

export default HomePage;