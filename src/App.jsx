import { Outlet } from "react-router-dom";
import CartDrawer from "./components/CartDrawer/CartDrawer";
import CartAddedPopover from "./components/CartAddedPopover/CartAddedPopover";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <div className="mobile-screen-wrapper">
        <Outlet />
      </div>
      <CartAddedPopover />
      <CartDrawer />
    </div>
  );
}

export default App;