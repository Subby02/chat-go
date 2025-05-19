import Body from "../components/Body";
import { getIconImage } from "../util/get-img-icon";
import Header from "../components/Header";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
const Home = ({ LatesPost }) => {
  const [auth, setAuth] = useState(false);

  const nav = useNavigate();
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

  const handleLogout = () => {
    axios.post("http://localhost:5000/api/logout");
    setAuth(false);
  };

  return (
    <div>
      <Header
        icon={
          <img
            src={getIconImage(1)}
            style={{ width: "100px", height: "100px" }}
          />
        }
        mainTitle={"찾Go"}
        subTitle={"Find Lost Items"}
        mypage={<Button text={"마이페이지"} type={"MYPAGE"} />}
        login={
          <Button
            text={"로그인"}
            onClick={() => {
              nav("/login");
            }}
            type={"LOGIN"}
          />
        }
        register={
          <Button
            text={"회원가입"}
            type={"REGISTER"}
            onClick={() => {
              nav("/register");
            }}
          />
        }
        logout={
          <Button text={"로그아웃"} type={"LOGIN"} onClick={handleLogout} />
        }
        authState={auth}
      />
      <Body />
    </div>
  );
};

export default Home;
