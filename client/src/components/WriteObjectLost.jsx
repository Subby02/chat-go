import "./WriteObjectLost.css";
import { getIconImage } from "../util/get-img-icon";
import Button from "./Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const WriteObjectLost = () => {
  const nav = useNavigate();

  const [form, setForm] = useState({
    lstSbjt: "", // 게시글 제목
    lstPrdtNm: "", // *물품명
    prdtClNm: "", // 물품 분류명
    lstYmd: "", // *분실 일자 
    lstHor: "", // 분실 시간
    lstPlace: "", // *분실 장소
    lstSteNm: "찾고에서 접수",
    lstLctNm: "", // 상세 지역명
    uniq: "", // 특이사항
    orgNm: "",
    tel: "", // 전화번호
    lstFilePathImg: "", // 이미지 url
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    // 필수 항목 체크
    if (!form.lstPrdtNm.trim()) {
      alert("물품명(필수)을 입력하세요.");
      return;
    }
    if (!form.lstYmd.trim()) {
      alert("분실일자(필수)를 입력하세요.");
      return;
    }
    if (!form.lstPlace.trim()) {
      alert("분실장소(필수)를 입력하세요.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/object/lost/write",
        form,
        {
          withCredentials: true,
        }
      );

      if (res.status === 201) {
        alert("글 등록 완료!");
        nav("/object/lost");
      }
    } catch (err) {
      console.log("글 작성 중 오류: ", err);
      alert("글 작성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="WriteObjectLost">
      <div className="icon_section" onClick={()=>nav('/object/lost')}>
        <img
          src={getIconImage(1)}
          style={{ width: "70px", height: "auto" }}
          className="icon"
        />
        <div className="txt">분실물 신고 글 작성</div>
      </div>

      <div className="input">
        <div className="title">
          <label>
            게시글 제목:{" "}
            <input
              type="text"
              className="post_title"
              name="lstSbjt"
              value={form.lstSbjt}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="object_section">
          <label>
            물품명(필수):{" "}
            <input
              type="text"
              className="object_name"
              name="lstPrdtNm"
              value={form.lstPrdtNm}
              onChange={handleChange}
            />
          </label>
          <label>
            물품 분류명:{" "}
            <input
              type="text"
              className="object_group"
              name="prdtClNm"
              value={form.prdtClNm}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="time_section">
          <label>
            분실일자(필수):{" "}
            <input
              type="date"
              className="lost_date"
              name="lstYmd"
              value={form.lstYmd}
              onChange={handleChange}
            />
          </label>
          <label>
            분실시간:{" "}
            <input
              type="time"
              className="lost_time"
              name="lstHor"
              value={form.lstHor}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="pls_section">
          <label>
            상세 지역명:{" "}
            <input
              type="text"
              className="place_nate"
              name="lstLctNm"
              value={form.lstLctNm}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="place_section">
          <label>
            분실장소(필수):{" "}
            <input
              type="text"
              className="lost_place"
              name="lstPlace"
              value={form.lstPlace}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="etc_section">
          <label>
            특이사항:{" "}
            <textarea
              className="etc_input"
              name="uniq"
              rows={4}
              value={form.uniq}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="org_section">
          <label>
            전화번호:{" "}
            <input
              type="text"
              className="phone"
              name="tel"
              value={form.tel}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="img_URL">
          <label>
            이미지 URL:{" "}
            <input
              type="text"
              className="img"
              name="lstFilePathImg"
              value={form.lstFilePathImg}
              onChange={handleChange}
            />
          </label>
        </div>

        <Button
          type={"BLACK"}
          text={"작성하기"}
          className="submit"
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
};

export default WriteObjectLost;
