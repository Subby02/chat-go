import "./PostSlider.css";
import { useState } from "react";
import Button from "./Button";

const PostSlider = ({ type }) => {
  console.log(type);
  const [currentIndex, setCurrentIndex] = useState(0);
  const posts = [
    {
      url: "https://cdn.pixabay.com/photo/2023/03/28/09/28/cat-7882701_1280.jpg",
      type: "종류: 고양이",
      time: `분실 일자 : ${new Date().toLocaleDateString()}`,
      loc: "부산",
    },
    {
      url: "https://cdn.pixabay.com/photo/2021/03/08/12/31/oxford-shoes-6078993_1280.jpg",
      type: "종류: 신발",
      time: `분실 일자 : ${new Date().toLocaleDateString()}`,
      loc: "대구",
    },
    {
      url: "https://cdn.pixabay.com/photo/2024/01/15/21/16/dog-8510901_1280.jpg",
      type: "종류: 개",
      time: `분실 일자 : ${new Date().toLocaleDateString()}`,
      loc: "서울",
    },
    {
      url: "https://cdn.pixabay.com/photo/2019/10/30/16/19/fox-4589927_1280.jpg",
      type: "종류: 동물",
      time: `분실 일자 : ${new Date().toLocaleDateString()}`,
      loc: "울산",
    },
    {
      url: "https://cdn.pixabay.com/photo/2014/08/05/10/27/iphone-410311_1280.jpg",
      type: "종류: 핸드폰",
      time: `분실 일자 : ${new Date().toLocaleDateString()}`,
      loc: "부산",
    },
  ];

  const getVisiblePost = () => {
    return Array(4)
      .fill(0)
      .map((_, i) => posts[(currentIndex + i) % posts.length]);
  };

  const nextBtn = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  };

  const prevBtn = () => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
  };

  const visiblePost = getVisiblePost();

  return (
    <div className="PostSlider">
      <button
        style={{
          fontSize: "50px",
          backgroundColor: "white",
          border: "none",
          cursor: "pointer",
        }}
        onClick={prevBtn}
      >
        &lt;
      </button>

      <div className="post">
        {visiblePost.map((el, idx) => (
          <div key={idx}>
            <img src={el.url} />
            <p>{el.type}</p>
            <p>{el.time}</p>
            <p>{el.loc}</p>
          </div>
        ))}
      </div>

      <button
        style={{
          fontSize: "50px",
          backgroundColor: "white",
          border: "none",
          cursor: "pointer",
        }}
        onClick={nextBtn}
      >
        &gt;
      </button>
    </div>
  );
};

export default PostSlider;
