import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/api";
import axios from "axios";

interface Row {
  localId: string;
  id?: number;
  item_name: string;
  category: "groceries" | "other";
  price: string;
  brought_to_ids: number[];
}

interface ItemFormParams {
  id?: string;
  listId?: string;
  itemId?: string;
  [key: string]: string | undefined;
}

const newRow = (): Row => ({
  localId: Math.random().toString(36).slice(2, 9),
  item_name: "",
  category: "groceries",
  price: "0.00",
  brought_to_ids: [],
});

const ItemForm = () => {
  const params = useParams<ItemFormParams>();
  const listId = params.id ?? params.listId;
  const itemId = params.itemId;
  const navigate = useNavigate();

  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ id: number; username: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/users/");
        console.log("Users fetched successfully:", res.data);
        setUsers(res.data || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!itemId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/lists/items/${itemId}/`);
        const item = res.data;
        setRows([
          {
            localId: Math.random().toString(36).slice(2, 9),
            id: item.id,
            item_name: item.item_name || "",
            category: item.category || "groceries",
            price: String(item.price ?? "0.00"),
            brought_to_ids: (item.brought_to || []).map((u: any) => u.id),
          },
        ]);
      } catch (e) {
        console.error("Failed to load item", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [itemId]);

  const handleAddRow = () => setRows((r) => [...r, newRow()]);
  const handleRemoveRow = (localId: string) => setRows((r) => r.filter((x) => x.localId !== localId));

  const handleChange = (localId: string, patch: Partial<Row>) => {
    setRows((rs) => rs.map((r) => (r.localId === localId ? { ...r, ...patch } : r)));
  };

  const submitRows = async () => {
    if (!listId) {
      alert("Missing list id");
      return;
    }
    const invalidNameIndex = rows.findIndex((row) => !row.item_name.trim());
    if (invalidNameIndex !== -1) {
      alert(`Row ${invalidNameIndex + 1}: item name is required`);
      return;
    }

    setLoading(true);
    try {
      for (const row of rows) {
        const payload = {
          item_name: row.item_name.trim(),
          category: row.category,
          price: row.price,
          brought_to_ids: row.brought_to_ids && row.brought_to_ids.length > 0 ? row.brought_to_ids : [],
        };

        if (row.id) {
          await api.put(`/api/lists/items/${row.id}/`, payload);
        } else {
          await api.post(`/api/lists/${listId}/items/`, payload);
        }
      }
      navigate(`/lists/${listId}`);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.data) {
        alert(`Failed to save items: ${JSON.stringify(err.response.data)}`);
      } else {
        alert("Failed to save items");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (row: Row) => {
    if (!row.id) {
      handleRemoveRow(row.localId);
      return;
    }
    if (!confirm("Delete this item? This cannot be undone.")) return;
    setLoading(true);
    try {
      await api.delete(`/api/lists/items/${row.id}/`);
      if (itemId) {
        navigate(`/lists/${listId}`);
        return;
      }
      setRows((rs) => rs.filter((r) => r.localId !== row.localId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-container">
      <div className="page-header">
        <div>
          <Link to={`/lists/${listId}`} className="breadcrumb-link">
            <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
              <path
                fillRule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
              />
            </svg>
            Back to List
          </Link>
          <h1 className="page-title mt-2">{itemId ? "Edit Item" : "Add Items"}</h1>
          <p className="page-subtitle">
            {itemId ? "Update item details" : "Add one or more items to your list"}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {rows.map((r, idx) => (
            <div className="item-form-row" key={r.localId}>
              <div className="row g-3 align-items-end mb-3 pb-3" style={{ borderBottom: idx < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div className="col-md-4">
                  <label className="form-label">
                    <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                      <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 14.5V7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43a.522.522 0 0 0 .023.07zM9 3h2.932a.56.56 0 0 0 .023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0V3zM1 4v2h6V4H1zm8 0v2h6V4H9zm5 3H9v8h4.5a.5.5 0 0 0 .5-.5V7zm-7 8V7H2v7.5a.5.5 0 0 0 .5.5H7z" />
                    </svg>
                    Item Name
                  </label>
                  <input
                    className="form-control"
                    value={r.item_name}
                    onChange={(e) => handleChange(r.localId, { item_name: e.target.value })}
                    placeholder="e.g., Milk, Bread"
                    required
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">
                    <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                      <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z" />
                    </svg>
                    Category
                  </label>
                  <select
                    className="form-select"
                    value={r.category}
                    onChange={(e) => handleChange(r.localId, { category: e.target.value as Row["category"] })}
                  >
                    <option value="groceries">Groceries</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="form-label">
                    <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                      <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z" />
                    </svg>
                    Price
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    step="0.01"
                    value={r.price}
                    onChange={(e) => handleChange(r.localId, { price: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">
                    <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                      <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                    </svg>
                    Shared With
                  </label>
                  {users.length > 0 ? (
                    <div className="user-selection-box">
                      {users.map((u) => (
                        <label key={u.id} className="user-checkbox-item">
                          <input
                            type="checkbox"
                            checked={r.brought_to_ids.includes(u.id)}
                            onChange={(e) => {
                              const newIds = e.target.checked
                                ? [...r.brought_to_ids, u.id]
                                : r.brought_to_ids.filter((id) => id !== u.id);
                              handleChange(r.localId, { brought_to_ids: newIds });
                            }}
                          />
                          <span className="user-name">{u.username}</span>
                          <span className="checkmark">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                            </svg>
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="user-selection-empty">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>
                      </svg>
                      <p>Loading users...</p>
                    </div>
                  )}
                  <small className="text-muted d-block mt-1">Select one or more users to share with</small>
                </div>

                <div className="col-md-1 text-end">
                  <button className="btn btn-danger btn-sm" type="button" onClick={() => handleDeleteItem(r)} disabled={loading}>
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                      <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                    </svg>
                  </button>
                </div>
              </div>

              {idx === rows.length - 1 && !itemId && (
                <button className="btn btn-success btn-sm mb-3" type="button" onClick={handleAddRow}>
                  <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                  </svg>
                  Add Another Item
                </button>
              )}
            </div>
          ))}

          <div className="d-flex gap-2 mt-4 pt-3" style={{ borderTop: "2px solid var(--border)" }}>
            <button className="btn btn-primary" onClick={submitRows} disabled={loading}>
              <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
              </svg>
              {itemId ? "Update Item" : `Save ${rows.length} Item${rows.length > 1 ? "s" : ""}`}
            </button>
            <button className="btn btn-outline-secondary" onClick={() => navigate(`/lists/${listId}`)} disabled={loading}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemForm;
