import { useEffect, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";

interface ItemType {
  id: number;
  item_name: string;
  category: string;
  price: string | number;
  brought_by: { id: number; username: string } | null;
  brought_to: { id: number; username: string }[] | [];
  created_at: string;
  calculated_data?: any;
}

interface ListType {
  id: number;
  list_name: string;
  created_at: string;
  items: ItemType[];
}

interface PaginatedListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ListType[];
}

const Home = () => {
  const [lists, setLists] = useState<ListType[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const getLists = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/lists/?page=${page}`);
      const payload = res.data as PaginatedListResponse | ListType[];

      if (Array.isArray(payload)) {
        setLists(payload);
        setCount(payload.length);
        setNextPage(null);
        setPreviousPage(null);
        setCurrentPage(1);
      } else {
        setLists(payload.results || []);
        setCount(payload.count || 0);
        setNextPage(payload.next);
        setPreviousPage(payload.previous);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch lists", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLists();
  }, []);

  return (
    <div className="container page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Your Lists</h1>
          <p className="page-subtitle">Manage your household expenses and shopping lists</p>
        </div>
        <Link to="/lists/new" className="btn btn-primary btn-create">
          <svg width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
          Create New List
        </Link>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your lists...</p>
        </div>
      ) : lists.length === 0 ? (
        <div className="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <h3>No lists yet</h3>
          <p>Create your first list to start managing your household expenses</p>
          <Link to="/lists/new" className="btn btn-primary mt-3">
            <svg width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            Create Your First List
          </Link>
        </div>
      ) : (
        <>
          <div className="lists-grid">
            {lists.map((lst) => (
              <div key={lst.id} className="list-card">
                <div className="list-card-header">
                  <Link to={`/lists/${lst.id}`} className="list-card-title">
                    {lst.list_name}
                  </Link>
                  <div className="list-card-badge">
                    {lst.items?.length || 0} {lst.items?.length === 1 ? 'item' : 'items'}
                  </div>
                </div>
                <div className="list-card-meta">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                    <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                  </svg>
                  {new Date(lst.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="list-card-actions">
                  <Link to={`/lists/${lst.id}`} className="btn btn-sm btn-outline-secondary">
                    <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                      <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                    </svg>
                    View
                  </Link>
                  <Link to={`/lists/${lst.id}/edit`} className="btn btn-sm btn-outline-secondary">
                    <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                      <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                    </svg>
                    Edit
                  </Link>
                  <Link to={`/lists/${lst.id}/items/new`} className="btn btn-sm btn-success">
                    <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                    </svg>
                    Add Items
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {(previousPage || nextPage) && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted small">
                Showing page {currentPage} of {Math.max(1, Math.ceil(count / 7))}
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => getLists(currentPage - 1)}
                  disabled={!previousPage || loading}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => getLists(currentPage + 1)}
                  disabled={!nextPage || loading}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
