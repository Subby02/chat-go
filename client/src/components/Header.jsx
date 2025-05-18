import "./Header.css";
import { useNavigate, Link } from "react-router-dom";

const Header = ({ icon, mainTitle, subTitle, mypage, login, register }) => {
  const nav = useNavigate();
  return (
    <header className="Header">
      <div className="Top">
        <div className="Left">
          <Link to="/">
            <div className="Main_Icon">{icon}</div>
          </Link>
          <div className="Titles">
            <button
              className="Main_Header"
              style={{
                background: "white",
                border: "None",
                cursor: "pointer  ",
              }}
              onClick={() => {
                nav("/");
              }}
            >
              {mainTitle}
            </button>
            <div className="Sub_Header">{subTitle}</div>
          </div>
        </div>

        <div className="Right">
          <div className="Button_MyPage">{mypage}</div>
          <div className="Button_Login">{login}</div>
          <div className="Button_Register">{register}</div>
        </div>
      </div>

      <div className="Navigate">
        <div className="Dropdown">
          <button>분실물 게시판</button>
          <div className="DropDownMenu">
            <Link to="/object/lost">신고 게시판</Link>
            <Link to="/animal">제보 게시판</Link>
          </div>
        </div>

        <div className="Dropdown">
          <button>유기동물 게시판</button>
          <div className="DropDownMenu">
            <Link to="/object">신고 게시판</Link>
            <Link to="/animal">제보 게시판</Link>
          </div>
        </div>

        <div className="Dropdown">
          <button>사례금 계시판</button>
          <div className="DropDownMenu">
            <Link to="/object">신고 게시판</Link>
          </div>
        </div>

        <div className="Dropdown">
          <button>고객센터</button>
          <div className="DropDownMenu">
            <Link to="/object">1:1문의</Link>
            <Link to="/animal">FAQ</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
