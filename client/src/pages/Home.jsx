import Body from "../components/Body";
import { getIconImage } from "../util/get-img-icon";
import Header from "../components/Header";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
const Home = ({ LatesPost }) => {
  const nav = useNavigate();

  return (
    <div>
      <Header
        icon={
          <img
            src={getIconImage(1)}
            style={{ width: "100%", height: "auto" }}
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
      />
      <Body />
    </div>
  );
};

export default Home;
