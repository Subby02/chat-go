import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import Searchbar from "../components/Searchbar";
import AnimalLostList from "../components/AnimalLostList";
import "./LostPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import { HiOutlinePencilAlt } from "react-icons/hi";

const AnimalLost = ({ type }) => {
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
  const [activeFilters, setActiveFilters] = useState({
    startDate: "",
    endDate: "",
    happenDtStart: "",
    happenDtEnd: "",
    si: "",
    sgg: "",
    emd: "",
  });
  const [pendingFilters, setPendingFilters] = useState(activeFilters);
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
      if (activeFilters.startDate)
        queryString.set("dateStart", activeFilters.startDate);
      if (activeFilters.lostDate)
        queryString.set("dateEnd", activeFilters.endDate);
      if (activeFilters.happenDtStart)
        queryString.set("happendDtStart", activeFilters.happenDtStart);
      if (activeFilters.happenDtEnd)
        queryString.set("happenDtEnd", activeFilters.happenDtEnd);
      if (activeFilters.si) queryString.set("si", activeFilters.si);
      if (activeFilters.sgg) queryString.set("sgg", activeFilters.sgg);
      if (activeFilters.emd) queryString.set("emd", activeFilters.emd);
      queryString.set("page", pageToFetch);

      let apiUrl = "http://localhost:5000/api/animal/lost/search";
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
    [keyword, activeFilters]
  );

  useEffect(() => {
    fetchPosts(currentPage);

    const params = new URLSearchParams(location.search);
    const pageFromQuery = parseInt(params.get("page"), 10);
    if (pageFromQuery !== currentPage) {
      nav(`/animal/lost?page=${currentPage}`, { replace: true });
    }
  }, [currentPage, fetchPosts, nav, location.search]);

  const handleSearch = () => {
    setActiveFilters(pendingFilters);
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
          유기동물 신고 게시판
        </h1>
        <Searchbar
          onSearch={handleSearch}
          keyword={keyword}
          setKeyword={setKeyword}
          filters={pendingFilters}
          setFilters={setPendingFilters}
          sd="실종 시작일"
          ed="실종 종료일"
          sub_sd="happenDtStart"
          sub_ed="happenDtEnd"
        />

        <div className="write">
          <button
            className="writeButton"
            onClick={() => {
              if (auth) nav("/animal/lost/write");
              else nav("/login");
            }}
          >
            <span style={{ fontSize: "20px" }}>글쓰기</span>

            <HiOutlinePencilAlt
              style={{ fontSize: "20px", marginBottom: "3px" }}
            />
          </button>
        </div>

        <AnimalLostList
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

export default AnimalLost;
