import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Object from './pages/Object';
import Animal from './pages/Animal';
import Reward from './pages/Reward';
import Notfound from './pages/Notfound';
import { getIconImage } from './util/get-img-icon';
import Button from './components/Button';
import Header from './components/Header';

function App() {
  return (
    <>
      <Header 
        icon={<img src={getIconImage(1)} style={{width: '150px', height: 'auto'}} />}
        mainTitle={"찾Go"} 
        subTitle={"Find Lost Items"}
        mypage={<Button text={"마이페이지"}/>}
        login={<Button text={"로그인"} />}
        register={<Button text={"회원가입"} type={"BLACK"} />}
      />

      <Button text={"123"} type={"DEFAULT"}/>
      <Button text={"123"} type={"BLACK"}/>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/object" element={<Object />} />
        <Route path="/animal" element={<Animal />} />
        <Route path="/reward/:id" element={<Reward />} />
        <Route path="*" element={<Notfound />} />
      </Routes>
    </>
    
  );
}

export default App
