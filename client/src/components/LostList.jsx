import "./LostList.css";
import LostListItem from "./LostListItem";

const LostList = ({ posts, cnt, currentPage }) => {
  const startNum = cnt - (currentPage - 1) * 10;
  return (
    <table className="lost-item-table">
      <thead className="lost-item-header">
        <tr className="lost-item-header-text">
          <th>NO</th>
          <th></th>
          <th>분실물</th>
          <th>지역</th>
          <th>작성 날짜</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post, index) => {
          return (
            <LostListItem
              key={post._id}
              post={post}
              no={startNum - index}
              currentPage={currentPage}
            ></LostListItem>
          );
        })}
      </tbody>
    </table>
  );
};

export default LostList;
