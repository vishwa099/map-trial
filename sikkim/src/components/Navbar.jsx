import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h1>Sikkim Tourism</h1>
      <div>
        <Link to="/">Home</Link>
        <Link to="/destinations">Destinations</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}

export default Navbar;
