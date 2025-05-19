import { Link } from "react-router-dom";
const HeaderNavigation = () => {
  return (
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
  );
};

export default HeaderNavigation;
