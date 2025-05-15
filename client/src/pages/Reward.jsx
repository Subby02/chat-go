import { useParams } from "react-router-dom";

const Reward = ()=> {
  const params = useParams();
  
  return(
    <div>
      {params.id}번 사례금입니다.
    </div>
  );
};

export default Reward;