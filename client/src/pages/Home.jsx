import Header from "../components/Header"
import Button from "../components/Button"
import { getIconImage } from '../util/get-img-icon';

const Home = ()=> {
  return(
    <div>
      <Header 
        icon={<img src={getIconImage(1)} style={{width: '150px', height: 'auto'}} />}
        mainTitle={"찾Go"} 
        subTitle={"Find Lost Items"}
        mypage={<Button text={"마이페이지"}/>}
        login={<Button text={"로그인"} />}
        register={<Button text={"회원가입"} type={"BLACK"} />}
      />
    </div>
  );
};

export default Home;