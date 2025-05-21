import "./Body.css";
import Introduce from "./Introduce";
import PostSlider from "./PostSlider";
const Body = () => {
  return (
    <section className="MainPost">
      <h1 className="PostTitle">
        <div>사례금 게시판</div>
      </h1>
      <PostSlider />
      <Introduce />
    </section>
  );
};

export default Body;
