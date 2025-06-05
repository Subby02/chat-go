import "./LostListItem.css";
import { useNavigate } from "react-router-dom";

const RewardObjectItem = ({ post, no, currentPage }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (post && post._id) {
      navigate(`/reward/object/${post._id}?page=${currentPage}`);
    } else {
      console.error("게시물 ID가 없습니다: ", post);
    }
  };

  return (
    <tr className="lostItem" onClick={handleClick}>
      <td>{no}</td>
      <td>
        <img className="img" src={post.lstFilePathImg} alt="분실물 이미지" />
      </td>
      <td>{post.lstPrdtNm}</td>
      <td>{post.lstLctNm}</td>
      <td>{new Date(post.date).toLocaleDateString()}</td>
    </tr>
  );
};

export default RewardObjectItem;
