import "./LostList.css";
import MyPageListItem from "./MyPageListItem";
const MyPageList = ({ posts, cnt, currentPage }) => {
  const startNum = cnt - (currentPage - 1) * 10;
  return (
    <table className="lost-item-table">
      <thead className="lost-item-header">
        <tr className="lost-item-header-text">
          <th>NO</th>
          <th>게시판</th>
          <th>제목</th>
          <th>작성 날짜</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post, index) => {
          return (
            <MyPageListItem
              key={post._id}
              post={post}
              no={startNum - index}
              currentPage={currentPage}
            ></MyPageListItem>
          );
        })}
      </tbody>
    </table>
  );
};

export default MyPageList;
