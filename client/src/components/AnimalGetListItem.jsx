import "./LostListItem.css";
import { useNavigate } from "react-router-dom";

const AnimalGetListItem = ({ post, no, currentPage }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (post && post._id) {
      navigate(`/animal/get/${post._id}?page=${currentPage}`);
    } else {
      console.error("게시물 ID가 없습니다: ", post);
    }
  };

  return (
    <tr className="lostItem" onClick={handleClick}>
      <td>{no}</td>
      <td>
        <img className="img" src={post.popfile1} alt="유기동물이미지" />
      </td>
      <td>{post.kindNm}</td>
      <td>
        {post.si} {post.sgg} {post.emd}
      </td>
      <td>{new Date(post.date).toLocaleDateString()}</td>
    </tr>
  );
};

export default AnimalGetListItem;
