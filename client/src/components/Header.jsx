import "./Header.css";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useCallback } from "react";
import axios from "axios";
import HeaderTop from "./HeaderTop";
import HeaderNavigation from "./HeaderNavigation";

const Header = ({ authState }) => {
  return (
    <>
      <div className="headertop">
        <HeaderTop authState={authState} />
      </div>
      <div>
        <HeaderNavigation />
      </div>
    </>
  );
};

export default Header;
