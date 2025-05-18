import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link as RouterLink, useLocation } from "react-router-dom";
import axios from "axios";
import "./ObjLostDetail.css";

const ObjectLostDetail = () => {
  const { postId } = useParams(); // App.js의 <Route path="/object/lost/:postId" ... /> 에서 :postId 값을 가져옴
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const previousPage = queryParams.get("page") || 1;

  const fetchPostDetail = useCallback(async () => {
    if (!postId) return; // postId가 없으면 함수 실행 중단

    setLoading(true);
    setError(null);
    try {
      // 실제 상세 정보를 가져오는 API 엔드포인트로 수정해야 합니다.
      // postId가 atcId인지, id_인지에 따라 URL 구성이 달라질 수 있습니다.
      // 여기서는 postId가 서버에서 기대하는 ID 값이라고 가정합니다.
      const response = await axios.get(
        `http://localhost:5000/api/object/lost/detail/${postId}`
      );
      console.log(response.data);
      setPost(response.data); // 서버 응답 전체를 post 상태에 저장 (또는 필요한 부분만)
    } catch (err) {
      setError(err);
      console.error(
        `ID [${postId}]의 상세 데이터를 불러오는데 실패했습니다.`,
        err
      );
    } finally {
      setLoading(false);
    }
  }, [postId]); // postId가 변경될 때마다 fetchPostDetail 함수가 재생성되도록 함

  useEffect(() => {
    fetchPostDetail();
  }, [fetchPostDetail]); // fetchPostDetail 함수가 변경되면 (즉, postId가 변경되면) effect 실행

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
    <div className="post-detail-container">
      <h1>{post.post.lstPrdtNm}</h1>
      {post.post.lstFilePathImg && (
        <img
          className="detail-image" // 클래스 적용
          src={post.post.lstFilePathImg}
          alt={post.post.lstPrdtNm || "분실물 이미지"}
          // style 속성 제거 (CSS 파일에서 관리)
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
              hourt: "numeric",
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
  );
};

export default ObjectLostDetail;
