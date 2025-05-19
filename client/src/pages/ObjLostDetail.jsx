import React, { useState, useEffect, useCallback } from "react";
import {
  useParams,
  Link as RouterLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import "./ObjLostDetail.css";
import Header from "../components/Header";
import { getIconImage } from "../util/get-img-icon";
import Button from "../components/Button";
import Footer from "../components/Footer";

const ObjectLostDetail = () => {
  const { postId } = useParams(); // App.js의 <Route path="/object/lost/:postId" ... /> 에서 :postId 값을 가져옴
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auth, setAuth] = useState(false);

  const nav = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const previousPage = queryParams.get("page") || 1;

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/logout",
        {},
        { withCredentials: true }
      );
      setAuth(false);
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
        `http://localhost:5000/api/object/lost/detail/${postId}`
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
          to={`/object/lost?page=${previousPage}`}
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
          to={`/object/lost?page=${previousPage}`}
          className="back-to-list-link"
          style={{ marginTop: "20px" }}
        >
          목록으로 돌아가기
        </RouterLink>
      </div>
    );

  return (
    <>
      <Header
        icon={
          <img
            src={getIconImage(1)}
            style={{ width: "100px", height: "100px" }}
          />
        }
        mainTitle={"찾Go"}
        subTitle={"Find Lost Items"}
        mypage={<Button text={"마이페이지"} type={"MYPAGE"} />}
        login={
          <Button
            text={"로그인"}
            onClick={() => {
              nav("/login");
            }}
            type={"LOGIN"}
          />
        }
        register={
          <Button
            text={"회원가입"}
            type={"REGISTER"}
            onClick={() => {
              nav("/register");
            }}
          />
        }
        logout={
          <Button text={"로그아웃"} type={"REGISTER"} onClick={handleLogout} />
        }
        authState={auth}
      />
      <div className="post-detail-container">
        <h1>{post.post.lstPrdtNm}</h1>
        {post.post.lstFilePathImg && (
          <img
            className="detail-image"
            src={post.post.lstFilePathImg}
            alt={post.post.lstPrdtNm || "분실물 이미지"}
          />
        )}
        <p>
          <strong>분실물 제목:</strong> {post.post.lstSbjt || "제목 없음"}
        </p>
        <p>
          <strong>분실 장소 (분류):</strong>{" "}
          {post.post.lstPlaceSeNm || "정보 없음"}
        </p>
        <p>
          <strong>분실 장소 (상세):</strong> {post.post.lstPlace || "정보 없음"}
        </p>
        <p>
          <strong>보관 장소:</strong>
          {post.post.orgNm
            ? `${post.post.orgNm} (${post.post.tel || "연락처 없음"})`
            : "정보 없음"}
        </p>
        <p>
          <strong>분실 일:</strong>
          {post.post.lstYmd
            ? new Date(post.post.lstYmd).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
              })
            : "정보 없음"}
        </p>

        <p>
          <strong>등록 일:</strong>
          {post.post.date
            ? new Date(post.post.date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
              })
            : "정보 없음"}
        </p>

        <p>
          <strong>물품 분류:</strong> {post.post.prdtClnm || "정보 없음"}
        </p>
        <p>
          <strong>상태:</strong> {post.post.lstSteNm || "정보 없음"}
        </p>

        <div>
          <RouterLink
            to={`/object/lost?page=${previousPage}`}
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

export default ObjectLostDetail;
