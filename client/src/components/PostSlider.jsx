import "./PostSlider.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PostSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [posts, setPosts] = useState([]);
  const nav = useNavigate();

  const fetchLatestPosts = async () => {
    const res = await axios.get("http://localhost:5000/api/slider-posts");
    console.log(res);
    setPosts(res.data.sliderPosts);
  };

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  const getVisiblePost = () => {
    if (posts.length === 0) return [];
    return Array(Math.min(4, posts.length))
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
        {visiblePost.map((el, idx) =>
          el.type === "object" ? (
            <div
              key={idx}
              onClick={() => {
                nav(`/reward/object/${el.id}`);
              }}
              style={{ cursor: "pointer" }}
            >
              <img src={el.image} />
              <p>물품 명: {el.kind}</p>
              <p>분실 날짜: {new Date(el.date).toLocaleDateString()}</p>
              <p>지역: {el.location}</p>
              <p>사례금: {el.reward}만원</p>
            </div>
          ) : (
            <div
              key={idx}
              onClick={() => {
                nav(`/reward/animal/${el.id}`);
              }}
              style={{ cursor: "pointer" }}
            >
              <img src={el.image} />
              <p>품종: {el.kind}</p>
              <p>분실 날짜: {new Date(el.date).toLocaleDateString()}</p>
              <p>지역: {el.location}</p>
              <p>사례금: {el.reward}만원</p>
            </div>
          )
        )}
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
