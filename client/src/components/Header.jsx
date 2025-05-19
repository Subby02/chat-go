import "./Header.css";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useCallback } from "react";
import axios from "axios";
import HeaderTop from "./HeaderTop";
import HeaderNavigation from "./HeaderNavigation";

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
  const nav = useNavigate();
  return (
    <div>
      <HeaderTop
        icon={icon}
        mainTitle={mainTitle}
        subTitle={subTitle}
        mypage={mypage}
        login={login}
        register={register}
        logout={logout}
      />

      <HeaderNavigation />
    </div>
  );
};

export default Header;