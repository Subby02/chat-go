import './RegisterElement.css';
import Button from './Button';
import { getIconImage } from '../util/get-img-icon';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from "axios";

const RegisterElement = () => {
  const nav = useNavigate();

  const [email, setEmail] = useState("");  // email 입력
  const [isEmailChecked, setIsEmailChecked] = useState(false); // email 중복 검사
  const [password, setPassword] = useState(""); // 비밀번호 입력
  const [passwordConfirm, setPasswordConfirm] = useState(""); // 비밀번호 확인란 입력
  const [isMatch, setIsMatch] = useState(null); // 비밀번호 일치 여부 검사
  const [name, setName] = useState(""); // 이름 입력
  const [phone, setPhone] = useState(""); // 전화번호 입력
  const [showKeyBox, setShowKeyBox] = useState(false); //인증번호 입력란 표시
  const [authCode, setAuthCode] = useState(""); //인증번호 입력 
  const [isVerified, setIsVerified] = useState(false); // 인증 성공 여부 검사

  // 이메일 중복 검사
  const handleCheckEmail = async () => {
    if (!email) 
      return alert("이메일을 입력해주세요.");
    try {
      const res = await axios.get("http://localhost:5000/api/check-email", { params: {email}, withCredentials: true });
      if (res.data.exists) {
        alert("이미 사용 중인 이메일입니다.");
        setIsEmailChecked(false);
      } else {
        alert("사용 가능한 이메일입니다.");
        setIsEmailChecked(true);
      }
    } catch (err) {
      alert("중복 확인 오류:", err);
    }
  };

  // 비밀번호 일치 여부 검사
  const handlePasswordConfirmChange = (e) => {
    const value = e.target.value;
    setPasswordConfirm(value);
    setIsMatch(password === value);
  };

  // 인증번호 발송
  const handleRequestAuth = async() => {
    if(!phone)
      return alert("전화번호를 입력해주세요.");

    try {
      const res = await axios.post("http://localhost:5000/api/send-code", null,
        { 
          params: {phone_number: phone},
        }
      );

      if(res.status === 200)
      {
        alert("인증번호 발송완료");
        setShowKeyBox(true);
      }

    } catch(err) {
      console.log("인증번호 발송 실패:", err);
      alert(err?.response?.data?.message || "인증번호 발송 중 오류가 발생했습니다." );
    }
  };

  //인증번호 확인 여부 검사
  const handleVerifyAuth = async() => {
    if(!authCode)
      return alert("인증번호를 입력해주세요.");

    try{
      const res = await axios.post("http://localhost:5000/api/verify-code",
        {
          to: phone,
          code: authCode,
        },
        { withCredentials: true }
      );

      if(res.data.verified) {
        alert("인증 성공!");
        setIsVerified(true);
      }
      else{
        alert(res.data.message || "인증 실패");
      }

    } catch(err) {
      console.log("인증번호 확인 오류", err);
      alert("인증번호 확인 중 오류가 발생했습니다.");
    }
  };

  // 회원가입 버튼 클릭
  const handleRegister = async() => {
    if(!isEmailChecked)
      return alert("이메일 중복 확인을 해주세요.");
    if(!email || !password || !name || !phone)
      return alert("모든 항목을 입력해주세요.");
    if(password != passwordConfirm)
      return alert("비밀번호가 일치하지 않습니다.");
    if(!isVerified)
      return alert("전화번호 인증을 완료해주세요.");

    try {
      const res = await axios.post("http://localhost:5000/api/register",
        {
          email,
          password,
          name,
          phone_number: phone,
        },
        { withCredentials: true}
      );
      
      if(res.status === 200) {
        alert("회원가입 성공!");
        nav('/login');
      }
      else {
        alert(res.data.message || "회원가입 실패");
      }
        
    } catch(err) {
      alert("회원 가입 오류:",err);
      alert(err?.response?.data?.message || "회원가입 중 오류가 발생했습니다.");
    }
  };

  return(
    <div className="Register_Wrapper">
      <div className="Register_Element">
        <div className="icon" onClick={()=>nav('/')}>
          <img src={getIconImage(1)} style={{width: '120px', height: 'auto'}} className="icon"/>
          <div className='txt1'>찾Go</div>
          <div className='txt2'>회원가입</div>
        </div>

        <div className="input_box">
          <div className='email_box'>
            <input type='text' placeholder='이메일' className='email' value={email} onChange={(e)=>{setEmail(e.target.value); (setIsEmailChecked(false))}} />
            <Button text={"중복확인"} className='email_btn' onClick={handleCheckEmail} />
          </div>
          <input type='password' placeholder='비밀번호' className='password' value={password} onChange={(e)=>{setPassword(e.target.value); setIsMatch(e.target.value === passwordConfirm);}} />
          <input type='password' placeholder='비밀번호 확인' className='password2' value={passwordConfirm} onChange={handlePasswordConfirmChange}  />
          {isMatch !== null && (
            <div style={{ color: isMatch ? 'green' : 'red', fontSize: '0.9rem' }}>
              {isMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
            </div>
          )}
          <input type='text' placeholder='이름' className='name' value={name} onChange={(e)=>{setName(e.target.value)}} />
          <div className='phone_box'>
            <input type='text' placeholder='전화번호' className='phone' value={phone} onChange={(e)=>{setPhone(e.target.value), setIsVerified(false)}} />
            <Button text={"인증요청"} className='phone_btn' onClick={handleRequestAuth} />
          </div>

          {showKeyBox && (
            <div className='key_box'>
            <input type='text' placeholder='인증번호 입력' className='key' value={authCode} onChange={(e)=>{setAuthCode(e.target.value)}} />
            <Button text={"인증확인"} className='key_btn' onClick={handleVerifyAuth}/>
            </div>
          )}

          {isVerified && (
            <div style={{color: 'green', fontSize: '0.9rem' }}>
              인증이 완료되었습니다.
            </div>   
          )}
        </div>

        <div className='btn'>
          <Button text={"회원가입"} type={"BLACK"} className="register_btn" onClick={handleRegister}/>
        </div>

      </div>
    </div>
  )
}

export default RegisterElement;