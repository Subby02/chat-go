import "./Body.css";
import Introduce from "./Introduce";
import PostSlider from "./PostSlider";
import Footer from "./Footer";
const Body = () => {
  return (
    <main>
      <section id="PostSlider">
        <div style={{ fontSize: "30px", paddingLeft: "120px" }}>최신글</div>
        <PostSlider />
        <Introduce />
        <Footer />
      </section>
    </main>
  );
};

export default Body;
