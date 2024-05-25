import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Navigation2 from "../components/Navigation2";
import LoadMoreButton from "../components/LoadMoreButton";
import ScrollToTopButton from "../components/ScrollToTopButton";

function SearchPage() {
  const searchParams = new URLSearchParams(useLocation().search);
  const query = searchParams.get("q");
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post("https://graphql.anilist.co", {
          query: `
            query ($search: String, $page: Int, $perPage: Int) {
              Page(page: $page, perPage: $perPage) {
                pageInfo {
                  total
                  currentPage
                  lastPage
                }
                media(search: $search, type: ANIME) {
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
          variables: {
            search: query,
            page: currentPage,
            perPage: 24,
          },
        });

        const pageInfo = response.data.data.Page.pageInfo;
        setTotalPages(pageInfo.lastPage);
        setCurrentPage(pageInfo.currentPage);

        if (currentPage === 1) {
          setSearchResults(response.data.data.Page.media);
        } else {
          setSearchResults((prevResults) => [
            ...prevResults,
            ...response.data.data.Page.media,
          ]);
        }
      } catch (error) {
        console.error("Error fetching search data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      fetchSearchData();
    }

    // Apply styles to the body element
    document.body.style.backgroundColor = "black";
    document.body.style.color = "white";
    document.body.style.fontFamily = "'Roboto', sans-serif";

    // Reset styles when the component unmounts
    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
      document.body.style.fontFamily = "";
    };
  }, [query, currentPage]);

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
      <h1 style={{ marginBottom: "50px" }}>Search Results for: {query}</h1>
      {searchResults.length > 0 && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, minmax(200px, 1fr))", // Fixed number of columns
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            {searchResults.map((anime) => (
              <div
                key={anime.id}
                style={{
                  width: "200px",
                  textAlign: "center",
                  marginBottom: "15px",
                }}
              >
                <a
                  href={`/anime/${anime.id}`}
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
                </a>
                <p
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "white",
                    margin: "5px 0",
                  }}
                >
                  <a
                    href={`/anime/${anime.id}`}
                    style={{
                      textDecoration: "none",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    {anime.title.romaji}
                  </a>
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

export default SearchPage;