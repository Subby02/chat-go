import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./MyPage.css";
import MyPageList from "../components/MyPageList";
import Pagination from "../components/Pagination";

const MyPage = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [auth, setAuth] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "",
    phone_number: "",
  });
  const [history, setHistory] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const getInitialPageFromQuery = () => {
    const params = new URLSearchParams(location.search);
    const pageFromQuery = params.get("page");
    const pageNumber = parseInt(pageFromQuery, 10);
    return !isNaN(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  };

  const [currentPage, setCurrentPage] = useState(getInitialPageFromQuery);

  const fetchUserData = async () => {
    try {
      const statusRes = await axios.get("http://localhost:5000/api/status", {
        withCredentials: true,
      });
      setAuth(statusRes.data.authenticated);

      if (statusRes.data.authenticated) {
        const infoRes = await axios.get("http://localhost:5000/api/user/info", {
          withCredentials: true,
        });
        setUserInfo(infoRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setAuth(false);
    }
  };

  const fetchHistory = async (page) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/user/posts?page=${page}`,
        {
          withCredentials: true,
        }
      );
      setTotalItems(res.data.totalCount);
      setTotalPages(res.data.totalPages);
      setHistory(res.data.results);
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (auth) {
      fetchHistory(currentPage);
      const newSearch = `?page=${currentPage}`;
      if (location.search !== newSearch) {
        nav(`/mypage${newSearch}`, { replace: true });
      }
    }
  }, [currentPage, auth, nav, location.search]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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

  return (
    <>
      <Header authState={auth} handleLogout={handleLogout} />
      <div className="MyPageContainer">
        <h1 className="MyPageTitle">마이페이지</h1>
        <div className="mypage-layout">
          <aside className="mypage-sidebar">
            <div className="profile-card">
              <div className="profile-header">
                <h3>{userInfo.name || "사용자"}님</h3>
                <p>환영합니다!</p>
              </div>
              <div className="profile-details">
                <p>
                  <strong>이메일:</strong> {userInfo.email}
                </p>
                <p>
                  <strong>연락처:</strong> {userInfo.phone_number}
                </p>
              </div>
              <button
                className="password-change-btn"
                onClick={() => nav("/find-pwd")}
              >
                비밀번호 변경
              </button>
            </div>
          </aside>
          <main className="mypage-content">
            <div className="content-header">
              <h2>내가 작성한 글</h2>
            </div>
            <MyPageList
              posts={history}
              cnt={totalItems}
              currentPage={currentPage}
            />
            <div className="pagination-container">
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyPage;
