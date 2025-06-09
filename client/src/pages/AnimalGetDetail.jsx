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

const AnimalGetDetail = () => {
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
        `http://localhost:5000/api/animal/get/detail/${postId}`
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
          to={`/animal/get?page=${previousPage}`}
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
          to={`/animal/get?page=${previousPage}`}
          className="back-to-list-link"
          style={{ marginTop: "20px" }}
        >
          목록으로 돌아가기
        </RouterLink>
      </div>
    );

  return (
    <>
      <Header authState={auth} handleLogout={handleLogout} />

      <div className="post-detail-container">
        <h1>{post.post.kindNm}</h1>
        {post.post.popfile1 && (
          <img
            className="detail-image"
            src={post.post.popfile1}
            alt={post.post.kindNm || "습득물 이미지"}
          />
        )}
        <p>
          <strong>동물 품종:</strong> {post.post.kindNm || "제목 없음"}
        </p>

        <p>
          <strong>RFID 코드:</strong>
          {post.post.rfidCd || "RFID 코드 없음"}
        </p>

        <p>
          <strong>동물 나이:</strong> {post.post.age || "정보 없음"}
        </p>
        <p>
          <strong>동물 성별:</strong> {post.post.sexCd || "정보 없음"}
        </p>
        <p>
          <strong>중성화 여부:</strong>
          {post.post.neuterYn || "정보 없음"}
        </p>
        <p>
          <strong>동물 색상:</strong> {post.post.colorCd || "정보 없음"}
        </p>
        <p>
          <strong>동물 특징:</strong> {post.post.specialMark || "정보 없음"}
        </p>

        <p>
          <strong>발견 일자:</strong>
          {post.post.happenDt
            ? new Date(post.post.happenDt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "정보 없음"}
        </p>

        <p>
          <strong>발견 지역:</strong>
          {post.post.si}   {post.post.sgg}   {post.post.emd}
        </p>

        <p>
          <strong>발견 장소:</strong> {post.post.happenPlace || "정보 없음"}
        </p>
        <p>
          <strong>보호소 이름:</strong>
          {post.post.careNm
            ? `${post.post.careNm} (${post.post.careRegNo || "연락처 없음"})`
            : "정보 없음"}
        </p>

        <p>
          <strong>공고 번호:</strong> {post.post.noticeNo || "정보 없음"}
        </p>
        <p>
          <strong>공고 시작일:</strong>{" "}
          {post.post.noticeSdt
            ? `${post.post.noticeSdt.slice(0, 4)}년 ${parseInt(
                post.post.noticeSdt.slice(4, 6)
              )}월 ${parseInt(post.post.noticeSdt.slice(6, 8))}일`
            : "정보 없음"}
        </p>
        <p>
          <strong>공고 종료일:</strong>{" "}
          {post.post.noticeEdt
            ? `${post.post.noticeEdt.slice(0, 4)}년 ${parseInt(
                post.post.noticeEdt.slice(4, 6)
              )}월 ${parseInt(post.post.noticeEdt.slice(6, 8))}일`
            : "정보 없음"}
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
            to={`/animal/get${location.search}`}
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

export default AnimalGetDetail;
