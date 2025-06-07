import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import Searchbar from "../components/Searchbar";
import AnimalGetList from "../components/AnimalGetList";
import "./LostPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import { HiOutlinePencilAlt } from "react-icons/hi";

const getInitialStateFromQuery = (location) => {
  const params = new URLSearchParams(location.search);
  const page = parseInt(params.get("page"), 10);

  return {
    page: !isNaN(page) && page > 0 ? page : 1,
    keyword: params.get("search") || "",
    filters: {
      startDate: params.get("dateStart") || "",
      endDate: params.get("dateEnd") || "",
      happenDtStart: params.get("happenDtStart") || "",
      happenDtEnd: params.get("happenDtEnd") || "",
      si: params.get("si") || "",
      sgg: params.get("sgg") || "",
      emd: params.get("emd") || "",
    },
  };
};

const AnimalGet = () => {
  const [auth, setAuth] = useState(false);
  const location = useLocation();
  const nav = useNavigate();

  const initialState = getInitialStateFromQuery(location);

  const [keyword, setKeyword] = useState(initialState.keyword);
  const [activeFilters, setActiveFilters] = useState(initialState.filters);
  const [pendingFilters, setPendingFilters] = useState(initialState.filters);
  const [currentPage, setCurrentPage] = useState(initialState.page);

  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPage, setTotalPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

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
    try {
      const response = await axios.get("http://localhost:5000/api/status", {
        withCredentials: true,
      });
      setAuth(response.data.authenticated);
    } catch (err) {
      setAuth(false);
      console.error("Status fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchPosts = useCallback(
    async (pageToFetch) => {
      setLoading(true);
      setError(null);

      const queryString = new URLSearchParams();
      if (keyword) queryString.set("search", keyword);
      if (activeFilters.startDate)
        queryString.set("dateStart", activeFilters.startDate);
      if (activeFilters.endDate)
        queryString.set("dateEnd", activeFilters.endDate);
      if (activeFilters.happenDtStart)
        queryString.set("happenDtStart", activeFilters.happenDtStart);
      if (activeFilters.happenDtEnd)
        queryString.set("happenDtEnd", activeFilters.happenDtEnd);
      if (activeFilters.si) queryString.set("si", activeFilters.si);
      if (activeFilters.sgg) queryString.set("sgg", activeFilters.sgg);
      if (activeFilters.emd) queryString.set("emd", activeFilters.emd);
      queryString.set("page", pageToFetch);

      try {
        const response = await axios.get(
          `http://localhost:5000/api/animal/get/search?${queryString}`
        );
        setFilteredPosts(response.data.results);
        setTotalPage(response.data.totalPages);
        setTotalItems(response.data.totalCount);
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

    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    if (keyword) params.set("search", keyword);
    if (activeFilters.startDate)
      params.set("dateStart", activeFilters.startDate);
    if (activeFilters.endDate) params.set("dateEnd", activeFilters.endDate);
    if (activeFilters.happenDtStart)
      params.set("happenDtStart", activeFilters.happenDtStart);
    if (activeFilters.happenDtEnd)
      params.set("happenDtEnd", activeFilters.happenDtEnd);
    if (activeFilters.si) params.set("si", activeFilters.si);
    if (activeFilters.sgg) params.set("sgg", activeFilters.sgg);
    if (activeFilters.emd) params.set("emd", activeFilters.emd);

    const newSearch = `?${params.toString()}`;

    if (location.search !== newSearch) {
      nav(`/animal/get${newSearch}`, { replace: true });
    }
  }, [currentPage, keyword, activeFilters, nav, location.search, fetchPosts]);

  const handleSearch = () => {
    setActiveFilters(pendingFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
          유기동물 제보 게시판
        </h1>
        <Searchbar
          onSearch={handleSearch}
          keyword={keyword}
          setKeyword={setKeyword}
          filters={pendingFilters}
          setFilters={setPendingFilters}
          sd="발견 기간"
          ed="발견 종료일"
          sub_sd="happenDtStart"
          sub_ed="happenDtEnd"
        />

        <div className="write">
          <button
            className="writeButton"
            onClick={() => {
              if (auth) nav("/animal/get/write");
              else nav("/login");
            }}
          >
            <span style={{ fontSize: "20px" }}>글쓰기</span>
            <HiOutlinePencilAlt
              style={{ fontSize: "20px", marginBottom: "3px" }}
            />
          </button>
        </div>

        <AnimalGetList
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

export default AnimalGet;
