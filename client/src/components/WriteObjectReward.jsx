import "./WriteObjectReward.css";
import { getIconImage } from "../util/get-img-icon";
import regionData from "../full_region_dict"; // 상대경로에 맞게 수정
import Button from "./Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const WriteObjectReward = () => {
  const nav = useNavigate();

  const [form, setForm] = useState({
    lstPrdtNm: "", // 물품명(필수)
    prdtClNm: "", // 분류명(필수)
    lstYmd: "", // 분실 일자(필수)
    lstHor: "", //분실 시간
    si: "", // 시/도(필수)
    sgg: "", // 시/군/구(필수)
    emd: "", // 읍/면/동(필수)
    lstLctNm: "", // 상세 지역명
    lstPlace: "", // 분실 장소(필수)
    reward: "", // 보상금(필수)
    uniq: "", // 특징
    lstFilePathImg: "", // 이미지 파일
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "reward") {
    // 숫자만 추출
    const onlyNums = value.replace(/[^0-9]/g, "");

    setForm({ ...form, [name]: onlyNums });
  } else {
    setForm({ ...form, [name]: value });
  }

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

    if (!form.si.trim() || !form.sgg.trim() || !form.emd.trim()) {
      alert("시/도, 시/군/구, 읍/면/동(필수)을 입력하세요.");
      return;
    }

    if (!form.lstPlace.trim()) {
      alert("분실 장소(필수)를 입력하세요.");
      return;
    }

    if (!form.reward.trim()) {
      alert("보상금(필수)을 입력하세요.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/reward/object/write",
        form,
        {
          withCredentials: true,
        }
      );

      if (res.status === 201) {
        alert("글 등록 완료!");
        nav("/reward/object");
      }
    } catch (err) {
      console.log("글 작성 중 오류: ", err);
      alert("글 작성 중 오류가 발생했습니다.");
    }
  };

  return(
    <div className="WriteObjectReward">
      <div className="icon_section" onClick={()=>nav('/reward/object')}>
        <img
          src={getIconImage(2)}
          style={{ width: "70px", height: "auto" }}
          className="icon"
        />
        <div className="txt">분실물 사례금 글 작성</div>
      </div>

      <div className="input">
        <div className="object_section">
          <label>
            물품명(필수):{" "}
            <input type="text" className="object_name" name="lstPrdtNm" value={form.lstPrdtNm} onChange={handleChange} />
          </label>

          <label>
            분류명:{" "}
            <input type="text" className="object_type" name="prdtClNm" value={form.prdtClNm} onChange={handleChange} />
          </label>
        </div>

        <div className="time_section">
          <label>
            분실일자(필수):{" "}
            <input type="date" className="lost_date" name="lstYmd" value={form.lstYmd} onChange={handleChange} />
          </label>

          <label>
            분실시간:{" "}
            <input type="time" className="lost_time" name="lstHor" value={form.lstHor} onChange={handleChange} />
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
            상세 지역명:{" "}
            <input type="text" className="place_name" name="lstLctNm" value={form.lstLctNm} onChange={handleChange} />
          </label>

          <label>
            분실장소(필수):{" "}
            <input type="text" className="lost_place" name="lstPlace" value={form.lstPlace} onChange={handleChange} />
          </label>
        </div>

        <div className="reward_section">
          <label>
            보상금 액수(필수):{" "}
            <input type="text" name="reward" value={form.reward} onChange={handleChange} />{" "}
            {form.reward ? `${form.reward}만원` : ""}
          </label>
        </div>

        <div className="etc_section">
          <label>
            특징:{" "}
            <textarea className="etc_input" name="uniq" value={form.uniq} onChange={handleChange} />
          </label>
        </div>

        <div className="img_section">
          <label>
            이미지 업로드:{" "}
            <input type="text" name="lstFilePathImg" value={form.lstFilePathImg} onChange={handleChange} />
          </label>
        </div>

        <Button type={"BLACK"} text={"작성하기"} className="submit" onClick={handleSubmit} />
      </div>
    </div>
  );
};

export default WriteObjectReward;