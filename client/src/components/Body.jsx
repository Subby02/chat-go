import "./Body.css";
import Introduce from "./Introduce";
import PostSlider from "./PostSlider";
import NewPost from "./NewPost";
const Body = ({ auth }) => {
  return (
    <section className="MainPost">
      <h1 className="PostTitle1">
        <div>사례금 게시판</div>
      </h1>
      <div className="line1">
        <PostSlider />
      </div>

      <h1 className="PostTitle2">
        <div>빠른 글 작성</div>
      </h1>
      <div className="line2">
        <NewPost auth={auth} />
      </div>

      <div className="line3">
        <Introduce />
      </div>
    </section>
  );
};

export default Body;
