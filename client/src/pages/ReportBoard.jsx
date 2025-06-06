import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import Searchbar from "../components/Searchbar";
import LostList from "../components/LostList";
import "./LostPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import { HiOutlinePencilAlt } from "react-icons/hi";

const ReportBoard = ({ type }) => {
  const [auth, setAuth] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/logout",
        {},
        { withCredentials: true }
      );
      setAuth(false);
      nav("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const fetchStatus = async () => {
    const response = await axios.get("http://localhost:5000/api/status", {
      withCredentials: true,
    });

    console.log(response);
    setAuth(response.data.authenticated);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const location = useLocation();

  const getInitialPageFromQuery = () => {
    const params = new URLSearchParams(location.search);
    const pageFromQuery = params.get("page");
    const pageNumber = parseInt(pageFromQuery, 10); // 숫자로 변환
    return !isNaN(pageNumber) && pageNumber > 0 ? pageNumber : 1; // 유효한 숫자면 사용, 아니면 1
  };

  const [keyword, setKeyword] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: "",
    lostDate: "",
    province: "",
    city: "",
    town: "",
  });
  const [currentPage, setCurrentPage] = useState(getInitialPageFromQuery);
  const [totalPage, setTotalPage] = useState(0);

  const [totalItems, setTotalItems] = useState(0);

  const nav = useNavigate();

  const fetchPosts = useCallback(
    async (pageToFetch = 1) => {
      console.log(pageToFetch);
      setLoading(true);
      setError(null);

      const queryString = new URLSearchParams();

      if (keyword) queryString.set("search", keyword);
      if (filters.startDate) queryString.set("startDate", filters.startDate);
      if (filters.lostDate) queryString.set("lostDate", filters.lostDate);
      if (filters.province) queryString.set("si", filters.province);
      if (filters.city) queryString.set("sgg", filters.city);
      if (filters.town) queryString.set("emd", filters.town);
      queryString.set("page", pageToFetch);

      let apiUrl = "http://localhost:5000/api/object/get/search";
      if (queryString) {
        apiUrl += `?${queryString}`;
      }
      try {
        const response = await axios.get(apiUrl);

        console.log(queryString.toString());
        console.log(response.data);
        const fetchedPosts = response.data.results;

        const totalPageCount = response.data.totalPages;
        console.log(totalPageCount);

        const totalItem = response.data.totalCount;

        console.log(totalItem);

        setFilteredPosts(fetchedPosts);
        setTotalPage(totalPageCount);
        setTotalItems(totalItem);
      } catch (err) {
        setError(err);
        console.error("데이터를 불러오는데 실패했습니다.", err);
      } finally {
        setLoading(false);
      }
    },
    [keyword, filters]
  );

  useEffect(() => {
    fetchPosts(currentPage);

    const params = new URLSearchParams(location.search);
    const pageFromQuery = parseInt(params.get("page"), 10);
    if (pageFromQuery !== currentPage) {
      nav(`/object/get?page=${currentPage}`, { replace: true });
    }
  }, [currentPage, fetchPosts, nav, location.search]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handlePageChange = (PageNumber) => {
    setCurrentPage(PageNumber);
  };

  if (loading) return <p>데이터를 불러오는 중입니다...</p>;
  if (error) return <p>에러가 발생했습니다: {error.message}</p>;

  return (
    <>
      <Header authState={auth} handleLogout={handleLogout} />

      <div className="lost-page-container">
        <h1
          style={{
            textAlign: "center",
            fontWeight: "normal",
            margin: "40px 0",
          }}
        >
          분실물 제보 게시판
        </h1>
        <Searchbar
          onSearch={handleSearch}
          keyword={keyword}
          setKeyword={setKeyword}
          filters={filters}
          setFilters={setFilters}
        />

        <div className="write">
          <button
            className="writeButton"
            onClick={() => {
              if (auth) nav("/object/get/write");
              else nav("/login");
            }}
          >
            <span style={{ fontSize: "20px" }}>글쓰기</span>

            <HiOutlinePencilAlt
              style={{ fontSize: "20px", marginBottom: "3px" }}
            />
          </button>
        </div>

        <LostList
          posts={filteredPosts}
          cnt={totalItems}
          currentPage={currentPage}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPage}
          onPageChange={handlePageChange}
        />
      </div>
      <Footer />
    </>
  );
};

export default ReportBoard;
