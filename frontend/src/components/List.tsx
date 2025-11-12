import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

interface ItemType {
  id: number;
  item_name: string;
  category: string;
  price: string | number;
  brought_by: { id: number; username: string } | null;
  brought_to: { id: number; username: string }[] | [];
  created_at: string;
  calculated_data?: {
    id?: number;
    item_name?: string;
    category?: string;
    price?: number;
    tax_rate?: number;
    item_price?: number;
    share?: Record<string, number>;
  };
}

interface ListType {
  id: number;
  list_name: string;
  created_at: string;
  items: ItemType[];
}

interface TotalsType {
  item_data: any[];
  total_expense: string;
  total_expense_without_tax: string;
  total_tax: string;
}

const ListDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<ListType | null>(null);
  const [totals, setTotals] = useState<TotalsType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.get(`/api/lists/${id}/`);
        const payloadList = res.data?.list ?? res.data;
        const payloadTotals = res.data?.totals ?? null;
        setList(payloadList);
        setTotals(payloadTotals);
      } catch (err) {
        console.error("Failed to load list", err);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [id]);

  if (loading) {
    return (
      <div className="container page-container">
        <div className="loading-state">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading list details...</p>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="container page-container">
        <div className="empty-state">
          <h3>List not found</h3>
          <Link to="/home" className="btn btn-primary mt-3">Back to Lists</Link>
        </div>
      </div>
    );
  }

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
          <h1 className="page-title mt-2">{list.list_name}</h1>
          <p className="page-subtitle">Created on {new Date(list.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <Link to={`/lists/${id}/items/new`} className="btn btn-primary btn-create">
          <svg width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
          Add Items
        </Link>
      </div>

      {totals && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon summary-icon-primary">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
              </svg>
            </div>
            <div>
              <p className="summary-label">Total Items</p>
              <p className="summary-value">{list.items.length}</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon summary-icon-success">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 3a2 2 0 0 1 2-2h13.5a.5.5 0 0 1 0 1H15v2a1 1 0 0 1 1 1v8.5a1.5 1.5 0 0 1-1.5 1.5h-12A2.5 2.5 0 0 1 0 12.5V3zm1 1.732V12.5A1.5 1.5 0 0 0 2.5 14h12a.5.5 0 0 0 .5-.5V5H2a1.99 1.99 0 0 1-1-.268zM1 3a1 1 0 0 0 1 1h12V2H2a1 1 0 0 0-1 1z"/>
              </svg>
            </div>
            <div>
              <p className="summary-label">Subtotal</p>
              <p className="summary-value">${Number(totals.total_expense_without_tax).toFixed(2)}</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon summary-icon-warning">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z"/>
              </svg>
            </div>
            <div>
              <p className="summary-label">Tax</p>
              <p className="summary-value">${Number(totals.total_tax).toFixed(2)}</p>
            </div>
          </div>

          <div className="summary-card summary-card-highlight">
            <div className="summary-icon summary-icon-crimson">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2H3z"/>
              </svg>
            </div>
            <div>
              <p className="summary-label">Total</p>
              <p className="summary-value">${Number(totals.total_expense).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {list.items.length === 0 ? (
        <div className="empty-state mt-4">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
          </svg>
          <h3>No items yet</h3>
          <p>Add items to this list to start tracking expenses</p>
          <Link to={`/lists/${id}/items/new`} className="btn btn-primary mt-3">
            <svg width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            Add First Item
          </Link>
        </div>
      ) : (
        <div className="table-responsive mt-4">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Brought By</th>
                <th>Shared With</th>
                <th>With Tax</th>
                <th>Share Breakdown</th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((it) => (
                <tr key={it.id}>
                  <td className="fw-semibold">{it.item_name}</td>
                  <td>
                    <span className="badge-category">{it.category}</span>
                  </td>
                  <td className="text-muted">
                    ${typeof it.price === "string" ? parseFloat(it.price).toFixed(2) : Number(it.price).toFixed(2)}
                  </td>
                  <td>{it.brought_by?.username ?? "-"}</td>
                  <td className="text-small">{(it.brought_to?.map((u) => u.username) ?? []).join(", ") || "-"}</td>
                  <td className="fw-semibold">
                    ${it.calculated_data?.item_price != null ? Number(it.calculated_data.item_price).toFixed(2) : "-"}
                  </td>
                  <td>
                    {it.calculated_data?.share ? (
                      <div className="share-breakdown">
                        {Object.entries(it.calculated_data.share).map(([user, amt]) => (
                          <div key={user} className="share-item">
                            <span className="share-user">{user}</span>
                            <span className="share-amount">${Number(amt).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListDetail;