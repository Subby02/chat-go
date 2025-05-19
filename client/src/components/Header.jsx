import "./Header.css";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useCallback } from "react";
import axios from "axios";

const Header = ({
  icon,
  mainTitle,
  subTitle,
  mypage,
  login,
  register,
  logout,
  authState,
}) => {
  return (
    <header className="Header">
      <div className="Top">
        <div className="Left">
          <Link to="/" className="Main_Icon_Link">
            {typeof icon === "string" ? (
              <img src={icon} alt="Main Icon" className="Main_Icon_Image" />
            ) : (
              <div className="Main_Icon_Component">{icon}</div>
            )}
          </Link>
          <div className="Titles">
            <Link to="/" className="Main_Header_Link">
              {mainTitle}
            </Link>
            {subTitle && <div className="Sub_Header">{subTitle}</div>}
          </div>
        </div>

        <div className="Right">
          {mypage && <div className="Button_MyPage_Wrapper">{mypage}</div>}
          {login && <div className="Button_Login_Wrapper">{login}</div>}
          {register && (
            <div className="Button_Register_Wrapper">{register}</div>
          )}
        </div>
      </div>

      <nav className="Navigate">
        <div className="Dropdown">
          <button type="button" className="Dropdown_Button">
            분실물 게시판
          </button>
          <div className="DropDownMenu">
            <Link to="/object/lost">신고 게시판</Link>
            <Link to="/animal">제보 게시판</Link>{" "}
          </div>
        </div>

        <div className="Dropdown">
          <button type="button" className="Dropdown_Button">
            유기동물 게시판
          </button>
          <div className="DropDownMenu">
            <Link to="/animal/lost">신고 게시판</Link>
            <Link to="/animal/found">제보 게시판</Link>
          </div>
        </div>

        <div className="Dropdown">
          <button type="button" className="Dropdown_Button">
            사례금 게시판
          </button>
          <div className="DropDownMenu">
            <Link to="/reward">사례금 게시판</Link>
          </div>
        </div>

        <div className="Dropdown">
          <button type="button" className="Dropdown_Button">
            고객센터
          </button>
          <div className="DropDownMenu">
            <Link to="/support/qna">1:1문의</Link>
            <Link to="/support/faq">FAQ</Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
