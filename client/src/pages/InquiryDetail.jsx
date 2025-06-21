import { useEffect, useState } from "react";
import { useParams, useLocation, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import "./ObjLostDetail.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const InquiryDetail = () => {
  const { id } = useParams();
  const location = useLocation();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auth, setAuth] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [answerInput, setAnswerInput] = useState("");

  const fetchPost = async () => {
    try {
      const statusRes = await axios.get("http://localhost:5000/api/status", {
        withCredentials: true,
      });

      setAuth(statusRes.data.authenticated);
      const user = statusRes.data.user;
      setCurrentUserId(user?._id);
      setIsAdmin(user?.role === 1);

      const res = await axios.get(`http://localhost:5000/api/inquiry/detail/${id}`, {
        withCredentials: true,
      });

      setPost(res.data.inquiry);

    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleAnswerSubmit = async () => {
    try {
      if (!answerInput.trim()) return alert("답변 내용을 입력해주세요.");
      await axios.post(
        `http://localhost:5000/api/inquiry/${id}/answer`,
        { answer: answerInput },
        { withCredentials: true }
      );
      alert("답변이 등록되었습니다.");
      setAnswerInput("");
      fetchPost(); // 답변 등록 후 다시 불러오기
    } catch (err) {
      console.error(err);
      alert("답변 등록 실패");
    }
  };

  if (loading) return <p style={{ textAlign: "center", fontWeight: "bold" }}>문의글을 불러오는 중입니다...</p>;

  if (error)
    return (
      <div className="post-detail-container" style={{ textAlign: "center" }}>
        <p>
          에러 발생:{" "}
          {error.response
            ? `${error.response.status} - ${error.response.statusText}`
            : error.message}
        </p>
        <RouterLink to={`/support/qna${location.search}`} className="back-to-list-link">
          목록으로 돌아가기
        </RouterLink>
      </div>
    );

  if (!post)
    return (
      <div className="post-detail-container" style={{ textAlign: "center" }}>
        <p>문의글 정보를 찾을 수 없습니다. (ID: {id})</p>
        <RouterLink to={`/support/qna${location.search}`} className="back-to-list-link">
          목록으로 돌아가기
        </RouterLink>
      </div>
    );

  const canViewWriter = post.isPublic || currentUserId === post.user_id || isAdmin;

  return (
    <>
      <Header authState={auth} />
      <div className="post-detail-container">
        <h1>{post.title}</h1>

        <div className="detail-info-item">
          <span className="detail-info-label">작성자:</span>
          <span className="detail-info-value">{canViewWriter ? post.writer : "비공개"}</span>
        </div>

        <div className="detail-info-item">
          <span className="detail-info-label">작성일자:</span>
          <span className="detail-info-value">
            {new Date(post.date).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <div className="detail-info-item">
          <span className="detail-info-label">공개 여부:</span>
          <span className="detail-info-value">{post.isPublic ? "공개" : "비공개"}</span>
        </div>

        <div className="detail-info-item">
          <span className="detail-info-label">문의 내용:</span>
          <p style={{ whiteSpace: "pre-line", paddingLeft: "10px", fontSize: "1vw", color: "#444" }}>
            {post.content}
          </p>
        </div>

        {post.answer && (
          <>
            <div className="detail-info-item">
              <span className="detail-info-label">관리자 답변:</span>
              <p
              style={{
                whiteSpace: "pre-line",
                paddingLeft: "10px",
                fontSize: "1vw",
                color: "#007acc",
              }}
            >
              {post.answer}
            </p>
            </div>
            
          </>
        )}

        {isAdmin && (
          <div className="admin-answer-section" style={{ marginTop: "20px" }}>
            <div className="detail-info-item">
              <span className="detail-info-label">답변 입력:</span>
            </div>
            <textarea
              rows={5}
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              style={{ width: "100%", fontSize: "1vw", padding: "8px", marginBottom: "10px" }}
            />
            <button
              onClick={handleAnswerSubmit}
              style={{
                padding: "10px 20px",
                fontSize: "1vw",
                backgroundColor: "#007acc",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              답변 등록
            </button>
          </div>
        )}

        <RouterLink to={`/support/qna${location.search}`} className="back-to-list-link">
          목록으로 돌아가기
        </RouterLink>
      </div>
      <Footer />
    </>
  );
};

export default InquiryDetail;
