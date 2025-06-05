import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Object from "./pages/Object";
import AnimalLost from "./pages/AnimalLost";
import Notfound from "./pages/Notfound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FindPassWord from "./pages/FindPassword";
import NewObjectLost from "./pages/NewObjectLost";
import NewObjectGet from "./pages/NewObjectGet";
import Inquiry from "./pages/Inquiry";
import LostPage from "./pages/LostPage";
import ObjLostDetail from "./pages/ObjLostDetail";
import ReportBoard from "./pages/ReportBoard";
import AnimalGet from "./pages/AnimalGet";
import RewardAnimal from "./pages/RewardAnimal";
import RewardObject from "./pages/RewardObject";
import ObjGetDetail from "./pages/ObjGetDetail";
import AnimalGetDetail from "./pages/AnimalGetDetail";
import AnimalLostDetail from "./pages/AnimalLostDetail";
import RewardAnimalDetail from "./pages/RewardAnimalDetail";
import RewardObjectDetail from "./pages/RewardObjectDetail";
function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/object" element={<Object />} />
        <Route path="/object/lost/write" element={<NewObjectLost />} />
        <Route path="/object/get/write" element={<NewObjectGet />} />
        <Route path="/animal/lost" element={<AnimalLost />} />
        <Route path="/animal/lost/:postId" element={<AnimalLostDetail />} />
        <Route path="/animal/get" element={<AnimalGet />} />
        <Route path="/animal/get/:postId" element={<AnimalGetDetail />} />
        <Route path="/reward/animal" element={<RewardAnimal />} />
        <Route path="/reward/animal/:postId" element={<RewardAnimalDetail />} />
        <Route path="/reward/object" element={<RewardObject />} />
        <Route path="/reward/object/:postId" element={<RewardObjectDetail />} />
        <Route path="/object/lost" element={<LostPage />} />
        <Route path="/object/lost/:postId" element={<ObjLostDetail />} />
        <Route path="/object/get" element={<ReportBoard />} />
        <Route path="/object/get/:postId" element={<ObjGetDetail />} />
        <Route path="*" element={<Notfound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/find-pwd" element={<FindPassWord />} />
        <Route path="/inquiry" element={<Inquiry />} />
      </Routes>
    </div>
  );
}

export default App;
