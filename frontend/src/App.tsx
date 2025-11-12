import { BrowserRouter, Route, Routes } from "react-router-dom";
import Public from "./pages/Public";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Protected from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Layout_User from "./components/UserLayout";
import ListDetail from "./components/List";
import ListForm from "./pages/ListForm";
import ItemForm from "./pages/ItemForm";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout_User />}>
          <Route
            path="/home"
            element={
              <Protected>
                <Home />
              </Protected>
            }
          />
          <Route
            path="/lists/new"
            element={
              <Protected>
                <ListForm />
              </Protected>
            }
          />
          <Route
            path="/lists/:id/edit"
            element={
              <Protected>
                <ListForm />
              </Protected>
            }
          />
          <Route
            path="/lists/:id"
            element={
              <Protected>
                <ListDetail />
              </Protected>
            }
          />
          <Route
            path="/lists/:id/items/new"
            element={
              <Protected>
                <ItemForm />
              </Protected>
            }
          />
          <Route
            path="/lists/:listId/items/:itemId/edit"
            element={
              <Protected>
                <ItemForm />
              </Protected>
            }
          />
        </Route>

        <Route path="/" element={<Public />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/public" element={<Public />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
