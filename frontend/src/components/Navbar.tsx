
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-custom shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <div className="brand-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="url(#gradient)"/>
              <path d="M16 8L8 14V24H12V18H20V24H24V14L16 8Z" fill="white"/>
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#DC143C"/>
                  <stop offset="100%" stopColor="#00B7EB"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="brand-text ms-2">ManageYourHome</span>
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link nav-link-custom" to="/public">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="btn btn-primary-custom ms-2" to="/login">
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link className="btn btn-outline-custom ms-2" to="/register">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;