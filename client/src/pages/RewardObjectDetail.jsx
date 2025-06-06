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

const RewardObjectDetail = () => {
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
        `http://localhost:5000/api/reward/object/detail/${postId}`
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
          to={`/reward/object?page=${previousPage}`}
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
          to={`/reward/object?page=${previousPage}`}
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
        <h1>{post.post.lstSbjt}</h1>
        {post.post.lstFilePathImg && (
          <img
            className="detail-image"
            src={post.post.lstFilePathImg}
            alt={post.post.lstSbjt || "분실물 이미지"}
          />
        )}
        <p>
          <strong>물품명:</strong> {post.post.lstPrdtNm || "정보 없음"}
        </p>
        <p>
          <strong>물품 분류명:</strong> {post.post.prdtClNm || "제목 없음"}
        </p>
        <p>
          <strong>특징:</strong>
          {post.post.uniq || "특징 정보 없음"}
        </p>
        <p>
          <strong>분실 일자:</strong>
          {post.post.lstYmd
            ? new Date(post.post.lstYmd).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "정보 없음"}
        </p>
        <p>
          <strong>분실 시간:</strong>

        </p>
        <p>
          <strong>분실 지역:</strong>
          {post.post.si}   {post.post.sgg}   {post.post.emd}
        </p>
        <p>
          <strong>상세 주소:</strong>
          {post.post.lstLctNm || "상세 주소 없음"}
        </p>
        <p>
          <strong>분실 장소:</strong>
          {post.post.lstPlace || "정보 없음"}
        </p>

        <p>
          <strong>사례금:</strong>
          {post.post.reward ? `${post.post.reward}만원` : "정보 없음"}
        </p>

        <p>
          <strong>사례금 등록일:</strong>
          {post.post.date
            ? new Date(post.post.date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "정보 없음"}
        </p>
        <div>
          <RouterLink
            to={`/reward/object?page=${previousPage}`}
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

export default RewardObjectDetail;
