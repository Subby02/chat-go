import "./LostListItem.css";
import { useNavigate, useLocation } from "react-router-dom";

const GetListItem = ({ post, no, currentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (post && post._id) {
      navigate(`/object/get/${post._id}${location.search}`);
    } else {
      console.error("게시물 ID가 없습니다: ", post);
    }
  };

  return (
    <tr className="lostItem" onClick={handleClick}>
      <td>{no}</td>
      <td>
        <img className="img" src={post.fdFilePathImg} alt="분실물이미지" />
      </td>
      <td>{post.fdPrdtNm}</td>
      <td>
        {post.si} {post.sgg} {post.emd}
      </td>
      <td>{new Date(post.date).toLocaleDateString()}</td>
    </tr>
  );
};

export default GetListItem;
