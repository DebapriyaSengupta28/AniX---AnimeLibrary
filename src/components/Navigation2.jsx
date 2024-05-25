import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navigation2.css";
import logo from '../assets/logo/logo.png';

function Navigation2() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  return (
    <nav className="navigation2">
      <div className="nav-left">
        {/* Logo wrapped with Link */}
        <Link to="/">
          <img src={logo} alt="Logo" className="navigation-logo" />
        </Link>
      </div>
      <div className="nav-center">
        {/* Search bar start */}
        <div className="search-bar">
          {/* Search bar input */}
          <input
            type="text"
            placeholder="Search"
            className="search-input"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyDown={handleKeyDown}
          />
          {/* Filter button */}
          {/*<button type="button" className="filter-button">
            Filter
          </button>*/}
        </div>
        {/* Search bar end */}
        {/* Search button */}
        <button type="button" className="search-button" onClick={handleSearchClick}>
          Search
        </button>
      </div>
      <div className="nav-right">
        <ul className="app-links">
          <li>
            <Link to="/HomePage">Home</Link>
          </li>
          <li>
            <Link to="/Trending">Trending</Link>
          </li>
          <li>
            <Link to="/WatchList">Watchlist</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation2;