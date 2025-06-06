import "./Pagination.css"; // 동일한 CSS 파일 사용 또는 필요에 따라 수정

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageButtonLimit = 10, // 한 번에 보여줄 페이지 버튼의 최대 개수
}) => {
  // 현재 페이지가 속한 블록(그룹) 계산
  // 예: pageButtonLimit이 10일 때, 1~10페이지는 1번 블록, 11~20페이지는 2번 블록
  const currentBlock = Math.ceil(currentPage / pageButtonLimit);

  // 현재 블록의 시작 페이지와 끝 페이지 계산
  let startPage = (currentBlock - 1) * pageButtonLimit + 1;
  let endPage = Math.min(startPage + pageButtonLimit - 1, totalPages);

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="pagination-container" aria-label="Page navigation">
      <ul className="pagination-list">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="첫 페이지로"
            style={{ fontFamily: "Arial" }}
          >
            &laquo;
          </button>
        </li>

        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="이전 페이지"
          >
            &lt;
          </button>
        </li>

        {startPage > 1 && (
          <li className="page-item disabled">
            <button disabled>...</button>
          </li>
        )}

        {pageNumbers.map((number) => (
          <li
            key={number}
            className={`page-item ${number === currentPage ? "active" : ""}`}
          >
            <button onClick={() => onPageChange(number)}>{number}</button>
          </li>
        ))}

        {endPage < totalPages && (
          <li className="page-item disabled">
            <button disabled>...</button>
          </li>
        )}

        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="다음 페이지"
          >
            &gt;
          </button>
        </li>

        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="마지막 페이지로"
            style={{ fontFamily: "Arial" }}
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
