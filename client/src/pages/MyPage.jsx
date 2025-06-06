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
  const [auth, setAuth] = useState(false);
  const [userInfo, setInfo] = useState({
    email: "",
    name: "",
    phone_number: "",
  });

  const [history, setHistory] = useState([]);

  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const location = useLocation();

  const getInitialPageFromQuery = () => {
    const params = new URLSearchParams(location.search);
    const pageFromQuery = params.get("page");
    const pageNumber = parseInt(pageFromQuery, 10); // 숫자로 변환
    return !isNaN(pageNumber) && pageNumber > 0 ? pageNumber : 1; // 유효한 숫자면 사용, 아니면 1
  };

  const [currentPage, setCurrentPage] = useState(getInitialPageFromQuery);

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

  const fetchUserInfo = async () => {
    const response = await axios.get("http://localhost:5000/api/user/info", {
      withCredentials: true,
    });
    console.log(response);
    setInfo(response.data);
  };

  const fetchHistory = async (page = 1) => {
    const res = await axios.get(
      `http://localhost:5000/api/user/posts?page=${page}`,
      {
        withCredentials: true,
      }
    );
    setTotalItems(res.data.totalCount);
    setTotalPages(res.data.totalPages);
    setHistory(res.data.results);
  };

  const handlePageChange = (PageNumber) => {
    setCurrentPage(PageNumber);
  };

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchUserInfo();
  }, []);

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
        <p className="MyPageTitle">마이 페이지</p>

        <div className="MyUserInfo">
          <h1>사용자 정보</h1>
          <p>이메일: {userInfo.email}</p>
          <p>이름: {userInfo.name}</p>
          <p>전화번호: {userInfo.phone_number}</p>

          <button
            className="findPwd"
            onClick={() => {
              nav("/find-pwd");
            }}
          >
            비밀 번호 변경 하기
          </button>
          <h1 style={{ marginTop: "40px" }}>내가 작성한 글</h1>
        </div>

        <MyPageList
          posts={history}
          cnt={totalItems}
          currentPage={currentPage}
        />
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>

      <Footer />
    </>
  );
};

export default MyPage;
