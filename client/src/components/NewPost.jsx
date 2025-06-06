import "./NewPost.css";
import { useNavigate } from "react-router-dom";
import reward from "../assets/reawrd.svg";
import animal_find from "../assets/animal_find.svg";
import animal_lost from "../assets/animal_lost.svg";
import deal from "../assets/deal.svg";
import lost from "../assets/lost.svg";
const NewPost = ({ auth }) => {
  const nav = useNavigate();

  return (
    <div className="writeBtnContainer">
      <div className="reportBtnContainer">
        <button
          className="objBtn"
          onClick={() => {
            if (auth) nav("/object/lost/write");
            else nav("/login");
          }}
        >
          <img
            src={lost}
            style={{ width: "60px", height: "60px", marginBottom: "20px" }}
          />
          <span>분실물 신고</span>
        </button>

        <button
          className="objBtn"
          onClick={() => {
            if (auth) nav("/object/get/write");
            else nav("/login");
          }}
        >
          <img
            src={deal}
            style={{ width: "60px", height: "60px", marginBottom: "20px" }}
          />
          <span>분실물 제보</span>
        </button>

        <button
          className="animalBtn"
          onClick={() => {
            if (auth) nav("/animal/lost/write");
            else nav("/login");
          }}
        >
          <img
            src={animal_lost}
            style={{ width: "60px", height: "60px", marginBottom: "20px" }}
          />
          <span>유기동물 신고</span>
        </button>

        <button
          className="animalBtn"
          onClick={() => {
            if (auth) nav("/animal/get/write");
            else nav("/login");
          }}
        >
          <img
            src={animal_find}
            style={{ width: "60px", height: "60px", marginBottom: "20px" }}
          />
          <span>유기동물 제보</span>
        </button>

        <button
          className="rewardBtn"
          onClick={() => {
            if (auth) nav("/reward/object/write");
            else nav("/login");
          }}
        >
          <img
            src={reward}
            style={{ width: "60px", height: "60px", marginBottom: "20px" }}
          />
          <span>사례금 물건</span>
        </button>

        <button
          className="rewardBtn"
          onClick={() => {
            if (auth) nav("/reward/animal/write");
            else nav("/login");
          }}
        >
          <img
            src={reward}
            style={{ width: "60px", height: "60px", marginBottom: "20px" }}
          />
          <span>사례금 동물</span>
        </button>
      </div>
    </div>
  );
};

export default NewPost;
