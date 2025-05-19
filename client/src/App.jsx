import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Object from "./pages/Object";
import Animal from "./pages/Animal";
import Reward from "./pages/Reward";
import Notfound from "./pages/Notfound";
import LostPage from "./pages/LostPage";
import Searchbar from "./components/Searchbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ObjLostDetail from "./pages/ObjLostDetail";
function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/object" element={<Object />} />
        <Route path="/animal" element={<Animal />} />
        <Route path="/reward/:id" element={<Reward />} />
        <Route path="/object/lost" element={<LostPage />} />
        <Route path="/object/lost/:postId" element={<ObjLostDetail />} />
        <Route path="*" element={<Notfound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
