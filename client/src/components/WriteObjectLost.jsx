import "./WriteObjectLost.css";
import { getIconImage } from "../util/get-img-icon";
import regionData from "../full_region_dict"; // 상대경로에 맞게 수정
import Button from "./Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const WriteObjectLost = () => {
  const nav = useNavigate();
  
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    lstPrdtNm: "", // 물품명(필수)
    prdtClNm: "", // 분류명
    lstYmd: "", // 분실일자(필수)
    lstHor: "", // 분실시간
    si: "", // 시/도(필수)
    sgg: "", // 시/군/구(필수)
    emd: "", // 읍/면/동(필수)
    lstLctNm: "", // 상세지역명
    uniq: "", // 특징
    lstFilePathImg: "", // 이미지 업로드
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "si") {
      setForm((prev) => ({ ...prev, si: value, sgg: "", emd: "" }));
    } else if (name === "sgg") {
      setForm((prev) => ({ ...prev, sgg: value, emd: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
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
    if(!form.si.trim() || !form.sgg.trim() || !form.emd.trim()){
      alert("시/도, 시/군/구, 읍/면/동 (필수)을 입력하세요.")
    }
    if (!form.lstPlace.trim()) {
      alert("분실장소(필수)를 입력하세요.");
      return;
    }

    try {
      const formData = new FormData();

      for (const key in form) {
        formData.append(key, form[key]);
      }

      if(imageFile) {
        formData.append("lstFilePathImg", imageFile);
      }

      const res = await axios.post(
        "http://localhost:5000/api/object/lost/write",
        formData,
        {
          withCredentials: true,
          headers: {
          "Content-Type": "multipart/form-data",
          },
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
        <div className="object_section">
          <label>
            분실 물품명(필수):{" "}
            <input
              type="text"
              className="object_name"
              name="lstPrdtNm"
              value={form.lstPrdtNm}
              onChange={handleChange}
            />
          </label>
          <label>
            분실 물품 분류명:{" "}
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

        <div className="place_section">
          <div className="si_section">
            <label>
              시/도(필수)
              <select name="si" value={form.si} onChange={handleChange}>
                <option value="">선택</option>
                {Object.keys(regionData).map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </label>

            <label>
              시/군/구(필수)
              <select name="sgg" value={form.sgg} onChange={handleChange} disabled={!form.si} >
                <option value="">선택</option>
                {form.si && Object.keys(regionData[form.si]).map((city) => (
                <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </label>

            <label>
              읍/면/동(필수)
              <select name="emd" value={form.emd} onChange={handleChange} disabled={!form.si || !form.sgg}>
                <option value="">선택</option>
                {form.si && form.sgg && regionData[form.si][form.sgg].map((town) => (
                <option key={town} value={town}>{town}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            상세 지역:{" "}
            <input type="text" className="place_detail" name="lstLctNm" value={form.lstLctNm} onChange={handleChange} />
          </label>

          <label>
            분실장소(필수):{" "}
            <input type="text" className="lost_place" name="lstPlace" value={form.lstPlace} onChange={handleChange} />
          </label>
        </div>

        <div className="etc_section">
          <label>
            특징:{" "}
            <textarea
              className="etc_input"
              name="uniq"
              rows={4}
              value={form.uniq}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="img_section">
          <label>
            분실물 이미지 업로드:{" "}
            <input
              type="file"
              accept="image/*"
              name="lstFilePathImg"
              onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const ext = file.name.substring(file.name.lastIndexOf('.'));
                const safeName = `${Date.now()}${ext}`;

                const newFile = new File([file], safeName, { type: file.type });

                setImageFile(newFile);
              }}} 
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
