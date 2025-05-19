
import { getIconImage } from "../util/get-img-icon";

const InquiryElemnet = () => {
  return(
    <div className="InquiryElement">
      <div className="icon">
        <img src={getIconImage(1)} style={{width: '70px', height: 'auto'}} className="icon"/>
        <div className="txt">찾Go 1:1 문의</div>
      </div>

      
    </div>
  )
};

export default InquiryElemnet;