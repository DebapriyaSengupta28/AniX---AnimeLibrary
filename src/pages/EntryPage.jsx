import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import './EntryPage.css';
import logo from '../assets/logo/logo.png';

function EntryPage() {
  const [randomImagePath, setRandomImagePath] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // eslint-disable-next-line no-useless-escape
    const importAllImages = import.meta.glob('../assets/homeBox/\*.{jpg,png,gif}', { eager: true });
    const imagePaths = Object.values(importAllImages);

    const getRandomImagePath = () => {
      const randomIndex = Math.floor(Math.random() * imagePaths.length);
      const randomImagePath = imagePaths[randomIndex].default;
      return randomImagePath;
    };

    const handleImageChange = () => {
      setRandomImagePath(getRandomImagePath());
    };

    handleImageChange();
    window.addEventListener('beforeunload', handleImageChange);

    const visibilityChangeHandler = () => {
      if (document.visibilityState === 'hidden' || document.hidden) {
        handleImageChange();
      }
    };

    document.addEventListener('visibilitychange', visibilityChangeHandler);

    return () => {
      window.removeEventListener('beforeunload', handleImageChange);
      document.removeEventListener('visibilitychange', visibilityChangeHandler);
    };
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = 'black';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

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
    <div className="homeContainer">
      <Navigation />
      <div className="homeBox">
        <div className="left-column">
          <div className="logoHolder">
            <img src={logo} alt="Logo" className="logo" />
          </div>
          <div className="leftElement">
            <div className="description">
              <p>Your Personalized Anime Watchlist</p>
            </div>
            <div className="inputContainer">
              <input
                type="text"
                placeholder="Search Anime..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleKeyDown}
              />
              <button onClick={handleSearchClick}>
                Search
              </button>
            </div>
            <div className="homeButton">
              <Link to="/HomePage">Home</Link>
            </div>
          </div>
        </div>
        <div className="right-column">
          <img src={randomImagePath} alt="Random Image" />
        </div>
      </div>
    </div>
  );
}

export default EntryPage;
