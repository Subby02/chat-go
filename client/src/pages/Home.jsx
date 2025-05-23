import Body from "../components/Body";
import { getIconImage } from "../util/get-img-icon";
import Header from "../components/Header";
import Button from "../components/Button";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
const Home = ({ LatesPost }) => {
  const [auth, setAuth] = useState(false);

  const nav = useNavigate();

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
      <Header authState={auth} />
      <main style={{ width: "1200px", margin: "0 auto" }}>
        <Body />
      </main>
      <Footer />
    </>
  );
};

export default Home;
