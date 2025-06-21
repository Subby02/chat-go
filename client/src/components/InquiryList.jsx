import "./InquiryList.css";
import InquiryListItem from "./InquiryListItem";

const InquiryList = ({ posts, cnt, currentPage }) => {
  const startNum = cnt - (currentPage - 1) * 10;
  return (
    <table className="inquiry-item-table">
      <thead className="inquiry-item-header">
        <tr className="inquiry-item-header-text">
          <th>NO</th>
          <th>답변</th>
          <th>제목</th>
          <th>작성자</th>
          <th>작성 날짜</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post, index) => {
          return (
            <InquiryListItem
              key={post._id}
              post={post}
              no={startNum - index}
              currentPage={currentPage}
            ></InquiryListItem>
          );
        })}
      </tbody>
    </table>
  );
};

export default InquiryList;
