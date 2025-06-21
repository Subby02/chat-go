import './WriteInquiry.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIconImage } from "../util/get-img-icon";
import Button from "./Button";
import axios from 'axios';

const WriteInquiry = () => {
  const nav = useNavigate();

  const [form, setForm] = useState({
    title: "",
    content: "",
    isPublic: true,
  });

  const handleChange = (e) => {
    const {name, value} = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert("게시글 제목을 입력하세요.");
      return;
    }
    if (!form.content.trim()) {
      alert("게시글 내용을 입력하세요.");
      return;
    }

    try{
      const res = await axios.post(
        'http://localhost:5000/api/inquiry/write',
        form,
        { withCredentials: true }
      );

      if (res.status === 201 || res.status === 200) {
        alert('문의글이 등록되었습니다.');
        nav('/support/qna');
      }
    } catch(err) {
      console.log("글 작성 중 오류:", err);
      alert("글 작성 중 오류가 발생했습니다.");
    }
  };


  return(
    <div className='WriteInquiry'>
      <div className="icon_section" onClick={()=>nav('/support/qna')}>
        <img src={getIconImage(1)} style={{width: '70px', height: 'auto'}} className="icon"/>
        <div className="txt">1:1 질문 글 작성</div>
      </div>

      <div className='input'>
        <label>질문글 제목(필수): <input type="text" className="inquiry_title" name='title' value={form.title} onChange={handleChange} /></label>

        <label>질문글 내용(필수): <textarea className="inquiry_content" name='content' rows={10} value={form.content} onChange={handleChange} /></label>

        <div className='public_section'>
          <label>공개 설정:
          <input
            type="checkbox"
            name="isPublic"
            checked={form.isPublic}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isPublic: e.target.checked }))
            }
          />
        </label>
        </div>
        
        <Button type={"BLACK"} text={"작성하기"} className="submit" onClick={handleSubmit} />
      </div>

    </div>
  )
};

export default WriteInquiry;