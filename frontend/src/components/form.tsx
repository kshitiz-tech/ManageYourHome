import { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constant";
import "../style/Login.css";
import LoadingIndicator from "./LoadingIndicator";

interface Props {
  route: string;
  method: string;
}

const Form = ({ route, method }: Props) => {
  const [userDetail, setUserDetail] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    setLoading(true);
    setError("");
    e.preventDefault();

    try {
      const res = await api.post(route, {
        username: userDetail.username,
        password: userDetail.password,
      });

      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/home");
      } else {
        localStorage.clear();
        navigate("/login");
      }
    } catch (error: any) {
      setError(error?.response?.data?.detail || "An error occurred. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const name = method === "login" ? "Login" : "Register";
  const altText = method === "login" ? "Don't have an account?" : "Already have an account?";
  const altLink = method === "login" ? "/register" : "/login";
  const altLinkText = method === "login" ? "Sign up" : "Login";

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <h1 className="auth-title">{name}</h1>
          <p className="auth-subtitle">Welcome to ManageYourHome</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="alert alert-danger alert-modern" role="alert">
              {error}
            </div>
          )}

          <div className="form-group-modern">
            <label className="form-label-modern">Username</label>
            <input
              type="text"
              className="form-control-modern"
              value={userDetail.username}
              onChange={(event) => {
                setUserDetail({
                  ...userDetail,
                  username: event.target.value,
                });
              }}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group-modern">
            <label className="form-label-modern">Password</label>
            <input
              type="password"
              className="form-control-modern"
              value={userDetail.password}
              onChange={(e) => {
                setUserDetail({
                  ...userDetail,
                  password: e.target.value,
                });
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn-submit-modern" disabled={loading}>
            {loading ? <LoadingIndicator /> : name}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-alt-text">
            {altText} <Link to={altLink} className="auth-alt-link">{altLinkText}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Form;
