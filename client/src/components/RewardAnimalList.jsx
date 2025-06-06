import "./LostList.css";
import RewardAnimalItem from "./RewardAnimalItem";
const RewardAnimalList = ({ posts, cnt, currentPage }) => {
  const startNum = cnt - (currentPage - 1) * 10;
  return (
    <table className="lost-item-table">
      <thead className="lost-item-header">
        <tr className="lost-item-header-text">
          <th>NO</th>
          <th></th>
          <th>품종</th>
          <th>지역</th>
          <th>작성 날짜</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post, index) => {
          return (
            <RewardAnimalItem
              key={post._id}
              post={post}
              no={startNum - index}
              currentPage={currentPage}
            ></RewardAnimalItem>
          );
        })}
      </tbody>
    </table>
  );
};

export default RewardAnimalList;
