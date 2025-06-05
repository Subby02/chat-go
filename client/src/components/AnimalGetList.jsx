import "./LostList.css";
import AnimalGetListItem from "./AnimalGetListItem";
const AnimalGetList = ({ posts, cnt, currentPage }) => {
  const startNum = cnt - (currentPage - 1) * 10;
  return (
    <table className="lost-item-table">
      <thead className="lost-item-header">
        <tr className="lost-item-header-text">
          <th>NO</th>
          <th></th>
          <th>품종명</th>
          <th>보호소명</th>
          <th>작성 날짜</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post, index) => {
          return (
            <AnimalGetListItem
              key={post._id}
              post={post}
              no={startNum - index}
              currentPage={currentPage}
            ></AnimalGetListItem>
          );
        })}
      </tbody>
    </table>
  );
};

export default AnimalGetList;
