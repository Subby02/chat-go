import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
const MyPage = () => {
  const nav = useNavigate();
  const [auth, setAuth] = useState(false);

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
      <main></main>
      <Footer />
    </>
  );
};

export default MyPage;
