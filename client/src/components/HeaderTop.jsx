import { useNavigate } from "react-router-dom";
import "./HeaderTop.css";
import { getIconImage } from "../util/get-img-icon";
import { useEffect, useState } from "react";
import Button from "./Button";
import axios from "axios";

const HeaderTop = ({ authState }) => {
  const nav = useNavigate();
  const [auth, setAuth] = useState(false);

  const click = () => {
    nav("/");
  };

  const fetchStatus = async () => {
    const response = await axios.get("http://localhost:5000/api/status", {
      withCredentials: true,
    });

    console.log(response);
    setAuth(response.data.authenticated);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/logout",
        {},
        { withCredentials: true }
      );
      setAuth(false);
      nav("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
            <Button text={"마이페이지"} type={"MYPAGE"} />
            <Button text={"로그아웃"} onClick={handleLogout} type={"LOGIN"} />
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
