import "./LoginElement.css";
import Button from "./Button";
import { getIconImage } from '../util/get-img-icon';
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const LoginElement = () => {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/login",
        { email, password },
        { withCredentials: true } // ✅ 세션 기반일 때 필수
      );

      window.location.href = '/';
      } catch (err) {
          if (err.response && err.response.data) {
              alert(err.response.data.message || '로그인 실패');
          } else {
              alert('서버 에러');
          }
        }
  };

  return(
    <div className="Login_Wrapper">
      <div className="LoginElement">
        <div className="login_icon" onClick={()=>nav('/')} >
          <img src={getIconImage(1)} style={{width: '140px', height: 'auto'}} className="icon"/>
          <div className="txt">찾Go</div>
        </div>

        <div className="login_bar">
          <div className="left">
            <input type="text" placeholder="email" className="id_input" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input type="password" placeholder="password" className="pwd_input" value={password} onChange={(e)=>setPassword(e.target.value)} />
          </div>
          <div className="right">
            <Button text={"로그인"} type={"BLACK"} className="login_btn" onClick={handleLogin} />
          </div>
        </div>
      
        <div className="search_btn">
          <Button text={"비밀번호를 잊으셨나요?"} className="pwd_btn"/>
          <Button text={"회원가입"} className="rgt_btn" type={"BLACK"} onClick={()=>nav('/register')}/>
        </div>
      </div>
    </div>
    
  );
};

export default LoginElement;