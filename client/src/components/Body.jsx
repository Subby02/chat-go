import "./Body.css";
import Introduce from "./Introduce";
import PostSlider from "./PostSlider";
import Footer from "./Footer";
const Body = () => {
  return (
    <main>
      <section id="PostSlider">

        <div className="main">
          <div style={{ fontSize: "30px", marginBottom:"3vh", marginTop:"3vh", textAlign: "left"}}>최신글</div>
          <PostSlider />
          <Introduce />
        </div>
       
        <Footer />
      </section>
    </main>
  );
};

export default Body;
