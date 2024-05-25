import { Link } from "react-router-dom";
import "./Navigation.css";

function Navigation() {
  return (
    <nav className="navigation">
      <ul>
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
    </nav>
  );
}

export default Navigation;
