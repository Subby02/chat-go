import "./WriteAnimalReward.css";
import { getIconImage } from "../util/get-img-icon";
import regionData from "../full_region_dict"; // 상대경로에 맞게 수정
import Button from "./Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const WriteAnimalReward = () => {
  const nav = useNavigate();

  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    kindCd: "", // 품종(필수)
    rfidCd: "", // RFIC 코드
    sexCd: "", // 성별(필수)
    age: "", // 나이(필수)
    happenDt: "", // 실종 발생일자(happenDt)
    si: "", // 시/도(필수)
    sgg: "", // 시/군/구(필수)
    emd: "", // 읍/면/동(필수)
    happenAddr: "", // 실종 발생주소(필수)
    happenPlace: "", //실종 발생장소(필수)
    reward: "", // 보상금(필수)
    specialMark: "", // 특징(필수)
    popfile: "", // 이미지
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "reward") {
    const onlyNums = value.replace(/[^0-9]/g, "");
    setForm({ ...form, [name]: onlyNums });
    } else if (name === "si") {
      setForm((prev) => ({ ...prev, si: value, sgg: "", emd: "" }));
    } else if (name === "sgg") {
      setForm((prev) => ({ ...prev, sgg: value, emd: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    // 필수 항목 체크
    if (!form.kindCd.trim()) {
      alert("품종(필수)을 입력하세요.");
      return;
    }

    if (!form.sexCd.trim()) {
      alert("성별(필수)을 입력하세요.");
      return;
    }

    if (!form.age.trim()) {
      alert("나이(필수)를 입력하세요.");
      return;
    }

    if (!form.happenDt.trim()) {
      alert("실종 발생일자(필수)를 입력하세요.");
      return;
    }

    if (!form.si.trim() || !form.sgg.trim() || !form.emd.trim()) {
      alert("시/도, 시/군/구, 읍/면/동(필수)을 입력하세요.");
      return;
    }

    if (!form.happenAddr.trim()) {
      alert("실종 발생 주소(필수)를 입력하세요.");
      return;
    }

    if (!form.happenPlace.trim()) {
      alert("실종 발생 장소(필수)를 입력하세요.");
      return;
    }

    if (!form.reward.trim()) {
      alert("보상금(필수)을 입력하세요.");
      return;
    }

    if (!form.specialMark.trim()) {
      alert("특징(필수)을 입력하세요.");
      return;
    }

    try {
      const formData = new FormData();

      for (const key in form) {
        formData.append(key, form[key]);
      }

      if (imageFile) {
        formData.append("popfile", imageFile);  // name 그대로
      }
      
      const res = await axios.post(
        "http://localhost:5000/api/reward/animal/write",
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
        nav("/reward/animal");
      }
    } catch (err) {
      console.log("글 작성 중 오류: ", err);
      alert("글 작성 중 오류가 발생했습니다.");
    }
  };

  return(
    <div className="WriteAnimalReward">
      <div className="icon_section" onClick={()=>nav('/reward/animal')}>
        <img
          src={getIconImage(2)}
          style={{ width: "70px", height: "auto" }}
          className="icon"
        />
        <div className="txt">유기동물 사례금 글 작성</div>
      </div>

      <div className="input">
        <div className="animal_section">
          <div className="animal_1">
            <label>
              동물 품종(필수):{" "}
              <input type="text" name="kindCd" value={form.kindCd} onChange={handleChange} />
            </label>

            <label>
              RFID코드:{" "}
              <input type="text" name="rfidCd" value={form.rfidCd} onChange={handleChange} />
            </label>
          </div>

          <div className="animal_2">
            <label>
              동물 성별(필수):{" "}
              <select className='animal_sex' name='sexCd' value={form.sexCd} onChange={handleChange} >
                <option value="">선택</option>
                <option value="M">M(수컷)</option>
                <option value="F">F(암컷)</option>
              </select>
            </label>

            <label>
              동물 나이(필수):{" "}
              <input type="text" name="age" value={form.age} onChange={handleChange} />
            </label>
          </div>
        </div>

        <div className="time_section">
          <label>
            실종 발생일자(필수):{" "}
            <input type="date" name="happenDt" value={form.happenDt} onChange={handleChange} />
          </label>
        </div>

        <div className="place_section">
          <div className='si_section'>
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
            실종 발생주소(필수):{" "}
            <input type="text" name="happenAddr" value={form.happenAddr} onChange={handleChange} />
          </label>

          <label>
            실종 발생장소(필수):{" "}
            <input type="text" name="happenPlace" value={form.happenPlace} onChange={handleChange} />
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
            특징(필수):{" "}
            <textarea className="etc_input" name="specialMark" value={form.specialMark} onChange={handleChange} />
          </label>
        </div>

        <div className="img_section">
          <label>
            동물 이미지 업로드:{" "}
            <input type="file" accept="image/*" name="popfile" onChange={(e) => {
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

        <Button type={"BLACK"} text={"작성하기"} className="submit" onClick={handleSubmit} />
      </div>
    </div>
  );
};

export default WriteAnimalReward;