import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link } from "react-router-dom";


function NavigationBar() {
  return (
    <div className="navbar">
      <ul className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/add">Add Profile</Link>
      </ul>
    </div>
  );
}

export default NavigationBar;