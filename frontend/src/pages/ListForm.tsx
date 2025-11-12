import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/api";

interface ListFormParams {
  id?: string;
  [key: string]: string | undefined;
}

const ListForm = () => {
  const { id } = useParams<ListFormParams>();
  const navigate = useNavigate();
  const [listName, setListName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/lists/${id}/`);
        const payload = res.data?.list ?? res.data;
        setListName(payload?.list_name ?? "");
      } catch (e) {
        console.error("Failed to fetch list", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await api.put(`/api/lists/${id}/`, { list_name: listName });
      } else {
        await api.post("/api/lists/", { list_name: listName });
      }
      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("Failed to save list");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Delete this list and all its items? This cannot be undone.")) return;
    setLoading(true);
    try {
      await api.delete(`/api/lists/${id}/`);
      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("Failed to delete list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-container">
      <div className="page-header">
        <div>
          <Link to="/home" className="breadcrumb-link">
            <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            Back to Lists
          </Link>
          <h1 className="page-title mt-2">{id ? "Edit List" : "Create New List"}</h1>
          <p className="page-subtitle">
            {id ? "Update your list details" : "Create a new list to organize your expenses"}
          </p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: "600px" }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label">
                <svg width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                  <path d="M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm2-2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zm1.5.5A.5.5 0 0 1 1 13V6a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-13z"/>
                </svg>
                List Name
              </label>
              <input
                className="form-control"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                required
                placeholder="e.g., Groceries November, Household Items"
                maxLength={100}
              />
              <small className="text-muted d-block mt-2">
                Choose a descriptive name for your list
              </small>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                  <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                </svg>
                {id ? "Update List" : "Create List"}
              </button>

              {id && (
                <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                  <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                  </svg>
                  Delete List
                </button>
              )}

              <button type="button" className="btn btn-outline-secondary ms-auto" onClick={() => navigate("/home")} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ListForm;