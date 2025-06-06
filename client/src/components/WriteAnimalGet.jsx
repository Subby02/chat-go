import './WriteAnimalGet.css';
import { getIconImage } from "../util/get-img-icon";
import regionData from "../full_region_dict"; // 상대경로에 맞게 수정
import Button from "./Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const WriteAnimalGet = () => {
  const nav = useNavigate();

  const [form, setForm] = useState({
    kindNm: "", // 동물 품종(필수)
    rfidCd: "", // RFID 코드
    age: "", // 동물 나이(필수)
    sexCd: "", // 동물 성별(필수)
    weight: "", // 체중(필수)---> 확인사항
    colorCd: "", // 색상(필수)
    neuterYn: "", // 중성화 여부 ----> 확인사항
    happenDt: "", // 실종 일자(필수)
    si: "", // 시/도(필수)
    sgg: "", // 시/군/구(필수)
    emd: "", // 읍/면/동(필수)
    happenPlace: "", // 실종 장소(필수)
    specialMark: "", // 특이사항(필수)
    popfile: "", // 이미지 URL
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
    if (!form.kindNm.trim()) {
      alert("동물 품종(필수)을 입력하세요.");
      return;
    }

    if (!form.age.trim()) {
      alert("동물 나이(필수)를 입력하세요.");
      return;
    }

    if (!form.sexCd.trim()) {
      alert("동물 성별(필수)을 입력하세요.");
      return;
    }

    if (!form.weight.trim()) {
      alert("동물 체중(필수)을 입력하세요.");
      return;
    }

    if (!form.colorCd.trim()) {
      alert("동물 색상(필수)을 입력하세요.");
      return;
    }

    if (!form.happenDt.trim()) {
      alert("발견 일자(필수)를 입력하세요.");
      return;
    }

    if (!form.si.trim() || !form.sgg.trim() || !form.emd.trim()) {
      alert("시/도, 시/군/구, 읍/면/동(필수)을 입력하세요.");
      return;
    }

    if (!form.happenPlace.trim()) {
      alert("발견 장소(필수)를 입력하세요.");
      return;
    }

    if(!form.specialMark.trim()) {
      alert("특징(필수)을 입력하세요.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/animal/get/write",
        form,
        {
          withCredentials: true,
        }
      );

      if (res.status === 201) {
        alert("글 등록 완료!");
        nav("/animal/get");
      }
    } catch (err) {
      console.log("글 작성 중 오류: ", err);
      alert("글 작성 중 오류가 발생했습니다.");
    }
  };


  return(
    <div className='WriteAnimalGet'>
      <div className='icon_section' onClick={() => nav('/animal/get') }>
        <img
          src={getIconImage(1)}
          style={{ width: "70px", height: "auto" }}
          className="icon"
        />
        <div className="txt">유기동물 제보 글 작성</div>
      </div>

      <div className='input'>

        <div className='animal_section'>
          <div className='animal_1'>
            <label>
                동물 품종(필수):{" "}
                <input type='text' className='animal_name' name='kindNm' value={form.kindNm} onChange={handleChange} />
              </label>

              <label>
                RFID 코드:{" "}
                <input type='text' className='rfid_code' name='rfidCd' value={form.rfidCd} onChange={handleChange} />
              </label>
          </div>

          <div className='animal_2'>
            <label>
              나이(필수):{" "}
              <input type='text' className='animal_age' name='age' value={form.age} onChange={handleChange} />
            </label>

            <label>
              성별(필수):{" "}
              <select className='animal_sex' name='sexCd' value={form.sexCd} onChange={handleChange} >
                <option value="">선택</option>
                <option value="M">M(수컷)</option>
                <option value="F">F(암컷)</option>
              </select>
            </label>

            <label>
              체중(필수):{" "}
              <input className='animal_weight' name='weight' value={form.weight} onChange={handleChange} />
            </label>
          </div>

          <div className='animal_3'>
            <label>
              색상(필수):{" "}
              <input className='animal_color' name='colorCd' value={form.colorCd} onChange={handleChange} />
            </label>

            <label>
              중성화 여부:{" "}
              <select className='animal_neuter' name='neuterYn' value={form.neuterYn} onChange={handleChange} >
                <option value="">선택</option>
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </label>
          </div>
        </div>

        <div className='time_section'>
          <label>
            실종 발생 일자(필수):{" "}
            <input type='date' className='lost_date' name='happenDt' value={form.happenDt} onChange={handleChange} />
          </label>
        </div>

        <div className='place_section'>
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
            발견장소(필수):{" "}
            <input type='text' className='get_place' name='happenPlace' value={form.happenPlace} onChange={handleChange} />
          </label>
        </div>

        <div className='etc_section'>
          <label>
            특징(필수):{" "}
            <textarea className='etc_input' name='specialMark' value={form.specialMark} onChange={handleChange} />
          </label>
        </div>

        <div className='img_section'>
          <label>
            이미지 URL:{" "}
            <input type='text' className='img' name='popfile' value={form.popfile} onChange={handleChange} />
          </label>
        </div>

        <Button type={"BLACK"} text={"작성하기"} className="submit" onClick={handleSubmit} />
      </div>
    </div>
  );
};

export default WriteAnimalGet;