import { Outlet } from "react-router-dom";
import NavBar from "./Navbar";


//layout of the the whole website
const Layout = () => {
  return (
    <div>
      <NavBar />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;