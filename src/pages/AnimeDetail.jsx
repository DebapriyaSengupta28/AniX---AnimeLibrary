import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Navigation2 from "../components/Navigation2";

// Create a queue to store pending requests
const requestQueue = [];

// Function to process the next request in the queue
const processNextRequest = async () => {
  if (requestQueue.length > 0) {
    const request = requestQueue.shift();
    try {
      const response = await request.fn(...request.args);
      request.resolve(response);
    } catch (error) {
      request.reject(error);
    }
    // Wait for a short delay before processing the next request
    setTimeout(processNextRequest, 500); // Adjust the delay as needed
  }
};

// Wrap the existing axios.post function with a promise that enqueues the request
const enqueuedAxiosPost = (...args) => {
  return new Promise((resolve, reject) => {
    requestQueue.push({ fn: axios.post, args, resolve, reject });
    if (requestQueue.length === 1) {
      processNextRequest();
    }
  });
};

function AnimeDetail() {
  const { animeId } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [additionalContent, setAdditionalContent] = useState([]);
  const [recommendedAnime, setRecommendedAnime] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [animeList, setAnimeList] = useState([]);
  const [currentList, setCurrentList] = useState("");

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        setLoading(true);
        const response = await enqueuedAxiosPost("https://graphql.anilist.co", {
          query: `
            query ($id: Int) {
              Media(id: $id, type: ANIME) {
                id
                title {
                  romaji
                  english
                }
                coverImage {
                  extraLarge
                }
                description
                startDate {
                  year
                  month
                  day
                }
                endDate {
                  year
                  month
                  day
                }
                episodes
                genres
                studios(isMain: true) {
                  nodes {
                    name
                  }
                }
                averageScore
                source
                externalLinks {
                  url
                  site
                }
                streamingEpisodes {
                  title
                  url
                  site
                }
                relations {
                  edges {
                    relationType
                    node {
                      __typename
                      ... on Media {
                        id
                        title {
                          romaji
                          english
                        }
                        coverImage {
                          extraLarge
                        }
                        type
                        genres
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: {
            id: parseInt(animeId),
          },
        });

        const cleanDescription = response.data.data.Media.description.replace(
          /<br\s*\/?>|<i\s*>\s*<\s*\/i\s*>/gi,
          "",
        );
        const descriptionParagraphs = cleanDescription.split("\n");

        setAnime({
          ...response.data.data.Media,
          description: descriptionParagraphs,
        });

        const relatedContent = response.data.data.Media.relations.edges;
        setAdditionalContent(relatedContent);

        // Fetch recommended anime based on content-based filtering
        const recommended = await fetchRecommendedAnime(
          response.data.data.Media,
        );
        setRecommendedAnime(recommended);
      } catch (error) {
        console.error("Error fetching anime detail:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch data whenever the animeId changes (component mounts or updates with a new animeId)
    fetchAnimeData();

    // Apply styles to the body element
    document.body.style.backgroundColor = "black";
    document.body.style.color = "white";
    document.body.style.fontFamily = "'Roboto', sans-serif";

    // Clean up styles when the component unmounts
    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
      document.body.style.fontFamily = "";
    };
  }, [animeId]); // Include animeId in the dependency array

  const fetchRecommendedAnime = async (mainAnime) => {
    try {
      // Fetch anime with similar genres
      const response = await enqueuedAxiosPost("https://graphql.anilist.co", {
        query: `
          query ($genres: [String], $id: Int) {
            Page(page: 1, perPage: 20) {
              media(type: ANIME, genre_in: $genres, id_not: $id, sort: POPULARITY_DESC) {
                id
                title {
                  romaji
                  english
                }
                coverImage {
                  extraLarge
                }
              }
            }
          }
        `,
        variables: {
          genres: mainAnime.genres,
          id: mainAnime.id,
        },
      });

      // Ensure we have at least 10 recommendations
      let recommended = response.data.data.Page.media;
      if (recommended.length < 10) {
        // If less than 10 recommendations, fetch more without genre filtering
        const additionalResponse = await enqueuedAxiosPost(
          "https://graphql.anilist.co",
          {
            query: `
            query ($id: Int) {
              Page(page: 1, perPage: ${10 - recommended.length}, id_not: $id, sort: POPULARITY_DESC) {
                media(type: ANIME, id_not: $id) {
                  id
                  title {
                    romaji
                    english
                  }
                  coverImage {
                    extraLarge
                  }
                }
              }
            }
          `,
            variables: {
              id: mainAnime.id,
            },
          },
        );

        recommended = recommended.concat(
          additionalResponse.data.data.Page.media,
        );
      }

      return recommended.slice(0, 10); // Return at most 10 recommendations
    } catch (error) {
      console.error("Error fetching recommended anime:", error);
      // Fallback to fetch popular anime as recommendations
      const response = await enqueuedAxiosPost("https://graphql.anilist.co", {
        query: `
          query {
            Page(page: 1, perPage: 10) {
              media(type: ANIME, sort: POPULARITY_DESC) {
                id
                title {
                  romaji
                  english
                }
                coverImage {
                  extraLarge
                }
              }
            }
          }
        `,
      });

      return response.data.data.Page.media;
    }
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const toggleLessDescription = () => {
    setShowFullDescription(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        event.target.tagName !== "BUTTON"
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Retrieve the saved anime list from local storage
    const savedAnimeList = JSON.parse(localStorage.getItem("animeList")) || [];
    setAnimeList(savedAnimeList);

    // Check if the current anime is already in a list
    const currentAnime = savedAnimeList.find(
      (item) => item.id === parseInt(animeId),
    );
    if (currentAnime) {
      setCurrentList(currentAnime.listType);
    } else {
      // Reset currentList to an empty string if the anime is not in the list
      setCurrentList("");
    }
  }, [animeId]);

  const toggleDropdown = () => {
    setShowDropdown((prevShowDropdown) => !prevShowDropdown);
  };

  const handleAddToList = (listType) => {
    const updatedAnimeList = animeList.filter((item) => item.id !== anime.id); // Remove the anime from any existing list
    updatedAnimeList.push({ ...anime, listType }); // Add the anime to the new list
    setAnimeList(updatedAnimeList);
    localStorage.setItem("animeList", JSON.stringify(updatedAnimeList));
    setCurrentList(listType);
    setShowDropdown(false);
  };

  const handleRemoveFromList = () => {
    const updatedAnimeList = animeList.filter((item) => item.id !== anime.id);
    setAnimeList(updatedAnimeList);
    localStorage.setItem("animeList", JSON.stringify(updatedAnimeList));
    setCurrentList("");
    setShowDropdown(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!anime) {
    return <div>No anime found.</div>;
  }

  const dropdownButtonStyle = {
    marginBottom: "8px",
    display: "block",
    width: "100%",
    padding: "8px 12px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#ffffff",
    color: "#333333",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.3s ease, color 0.3s ease",
  };

  return (
    <div>
      <div style={{ height: "100px" }}></div>
      <div style={{ width: "80%", margin: "0 auto" }}>
        <div
          style={{
            border: "1px solid rgb(188, 31, 102)",
            borderRadius: "10px",
            padding: "20px",
            position: "relative",
          }}
        >
          <Navigation2 />
          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <div>
              <img
                src={anime.coverImage.extraLarge}
                alt={anime.title.romaji}
                style={{ width: "300px", height: "450px", objectFit: "cover" }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                flex: "1",
              }}
            >
              <div>
                <h2>{anime.title.romaji}</h2>
                {anime.title.english && (
                  <p>
                    <strong>English Name:</strong> {anime.title.english}
                  </p>
                )}
                <p>
                  <strong>Air Date:</strong>{" "}
                  {`${anime.startDate.year}/${anime.startDate.month}/${anime.startDate.day}`}
                </p>
                {anime.endDate && (
                  <p>
                    <strong>End Date:</strong>{" "}
                    {`${anime.endDate.year}/${anime.endDate.month}/${anime.endDate.day}`}
                  </p>
                )}
                <p>
                  <strong>Total Episodes:</strong> {anime.episodes}
                </p>
                <p>
                  <strong>Genres:</strong> {anime.genres.join(", ")}
                </p>
                {anime.studios.nodes.length > 0 && (
                  <p>
                    <strong>Animation Studio:</strong>{" "}
                    {anime.studios.nodes[0].name}
                  </p>
                )}
                <p>
                  <strong>Source:</strong> {anime.source}
                </p>
                <p>
                  <strong>Score:</strong> {anime.averageScore}/100
                </p>
                <p>
                  <strong>External Links:</strong>
                  <ul style={{ display: "inline", paddingInlineStart: 0 }}>
                    {anime.externalLinks.map((link, index) => (
                      <li
                        key={index}
                        style={{ display: "inline", marginRight: "10px" }}
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "rgb(188, 31, 102)" }}
                        >
                          {link.site}
                        </a>
                      </li>
                    ))}
                  </ul>
                </p>
              </div>
            </div>
          </div>
          <div>
            <button
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "#ff00ff",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
                transition:
                  "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
                width: "140px", // Adjust the width to fit the longest text
                textAlign: "center", // Ensure the text is centered
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "black";
                e.target.style.border = "1px solid #ff00ff";
                e.target.style.color = "#ff00ff";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#ff00ff";
                e.target.style.border = "none";
                e.target.style.color = "white";
              }}
              onClick={toggleDropdown}
            >
              {currentList ? "Edit List" : "Add to List"}
            </button>
            {showDropdown && (
              <div
                ref={dropdownRef}
                style={{
                  position: "absolute",
                  marginTop: "10px",
                  width: "120px",
                  top: "50px",
                  right: "10px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  borderRadius: "8px",
                  padding: "8px 0",
                  zIndex: "1", // Ensure dropdown appears above other elements
                }}
              >
                <button
                  style={{
                    ...dropdownButtonStyle,
                    marginBottom: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                  onClick={() => handleAddToList("Watching")}
                >
                  Watching
                </button>
                <button
                  style={{
                    ...dropdownButtonStyle,
                    marginBottom: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                  onClick={() => handleAddToList("Plan to Watch")}
                >
                  Plan to Watch
                </button>
                <button
                  style={{
                    ...dropdownButtonStyle,
                    marginBottom: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                  onClick={() => handleAddToList("Completed")}
                >
                  Completed
                </button>
                <button
                  style={{
                    ...dropdownButtonStyle,
                    marginBottom: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                  onClick={() => handleAddToList("Dropped")}
                >
                  Dropped
                </button>
                {currentList && (
                  <button
                    style={{
                      ...dropdownButtonStyle,
                      color: "#FF0000",
                      marginBottom: "8px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#f0f0f0";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#ffffff";
                    }}
                    onClick={handleRemoveFromList}
                  >
                    Remove
                  </button>
                )}
              </div>
            )}

            <h3>Description</h3>
            {showFullDescription ? (
              <>
                {anime.description.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
                <button
                  onClick={toggleLessDescription}
                  style={{
                    cursor: "pointer",
                    color: "rgb(188, 31, 102)",
                    border: "none",
                    background: "none",
                    fontSize: "16px",
                    padding: "0", // Adjusted padding to remove padding
                    margin: "0", // Adjusted margin to remove margin
                    lineHeight: "normal", // Adjusted line height to ensure normal alignment
                    display: "block", // Ensures the button is displayed as a block element
                    width: "auto", // Set width to auto to take the width of the content
                  }}
                >
                  Read less
                </button>
              </>
            ) : (
              <>
                {anime.description.slice(0, 3).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
                {anime.description.length > 3 && (
                  <p
                    style={{
                      cursor: "pointer",
                      color: "rgb(188, 31, 102)",
                      fontSize: "16px",
                    }}
                    onClick={toggleDescription}
                  >
                    Read more
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {additionalContent.length > 0 && (
        <div style={{ marginTop: "20px", width: "80%", margin: "0 auto" }}>
          <h3>Related Anime</h3>
          <div
            className="related-anime-container"
            style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}
          >
            {additionalContent
              .filter(
                (content) =>
                  content.node.__typename === "Media" &&
                  content.node.type === "ANIME",
              )
              .map((content, index) => (
                <div
                  className="related-anime-item"
                  key={index}
                  style={{ width: "200px" }}
                >
                  <Link
                    to={`/anime/${content.node.id}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={
                        content.node.coverImage
                          ? content.node.coverImage.extraLarge
                          : ""
                      }
                      alt={content.node.title.romaji}
                      style={{
                        width: "100%",
                        height: "280px",
                        objectFit: "cover",
                        borderRadius: "5px",
                        marginBottom: "5px",
                        transition: "border 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.border = "2px solid rgb(188, 31, 102)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.border = "2px solid transparent")
                      }
                    />
                    <p
                      style={{
                        textAlign: "center",
                        fontSize: "14px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        width: "100%",
                      }}
                    >
                      {content.node.title.romaji}
                    </p>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      )}

      {recommendedAnime.length > 0 && (
        <div style={{ marginTop: "20px", width: "80%", margin: "0 auto" }}>
          <h3>Recommended Anime</h3>
          <div
            className="related-anime-container"
            style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}
          >
            {recommendedAnime.map((anime, index) => (
              <div
                className="related-anime-item"
                key={index}
                style={{ width: "200px" }}
              >
                <Link
                  to={`/anime/${anime.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={anime.coverImage ? anime.coverImage.extraLarge : ""}
                    alt={anime.title.romaji}
                    style={{
                      width: "100%",
                      height: "280px",
                      objectFit: "cover",
                      borderRadius: "5px",
                      marginBottom: "5px",
                      transition: "border 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.border = "2px solid rgb(188, 31, 102)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.border = "2px solid transparent")
                    }
                  />
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: "14px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%",
                    }}
                  >
                    {anime.title.romaji}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnimeDetail;
