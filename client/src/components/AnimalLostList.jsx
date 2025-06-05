import "./LostList.css";
import AnimalLostItem from "./AnimalLostItem";
const AnimalLostList = ({ posts, cnt, currentPage }) => {
  const startNum = cnt - (currentPage - 1) * 10;
  return (
    <table className="lost-item-table">
      <thead className="lost-item-header">
        <tr className="lost-item-header-text">
          <th>NO</th>
          <th></th>
          <th>품종</th>
          <th>분실장소</th>
          <th>작성 날짜</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post, index) => {
          return (
            <AnimalLostItem
              key={post._id}
              post={post}
              no={startNum - index}
              currentPage={currentPage}
            ></AnimalLostItem>
          );
        })}
      </tbody>
    </table>
  );
};

export default AnimalLostList;
