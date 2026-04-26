import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

interface User {
  id: number;
  username: string;
}

interface ItemType {
  id: number;
  item_name: string;
  category: "groceries" | "other";
  price: string | number;
  brought_by: User | null;
  brought_to: User[];
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

interface UserTotal {
  username: string;
  total: number;
  itemCount: number;
}

const ListItemsEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<ListType | null>(null);
  const [totals, setTotals] = useState<TotalsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<ItemType>>({});
  const [userTotals, setUserTotals] = useState<UserTotal[]>([]);

  const fetchList = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/lists/${id}/`);
      const payloadList = res.data?.list ?? res.data;
      const payloadTotals = res.data?.totals ?? null;
      setList(payloadList);
      setTotals(payloadTotals);
      calculateUserTotals(payloadList.items);
    } catch (err) {
      console.error("Failed to load list", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users/");
      setUsers(res.data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const calculateUserTotals = (items: ItemType[]) => {
    const totalsMap: Record<string, { total: number; itemCount: number }> = {};
    
    items.forEach(item => {
      if (item.calculated_data?.share) {
        Object.entries(item.calculated_data.share).forEach(([username, amount]) => {
          if (!totalsMap[username]) {
            totalsMap[username] = { total: 0, itemCount: 0 };
          }
          totalsMap[username].total += Number(amount);
          totalsMap[username].itemCount += 1;
        });
      }
    });

    const userTotalsArray = Object.entries(totalsMap).map(([username, data]) => ({
      username,
      total: data.total,
      itemCount: data.itemCount
    })).sort((a, b) => b.total - a.total);

    setUserTotals(userTotalsArray);
  };

  useEffect(() => {
    fetchList();
    fetchUsers();
  }, [id]);

  const handleEditClick = (item: ItemType) => {
    setEditingItem(item.id);
    setEditData({
      item_name: item.item_name,
      category: item.category,
      price: String(item.price),
      brought_to: item.brought_to,
    });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditData({});
  };

  const handleSaveEdit = async (itemId: number) => {
    if (!editData.item_name || !editData.price) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        item_name: editData.item_name,
        category: editData.category || "groceries",
        price: editData.price,
        brought_to_ids: editData.brought_to?.map(u => u.id) || [],
      };

      await api.put(`/api/lists/items/${itemId}/`, payload);
      await fetchList();
      setEditingItem(null);
      setEditData({});
    } catch (err) {
      console.error("Failed to update item", err);
      alert("Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    
    setLoading(true);
    try {
      await api.delete(`/api/lists/items/${itemId}/`);
      await fetchList();
    } catch (err) {
      console.error("Failed to delete item", err);
      alert("Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId: number) => {
    const currentUsers = editData.brought_to || [];
    const isSelected = currentUsers.some(u => u.id === userId);
    
    if (isSelected) {
      setEditData({
        ...editData,
        brought_to: currentUsers.filter(u => u.id !== userId)
      });
    } else {
      const user = users.find(u => u.id === userId);
      if (user) {
        setEditData({
          ...editData,
          brought_to: [...currentUsers, user]
        });
      }
    }
  };

  if (loading && !list) {
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
          <Link to={`/lists/${id}`} className="breadcrumb-link">
            <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            Back to List View
          </Link>
          <h1 className="page-title mt-2">Edit Items - {list.list_name}</h1>
          <p className="page-subtitle">Edit items and view user totals</p>
        </div>
        <Link to={`/lists/${id}/items/new`} className="btn btn-primary btn-create">
          <svg width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
          Add Items
        </Link>
      </div>

      {/* User Totals Summary */}
      {userTotals.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              <svg width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>
              </svg>
              User Totals
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {userTotals.map((userTotal, idx) => (
                <div key={userTotal.username} className="col-md-4">
                  <div className={`user-total-card ${idx === 0 ? 'highest' : ''}`}>
                    <div className="user-total-header">
                      <div className="user-avatar">
                        {userTotal.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h6 className="user-total-name">{userTotal.username}</h6>
                        <small className="text-muted">{userTotal.itemCount} item{userTotal.itemCount !== 1 ? 's' : ''}</small>
                      </div>
                    </div>
                    <div className="user-total-amount">
                      ${userTotal.total.toFixed(2)}
                    </div>
                    {idx === 0 && <div className="highest-badge">Highest</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overall Totals */}
      {totals && (
        <div className="summary-cards mb-4">
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

      {/* Items Table */}
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
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-modern">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Shared With</th>
                    <th>With Tax</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.items.map((item) => (
                    <tr key={item.id}>
                      {editingItem === item.id ? (
                        <>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={editData.item_name || ''}
                              onChange={(e) => setEditData({ ...editData, item_name: e.target.value })}
                            />
                          </td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={editData.category || 'groceries'}
                              onChange={(e) => setEditData({ ...editData, category: e.target.value as "groceries" | "other" })}
                            >
                              <option value="groceries">Groceries</option>
                              <option value="other">Other</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control form-control-sm"
                              value={editData.price || ''}
                              onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                            />
                          </td>
                          <td>
                            <div className="user-selection-compact">
                              {users.map((u) => (
                                <label key={u.id} className="user-checkbox-compact">
                                  <input
                                    type="checkbox"
                                    checked={(editData.brought_to || []).some(user => user.id === u.id)}
                                    onChange={() => handleUserToggle(u.id)}
                                  />
                                  <span>{u.username}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                          <td className="fw-semibold">
                            ${item.calculated_data?.item_price != null ? Number(item.calculated_data.item_price).toFixed(2) : "-"}
                          </td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-success"
                                onClick={() => handleSaveEdit(item.id)}
                                disabled={loading}
                              >
                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                                </svg>
                              </button>
                              <button
                                className="btn btn-secondary"
                                onClick={handleCancelEdit}
                                disabled={loading}
                              >
                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="fw-semibold">{item.item_name}</td>
                          <td>
                            <span className="badge-category">{item.category}</span>
                          </td>
                          <td className="text-muted">
                            ${typeof item.price === "string" ? parseFloat(item.price).toFixed(2) : Number(item.price).toFixed(2)}
                          </td>
                          <td className="text-small">
                            {(item.brought_to?.map((u) => u.username) ?? []).join(", ") || "-"}
                          </td>
                          <td className="fw-semibold">
                            ${item.calculated_data?.item_price != null ? Number(item.calculated_data.item_price).toFixed(2) : "-"}
                          </td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleEditClick(item)}
                                disabled={loading || editingItem !== null}
                              >
                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                </svg>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteItem(item.id)}
                                disabled={loading || editingItem !== null}
                              >
                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                                  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListItemsEdit;
