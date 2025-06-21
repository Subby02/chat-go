import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import Searchbar from "../components/Searchbar";
import "./Inquiry.css";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import { HiOutlinePencilAlt } from "react-icons/hi";
import InquiryList from "../components/InquiryList";

const Inquiry = () => {
  const [auth, setAuth] = useState(false);
  const location = useLocation();
  const nav = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    async (pageTofetch) => {
      setLoading(true);
      setError(null);

      try {
        let res;
        if (keyword.trim()) {
          const queryString = new URLSearchParams();
          queryString.set("q", keyword);
          queryString.set("type", "tc");
          queryString.set("page", pageTofetch);
          res = await axios.get(
            `http://localhost:5000/api/inquiry/search?${queryString}`
          );
        } else {
          const queryString = new URLSearchParams();
          queryString.set("page", pageTofetch);
          res = await axios.get(
            `http://localhost:5000/api/inquiry/list?${queryString}`
          );
        }

        setPosts(res.data.results);
        setTotalPages(res.data.totalPages || 1);
        setTotalItems(res.data.totalItems || res.data.results.length);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [keyword]
  );

  useEffect(() => {
    fetchPosts(currentPage);

    const params = new URLSearchParams();
    params.set("page", currentPage);
    if (keyword) params.set("q", keyword);

    const newSearch = `?${params.toString()}`;
    if (location.search !== newSearch) {
      nav(`/support/qna${newSearch}`, { replace: true });
    }
  }, [currentPage, keyword, nav, location.search, fetchPosts]);

  const handleSearch = () => {
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

      <div className="inquiry-page-container">
        <h1
          style={{
            textAlign: "center",
            fontWeight: "normal",
            margin: "40px 0",
          }}
        >
          1:1 질문 게시판
        </h1>

        <Searchbar
          onSearch={() => setCurrentPage(1)}
          keyword={keyword}
          setKeyword={setKeyword}
          filters={{}}
          setFilters={{}}
          type={"inquiry"}
        />

        <div className="write">
          <button
            className="writeButton"
            onClick={() => {
              if (auth) nav("/support/qna/write");
              else nav("/login");
            }}
          >
            <span style={{ fontSize: "20px" }}>글쓰기</span>
            <HiOutlinePencilAlt
              style={{ fontSize: "20px", marginBottom: "3px" }}
            />
          </button>
        </div>

        <InquiryList posts={posts} cnt={totalItems} currentPage={currentPage} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Footer />
    </>
  );
};

export default Inquiry;
