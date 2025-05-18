import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import Searchbar from "../components/Searchbar";
import LostList from "../components/LostList";
import "./LostPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import { getIconImage } from "../util/get-img-icon";
import Header from "../components/Header";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
const LostPage = () => {
  const location = useLocation();

  const getInitialPageFromQuery = () => {
    const params = new URLSearchParams(location.search);
    const pageFromQuery = params.get("page");
    const pageNumber = parseInt(pageFromQuery, 10); // 숫자로 변환
    return !isNaN(pageNumber) && pageNumber > 0 ? pageNumber : 1; // 유효한 숫자면 사용, 아니면 1
  };

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(getInitialPageFromQuery);
  const [totalPage, setTotalPage] = useState(0);

  const [totalItems, setTotalItems] = useState(0);

  const nav = useNavigate();

  const fetchPosts = useCallback(async (pageToFetch = 1) => {
    console.log(pageToFetch);
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/object/lost/search?page=${pageToFetch}`
      );

      console.log(response.data);
      const fetchedPosts = response.data.results;

      const totalPageCount = response.data.totalPages;
      console.log(totalPageCount);

      const totalItem = response.data.totalCount;

      console.log(totalItem);

      setPosts(fetchedPosts);
      setFilteredPosts(fetchedPosts);
      setTotalPage(totalPageCount);
      setTotalItems(totalItem);
    } catch (err) {
      setError(err);
      console.error("데이터를 불러오는데 실패했습니다.", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(currentPage);

    const params = new URLSearchParams(location.search);
    const pageFromQuery = parseInt(params.get("page"), 10);
    if (pageFromQuery !== currentPage) {
      nav(`/object/lost?page=${currentPage}`, { replace: true });
    }
  }, [currentPage, fetchPosts, nav, location.search]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredPosts(posts);
    } else {
      const lowercasedFilter = searchTerm.toLowerCase();
      const filteredData = posts.filter((post) =>
        post.title.toLowerCase().includes(lowercasedFilter)
      );
      setFilteredPosts(filteredData);
    }
  }, [searchTerm, posts]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    // fetchPosts(1);
  };

  const handlePageChange = (PageNumber) => {
    setCurrentPage(PageNumber);
  };

  if (loading) return <p>데이터를 불러오는 중입니다...</p>;
  if (error) return <p>에러가 발생했습니다: {error.message}</p>;

  return (
    <div className="lost-page-container">
      <Header
        icon={
          <img
            src={getIconImage(1)}
            style={{ width: "100%", height: "auto" }}
          />
        }
        mainTitle={"찾Go"}
        subTitle={"Find Lost Items"}
        mypage={<Button text={"마이페이지"} />}
        login={
          <Button
            text={"로그인"}
            onClick={() => {
              nav("/login");
            }}
          />
        }
        register={
          <Button
            text={"회원가입"}
            type={"BLACK"}
            onClick={() => {
              nav("/register");
            }}
          />
        }
      />
      <h1>분실물 신고 게시판</h1>
      <Searchbar onSearch={handleSearch} />
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
      <Footer />
    </div>
  );
};

export default LostPage;
