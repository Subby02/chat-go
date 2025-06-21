import "./InquiryListItem.css";
import { useNavigate, useLocation } from "react-router-dom";

const InquiryListItem = ({ post, no, currentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (post && post._id) {
      navigate(`/support/qna/detail/${post._id}${location.search}`);
    } else {
      console.error("게시물 ID가 없습니다: ", post);
    }
  };

  return (
    <tr className="inquiryItem" onClick={handleClick}>
      <td>{no}</td>
      <td>{post.status === "답변완료" ? "✔️" : "❌"}</td>
      <td>{post.title}</td>
      <td>{post.writer || "작성자 미상"}</td>
      <td>{new Date(post.date).toLocaleDateString()}</td>
    </tr>
  );
};

export default InquiryListItem;
