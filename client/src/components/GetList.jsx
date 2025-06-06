import "./LostList.css";
import GetListItem from "./GetListItem";

const GetList = ({ posts, cnt, currentPage }) => {
  const startNum = cnt - (currentPage - 1) * 10;
  return (
    <table className="lost-item-table">
      <thead className="lost-item-header">
        <tr className="lost-item-header-text">
          <th>NO</th>
          <th></th>
          <th>분실물명</th>
          <th>지역</th>
          <th>작성 날짜</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post, index) => {
          return (
            <GetListItem
              key={post._id}
              post={post}
              no={startNum - index}
              currentPage={currentPage}
            ></GetListItem>
          );
        })}
      </tbody>
    </table>
  );
};

export default GetList;
