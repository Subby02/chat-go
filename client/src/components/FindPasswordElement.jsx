import "./FindPasswordElement.css";
import Button from './Button';
import { getIconImage } from '../util/get-img-icon';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from "axios";

const FindPasswordElement = () => {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [isEmailChecked, setIsEmailChecked] = useState(false);

  const [phone, setPhone] = useState("");
  const [key, setKey] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isMatch, setIsMatch] = useState(false);

  const [showPhone, setShowPhone] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 이메일 유효성 검사 (존재 여부 확인)
  const handleCheckEmail = async() => {
    if(!email) 
      return alert("이메일을 입력해주세요. ");

    try {
      const res = await axios.get("http://localhost:5000/api/check-email", 
        {
          params: {email},
          withCredentials: true,
        }
      );

      if(res.data.exists) {
        alert("이메일 확인");
        setIsEmailChecked(true);
        setShowPhone(true);
      }
      else {
        alert("해당 이메일로 등록된 사용자가 없습니다.");
        setIsEmailChecked(false);
      }

    } catch(err) {
      console.log("이메일 확인 err:", err);
      alert("이메일 확인 중 오류 발생");
    }
  }

  // 전화번호 입력 및 인증번호 발송
  const handleRequestAuth = async() => {
    if(!phone)
      return alert("전화번호를 입력해주세요");

    try {
      const res = await axios.post("http://localhost:5000/api/send-code", null,
        { 
          params: {phone_number: phone},
        }
      );

      if(res.status === 200)
      {
        alert("인증번호 발송완료");
        setShowKey(true);
      }

    } catch(err) {
      console("인증번호 발송 err:", err);
      alert("인증번호 발생 중 오류 발생");
    }
  }

  // 인증번호 확인
  const handleVerifyAuth = async() => {
    if(!key)
      return alert("인증번호를 입력해주세요. ");

    try {
      const res = await axios.post("http://localhost:5000/api/verify-code",
        {
          to: phone,
          code: key,
        },
        {
          withCredentials: true
        }
      );

      if(res.data.verified) {
        alert("인증 성공!");
        setIsVerified(true);
        setShowPassword(true);
      }
      else{
        alert(res.data.message || "인증 실패");
      }


    } catch(err) {
      console("인증번호 확인 err:", err);
      alert("인증번호 확인 중 오류 발생");
    }
  }

  // 비밀번호 일치 여부 검사
  const handlePasswordConfirmChange = (e) => {
    const value = e.target.value;
    setPasswordConfirm(value);
    setIsMatch(password === value);
  }

  // 비밀번호 변경 버튼 클릭
  const handleResetPassword = async() => {
    if(!email || !password || !phone)
      return alert("모든 항목을 입력해주세요.");
    if(password != passwordConfirm)
      return alert("비밀번호가 일치하지 않습니다.");
    if(!isVerified)
      return alert("전화번호 인증을 완료해주세요.");

    try {
      const res = await axios.post("http://localhost:5000/api/reset-password",
        {
          password,
        },
        {withCredentials: true}
      );

      if(res.status === 200) {
        alert("비밀번호 변경 성공!");
        nav('/login');
      }
      else {
        alert(res.data.message || "비밀번호 변경 실패");
      }

    } catch(err) {
      console.log("비밀번호 변경 err:", err);
      alert("비밀번호 변경 중 오류 발생");
    }
  }

  return(
    <div className="FindPasswordElement">
      <div className="icon" onClick={()=>nav('/')}>
        <img src={getIconImage(1)} style={{width: '120px', height: 'auto'}} className="icon"/>
        <div className="txt1">찾Go</div>
        <div className="txt2">비밀번호 재설정</div>
      </div>

      <div className="small_header">비밀번호를 찾고자하는 이메일을 입력해주세요.</div>

      <div className="email_section">
        <input type="text" placeholder="이메일" className={`email ${isEmailChecked ? 'readonly' : ''}`}
        value={email} onChange={(e)=>setEmail(e.target.value)} readOnly={isEmailChecked} />
        <Button text={"다음"} className="email_btn" onClick={handleCheckEmail} />
      </div>

      {showPhone && (
        <div className="phone_section">
        <input type="text" placeholder="전화번호" className="phone" 
        value={phone} onChange={(e)=>{setPhone(e.target.value); setIsVerified(false);}} />
        <Button text={"인증요청"} className="phone_btn" onClick={handleRequestAuth} />
        </div>
      )}

      {showKey && (
        <div className="key_section">
        <input type="text" placeholder="인증번호" className="key" value={key} onChange={(e) => {setKey(e.target.value)}} />
        <Button text={"인증확인"} className="key_btn" onClick={handleVerifyAuth} />
        </div>
      )}

      {showPassword && (
        <div className="password_section">
        <input type="password" placeholder="비밀번호" className="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <input type="password" placeholder="비밀번호 확인" className="password2" value={passwordConfirm} onChange={handlePasswordConfirmChange} />
        {isMatch !== null && (
            <div style={{ color: isMatch ? 'green' : 'red', fontSize: '0.9rem' }}>
              {isMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
            </div>
        )}
        <Button className="end_btn" type={"BLACK"} text={"비밀번호 변경"} onClick={handleResetPassword} />
        </div>
      )}

    </div>
    
  );
};

export default FindPasswordElement;