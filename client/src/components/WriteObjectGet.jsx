import './WriteObjectGet.css';
import Button from "./Button";
import regionData from "../full_region_dict"; // 상대경로에 맞게 수정
import { getIconImage } from "../util/get-img-icon";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const WriteObjectGet = () => {
  const nav = useNavigate();
  
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    fdPrdtNm: "", //물품명(필수)
    prdtClNm: "", // 분류명
    fdYmd: "", // 습득일자(필수)
    si: "", // 시/도
    sgg: "", // 시/군/구
    emd: "", // 읍/면/동
    fdPlace: "", //습득장소
    depPlace: "", // 보관장소
    uniq: "", // 특징
    fdFilePathImg: "", // 이미지 업로드
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

  const handleSubmit = async() => {
    // 필수 입력 사항 체크
    if (!form.fdPrdtNm.trim()) {
      alert("습득 물품명(필수)을 입력하세요.");
      return;
    }
    if (!form.fdYmd.trim()) {
      alert("습득일자(필수)를 입력하세요.");
      return;
    }
    if(!form.si.trim() || !form.sgg.trim() || !form.emd.trim()){
      alert("시/도, 시/군/구, 읍/면/동 (필수)을 입력하세요.")
    }
    if (!form.fdPlace.trim()) {
      alert("습득장소(필수)를 입력하세요.");
      return;
    }
    if (!form.depPlace.trim()) {
      alert("보관장소(필수)를 입력하세요.");
      return;
    }

    try {
      const formData = new FormData();

      for (const key in form) {
        formData.append(key, form[key]);
      }

      if(imageFile) {
        formData.append("fdFilePathImg", imageFile);
      }

      const res = await axios.post(
        "http://localhost:5000/api/object/get/write", 
        formData,
        {
          withCredentials: true,
          headers: {
          "Content-Type": "multipart/form-data",
          },
        }
      );

      if(res.status === 201)
      {
        alert("글 작성 완료!");
        nav('/object/get'); 
      }
    } catch(err) {
      console.log("글 작성 중 오류:", err);
      alert("글 작성 중 오류가 발생했습니다.");
    }
  };

  return(
    <div className="WriteObjectGet">
      <div className="icon_section" onClick={()=>nav('/object/get')}>
        <img src={getIconImage(1)} style={{width: '70px', height: 'auto'}} className="icon"/>
        <div className="txt">분실물 습득 글 작성</div>
      </div>

      <div className='input'>
        <div className="object_section">
          <label>습득 물품명(필수): <input type="text" className="object_name" name='fdPrdtNm' value={form.fdPrdtNm} onChange={handleChange} /></label>
          <label>습득 물품 분류명: <input type="text" className="object_group" name='prdtClNm' value={form.prdtClNm} onChange={handleChange} /></label>
        </div>

        <div className="time_section">
          <label>습득일자(필수): <input type="date" className="get_date" name='fdYmd' value={form.fdYmd} onChange={handleChange} /></label>
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

          <label>습득장소(필수): <input type="text" className="get_place" name='fdPlace' value={form.fdPlace} onChange={handleChange} /></label>
          <label>보관장소(필수): <input type='text' className='dep_place' name='depPlace' value={form.depPlace} onChange={handleChange} /></label>
        </div>

        <div className="etc_section">
          <label>특징: <textarea className="etc_input" name='uniq' rows={4} value={form.uniq} onChange={handleChange} /></label>
        </div>

        <div className="img_section">
          <label>습득물 이미지 업로드: 
            <input type="file" accept='image/*' name='fdFilePathImg' onChange={(e) => {
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
  )
};

export default WriteObjectGet;