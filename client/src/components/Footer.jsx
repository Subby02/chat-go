import "./Footer.css";
import { getIconImage } from "../util/get-img-icon";

const Footer = () => {
  return (
    <footer className="Footer">
      <img src={getIconImage(1)} />
      <p>
        찾Go (Find Lost Items) | 대표 이메일: contact@chatgo.co.kr
        <br />
        <br />
        이용약관 | 개인정보처리방침 | 자주 묻는 질문 | 분실물 등록 가이드 |
        문의하기 <br />
        <br />
        @ 2025 찾Go. All rights reserved.
        <br /> 본 사이트는 분실물 및 유기동물 정보를 공유하기 위해
        만들어졌습니다
      </p>
    </footer>
  );
};

export default Footer;
