import "./LostListItem.css";
import { useNavigate } from "react-router-dom";

const MyPageListItem = ({ post, no, currentPage }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (post && post._id) {
      if (post.type === "objectLost") {
        navigate(`/object/lost/${post._id}`);
      } else if (post.type === "objectGet") {
        navigate(`/object/get/${post._id}`);
      } else if (post.type === "animalLost") {
        navigate(`/animal/lost/${post._id}`);
      } else if (post.type === "animalGet") {
        navigate(`/animal/get/${post._id}`);
      } else if (post.type === "rewardAnimal") {
        navigate(`/reward/animal/${post._id}`);
      } else if (post.type === "rewardObject") {
        navigate(`/reward/object/${post._id}`);
      } else if (post.type == "inquiry") {
        navigate(`/inquiry${post._id}`);
      }
    } else {
      console.error("게시물 ID가 없습니다: ", post);
    }
  };

  return (
    <tr className="lostItem" onClick={handleClick}>
      <td>{no}</td>
      <td>
        {post.type === "objectLost"
          ? "분실물 신고 게시판"
          : post.type === "objectGet"
          ? "분실물 제보 게시판"
          : post.type === "animalLost"
          ? "유기동물 신고 게시판"
          : post.type === "animalGet"
          ? "유기동물 제보 게시판"
          : post.type === "rewardAnimal"
          ? "사례금 동물 게시판"
          : post.type === "rewardObject"
          ? "사례금 물건 게시판"
          : post.type === "inquiry"
          ? "1:1 질문 게시판"
          : "정보 없음"}
      </td>
      <td>
        {" "}
        {post.type === "objectLost"
          ? post.lstPrdtNm
          : post.type === "objectGet"
          ? post.fdPrdtNm
          : post.type === "animalLost"
          ? post.kindCd
          : post.type === "animalGet"
          ? post.kindNm
          : post.type === "rewardAnimal"
          ? post.kindCd
          : post.type === "rewardObject"
          ? post.lstPrdtNm
          : post.type === "inquiry"
          ? post.title
          : "정보 없음"}
      </td>
      <td>{new Date(post.date).toLocaleDateString()}</td>
    </tr>
  );
};

export default MyPageListItem;
