import Header from "../components/Header";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "./FAQ.css";

const FAQ = () => {
  const nav = useNavigate();
  const [auth, setAuth] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/logout",
        {},
        { withCredentials: true }
      );
      setAuth(false);
      nav("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/status", {
        withCredentials: true,
      });
      setAuth(response.data.authenticated);
    } catch (err) {
      setAuth(false);
      console.error("Status fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const dummyFaqs = [
    {
      id: 4,
      title: "찾Go가 뭔가요?",
      content:
        "찾Go는 분실물과 유기동물 정보를 한 곳에 모아 신속하게 연결해주는 통합 플랫폼입니다.\n사용자는 분실물이나 유기동물을 제보하거나 찾기 위해 손쉽게 정보를 등록하고, 사진과 위치, 상황 설명 등을 직관적으로 입력할 수 있습니다.\n또한, 유사한 제보가 있을 경우 SMS 알림을 받을 수 있으며, 제보자에게는 사례금을 제공하는 시스템도 운영됩니다.",
      date: "2025-06-21",
    },
    {
      id: 3,
      title: "사례금 제도",
      content:
        "제보자에게 일정 금액의 사례금을 제공하여 시민 참여를 유도합니다.\n사례금은 제보자가 등록한 정보가 실제 분실물/동물의 주인과 연결되었을 때 지급됩니다.",
      date: "2025-06-21",
    },
    {
      id: 2,
      title: "사례금 관련 법",
      content:
        "사례금은 민법 제739조에 따라 자발적 보상금 개념으로 처리됩니다.\n금전 요구를 위한 허위 제보는 형사 처벌 대상이 될 수 있습니다.",
      date: "2025-06-21",
    },
    {
      id: 1,
      title: "알리기",
      content:
        "신고 게시판에서 게시글의 '알리기' 버튼을 누르면, 해당 게시글을 등록한 사용자에게 메시지가 발송됩니다.\n이때 알리기를 누른 사용자의 전화번호도 함께 전달되어, 양측이 직접 연락을 주고받을 수 있도록 연결해주는 기능입니다.\n제보자와 게시글 작성자가 서로 직접 확인 및 조율이 가능하게 하여, 빠른 문제 해결을 지원합니다.",
      date: "2025-06-21",
    },
  ];

  return (
    <>
      <Header authState={auth} handleLogout={handleLogout} />

      <div className="faq_container">
        <div className="title">
          <h1>자주 묻는 질문 FAQ</h1>
        </div>
        <table className="faq_table">
          <thead>
            <tr>
              <th>No</th>
              <th>제목</th>
              <th>작성일</th>
            </tr>
          </thead>
          <tbody>
            {dummyFaqs.map((faq, index) => (
              <>
                <tr
                  key={`row-${faq.id}`}
                  className="faq_row"
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <td>{faq.id}</td>
                  <td>{faq.title}</td>
                  <td>{faq.date}</td>
                </tr>
                {openIndex === index && (
                  <tr key={`answer-${faq.id}`} className="faq_answer_row">
                    <td
                      colSpan="3"
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        background: "#f9f9f9",
                      }}
                    >
                      {faq.content.split("\n").map((line, idx) => (
                        <span key={idx}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <Footer />
    </>
  );
};

export default FAQ;
