import { useState, useEffect, useCallback } from "react";
import {
  useParams,
  Link as RouterLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import "./ObjLostDetail.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AnimalLostDetail = () => {
  const { postId } = useParams(); // App.js의 <Route path="/object/lost/:postId" ... /> 에서 :postId 값을 가져옴
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auth, setAuth] = useState(false);

  const nav = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const previousPage = queryParams.get("page") || 1;

  const fetchStatus = async () => {
    const response = await axios.get("http://localhost:5000/api/status", {
      withCredentials: true,
    });

    console.log(response);
    setAuth(response.data.authenticated);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

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

  const fetchPostDetail = useCallback(async () => {
    if (!postId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/animal/lost/detail/${postId}`
      );
      console.log(response.data);
      setPost(response.data);
    } catch (err) {
      setError(err);
      console.error(
        `ID [${postId}]의 상세 데이터를 불러오는데 실패했습니다.`,
        err
      );
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPostDetail();
  }, [fetchPostDetail]);

  const handleNotifyClick = async () => {
    if (!auth) {
      alert("로그인이 필요합니다. 먼저 로그인해주세요.");
      return;
    }

    if (!postId) {
      alert("게시물 ID를 찾을 수 없습니다.");
      return;
    }

    if (!window.confirm("게시물 작성자에게 알림을 보내시겠습니까?")) {
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/animal/lost/notify/${postId}`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        alert("알림이 성공적으로 전송되었습니다!");
        console.log("Notify API response:", response.data);
      } else {
        alert(`알림 전송 실패: ${response.data.message || "알 수 없는 오류"}`);
        console.error("Notify API error response:", response);
      }
    } catch (err) {
      console.error("Failed to send notification:", err);
      const errorMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "오류가 발생했습니다.";
      alert(errorMessage);
    }
  };

  if (loading) return <p>상세 정보를 불러오는 중입니다...</p>;
  if (error)
    return (
      <div className="post-detail-container" style={{ textAlign: "center" }}>
        <p>
          에러가 발생했습니다:{" "}
          {error.response
            ? `${error.response.status} - ${error.response.statusText}`
            : error.message}{" "}
          (ID: {postId})
        </p>
        <RouterLink
          to={`/animal/lost?page=${previousPage}`}
          className="back-to-list-link"
          style={{ marginTop: "20px" }}
        >
          목록으로 돌아가기
        </RouterLink>
      </div>
    );
  if (!post)
    return (
      <div className="post-detail-container" style={{ textAlign: "center" }}>
        <p>게시물 정보를 찾을 수 없습니다. (ID: {postId})</p>
        <RouterLink
          to={`/animal/lost?page=${previousPage}`}
          className="back-to-list-link"
          style={{ marginTop: "20px" }}
        >
          목록으로 돌아가기
        </RouterLink>
      </div>
    );

  console.log(post.post.kindCd);
  return (
    <>
      <Header authState={auth} handleLogout={handleLogout} />

      <div className="post-detail-container">
        <div className="header-with-button">
          <h1>{post.post.kindCd}</h1>
          {post.post.user_id === "분실동물" ? (
            <p style={{ fontWeight: "bold" }}>연락처: {post.post.callTel || "정보 없음"}</p>
          ) : (
            <button className="notify-button" onClick={handleNotifyClick}>
              알리기
            </button>
          )}
        </div>

        {post.post.popfile && (
          <img
            className="detail-image"
            src={post.post.popfile}
            alt={post.post.kindCd || "유기동물 이미지"}
          />
        )}

        <p>
          <strong>동물 품종:</strong> {post.post.kindCd || "정보 없음"}
        </p>

        <p>
          <strong>RFID 코드:</strong>
          {post.post.rfidCd || "RFID 코드 없음"}
        </p>

        <p>
          <strong>동물 성별:</strong> {post.post.sexCd || "정보 없음"}
        </p>
        <p>
          <strong>동물 나이:</strong> {post.post.age}
        </p>

        <p>
          <strong>동물 특징:</strong> {post.post.specialMark}
        </p>

        <p>
          <strong>실종 일자:</strong>
          {post.post.happenDt
            ? new Date(post.post.happenDt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "정보 없음"}
        </p>

        <p>
          <strong>실종 지역:</strong>
          {post.post.si} {post.post.sgg} {post.post.emd}
        </p>

        <p>
          <strong>실종 주소:</strong>
          {post.post.happenAddr || "정보 없음"}
        </p>

        <p>
          <strong>상세 주소:</strong>
          {post.post.happenAddrDtl || "정보 없음"}
        </p>

        <p>
          <strong>실종 장소:</strong> {post.post.happenPlace || "정보 없음"}
        </p>

        <p>
          <strong>제보 글 작성일:</strong>
          {post.post.date
            ? new Date(post.post.date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
              })
            : "정보 없음"}
        </p>

        <div>
          <RouterLink
            to={`/animal/lost${location.search}`}
            className="back-to-list-link"
          >
            목록으로 돌아가기
          </RouterLink>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AnimalLostDetail;
