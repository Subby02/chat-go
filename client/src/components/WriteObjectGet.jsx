import './WriteObjectGet.css';
import Button from "./Button";
import { getIconImage } from "../util/get-img-icon";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const WriteObjectGet = () => {
  const nav = useNavigate();

  const [form, setForm] = useState({
    fdPrdtNm: '',
    prdtClNm: '',
    fdYmd: '',
    fdHor: '',
    fdPlace: '',
    depPlace: '',
    csteSteNm: '',
    uniq: '',
    tel: '',
    fdFilePathImg: '',
  });

  const handleChange = (e) => {
    const {name, value} = e.target;
    setForm({...form, [name]: value});
  };

  const handleSubmit = async() => {
    try {
      const res = await axios.post("http://localhost:5000/api/object/get/write", form);

      if(res.status === 201)
      {
        alert("글 작성 완료!");
        nav('/object'); 
      }
    } catch(err) {
      console.log("글 작성 중 오류:", err);
      alert("글 작성 중 오류가 발생했습니다.");
    }
  };

  return(
    <div className="WriteObjectGet">
      <div className="icon_section">
        <img src={getIconImage(1)} style={{width: '70px', height: 'auto'}} className="icon"/>
        <div className="txt">분실물 습득 글 작성</div>
      </div>

      <div className='input'>
        {/* <div className="title">
          <label>게시글 제목: <input type="text" className="post_title" name='lstSbjt' value={form.lstSbjt} onChange={handleChange} /></label>
        </div> */}

        <div className="object_section">
          <label>물품명(필수): <input type="text" className="object_name" name='fdPrdtNm' value={form.fdPrdtNm} onChange={handleChange} /></label>
          <label>물품 분류명: <input type="text" className="object_group" name='prdtClNm' value={form.prdtClNm} onChange={handleChange} /></label>
        </div>

        <div className="time_section">
          <label>습득일자(필수): <input type="date" className="get_date" name='fdYmd' value={form.fdYmd} onChange={handleChange} /></label>
          <label>습득시간: <input type="time" className="get_time" name='fdHor' value={form.fdHor} onChange={handleChange} /></label>
        </div>

        <div className="place_section">
          <label>습득장소(필수): <input type="text" className="get_place" name='fdPlace' value={form.fdPlace} onChange={handleChange} /></label>
        </div>

        <div className='dep_section'>
          <label>보관장소(필수): <input type='text' className='dep_place' name='depPlace' value={form.depPlace} onChange={handleChange} /></label>
        </div>

        <div className="plus_section">
          <label>상태명: <input type="text" className="state" name='csteSteNm' value={form.csteSteNm} onChange={handleChange} /></label>
        </div>

        <div className="etc_section">
          <label>특이사항: <textarea className="etc_input" name='uniq' rows={4} value={form.uniq} onChange={handleChange} /></label>
        </div>

        <div className="tel_section">
          <label>전화번호: <input type="text" className="phone" name='tel' value={form.tel} onChange={handleChange} /></label>
        </div>

        <div className="img_URL">
          <label>이미지 URL: <input type="text" className="img" name='fdFilePathImg' value={form.fdFilePathImg} onChange={handleChange} /></label>
        </div>

        <Button type={"BLACK"} text={"작성하기"} className="submit" onClick={handleSubmit} />
      </div>
    </div>
  )
};

export default WriteObjectGet;