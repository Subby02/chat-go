import { useNavigate } from "react-router-dom";
import "./HeaderTop.css";
import { getIconImage } from "../util/get-img-icon";
import { useEffect, useState } from "react";
import Button from "./Button";
import axios from "axios";

const HeaderTop = ({ authState, handleLogout }) => {
  const nav = useNavigate();

  const click = () => {
    nav("/");
  };

  return (
    <div className="Top">
      <div className="Left" onClick={click}>
        <img
          src={getIconImage(1)}
          style={{ width: "100px", height: "100px", marginTop: "20px" }}
        />
        <div className="Title">
          <h1 className="MainTitle">찾Go</h1>
          <h2 className="SubTitle">Find Lost Items</h2>
        </div>
      </div>

      <div className="Right">
        {authState ? (
          <>
            <Button
              text={"마이페이지"}
              onClick={() => {
                nav("/mypage");
              }}
              type={"MYPAGE"}
            />
            <Button
              text={"로그아웃"}
              onClick={handleLogout}
              type={"REGISTER"}
            />
          </>
        ) : (
          <>
            <Button
              text={"로그인"}
              onClick={() => {
                nav("/login");
              }}
              type={"LOGIN"}
            />
            <Button
              text={"회원가입"}
              onClick={() => {
                nav("/register");
              }}
              type={"REGISTER"}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default HeaderTop;
