import "./Introduce.css";
import { getIconImage } from "../util/get-img-icon";

const Introduce = () => {
  return (
    <div className="Introduce">
      <div className="Top">
        <div className="LeftTop">
          <img src={getIconImage(1)} />
          <div style={{ textAlign: "center" }}>찾Go란?</div>
        </div>

        <div className="ScriptTop">
          <p>
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              "찾Go"
            </span>
            는 분실물과 유기동물 정보를 한 곳에 모아 신속하게 연결해주는 통합
            플랫폼입니다.<br></br>
            <br />
            사용자는 분실물이나 유기동물을 제보하거나 찾기 위해 손쉽게 정보를
            등록하고,
            <br />
            사진과 위치, 상황 설명 등을 직관적으로 입력할 수 있습니다.
            <br />
            또한, 등록된 정보와 유사한 제보가 있을 경우 SMS 알림을 통해 빠르게
            확인할 수 있으며,
            <br />
            제보자에게는 사례금을 제공하는 시스템도 마련되어 있어, 시민 참여를
            유도하고 공동체 책임을 실현하는 서비스입니다.
          </p>
        </div>
      </div>
      <div className="Bottom">
        <div className="LeftBottom">
          <img src={getIconImage(2)} />
          <div style={{ textAlign: "center" }}>사례금 제도</div>
        </div>

        <div className="ScriptBottom">
          <p>
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              "찾Go"
            </span>
            는 분실물이나 유기동물을 되찾는 데 기여한 사용자에게 사례금을
            지급하는 제도를 운영합니다.
            <br />
            <br /> 사용자가 등록한 정보와 일치하거나 유사한 제보를 통해 실제로
            물건이나 동물이 주인에게 돌아갈 경우,
            <br /> 제보자에게 사례금을 지급하여 적극적인 참여와 선한 제보 문화를
            장려합니다. <br></br>이 시스템은 단순한 정보 공유를 넘어, 사회적
            책임과 보상의 선순환 구조를 지향합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Introduce;
