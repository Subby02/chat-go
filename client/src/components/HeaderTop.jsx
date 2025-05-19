import { useNavigate } from "react-router-dom";
import "./HeaderTop.css";
const HeaderTop = ({
  icon,
  mainTitle,
  subTitle,
  isLoggedIn,
  handleLogout,
  login,
  register,
  logout,
  mypage,
}) => {
  const nav = useNavigate();

  const click = () => {
    nav("/");
  };
  return (
    <div className="Top">
      <div className="Left" onClick={click}>
        <div className="icon">{icon}</div>
        <div className="Title">
            <div className="Main">{mainTitle}</div>
            <div className="Sub">{subTitle}</div>
        </div>
      </div>
      <div className="Right">
        <div className="myPage">{mypage}</div>
        <div className="Login">{login}</div>
        <div className="Register">{register}</div>
      </div>
    </div>
  );
};

export default HeaderTop;