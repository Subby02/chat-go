import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Object from './pages/Object';
import Animal from './pages/Animal';
import Reward from './pages/Reward';
import Notfound from './pages/Notfound';
import Login from './pages/Login';
import Register from './pages/Register';
import FindPassWord from './pages/FindPassword';
import NewObjectLost from './pages/NewObjectLost';
import NewObjectGet from './pages/NewObjectGet';

import Inquiry from './pages/Inquiry';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/object" element={<Object />} />
        <Route path='/object/lost/write' element={<NewObjectLost />} />
        <Route path='/object/get/write' element={<NewObjectGet />} />
        <Route path="/animal" element={<Animal />} />
        <Route path="/reward/:id" element={<Reward />} />
        <Route path="*" element={<Notfound />} />
        <Route path="/login" element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/find-pwd' element={<FindPassWord />} />

        <Route path='/inquiry' element={<Inquiry />} />
      </Routes>
    </>
    
  );
}

export default App
