import "./Searchbar.css";
import { useState } from "react";
import { getIconImage } from "../util/get-img-icon";
import { AiFillCaretDown } from "react-icons/ai";
import { AiOutlineSearch } from "react-icons/ai";
import FilterModal from "./FilterModal";

const Searchbar = ({ onSearch, keyword, setKeyword, filters, setFilters }) => {
  const [inputVal, setInputVal] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setKeyword(inputVal);
    onSearch(); 
  };

  const handleModal = () => {
    setModalOpen(!isModalOpen);
  };

  return (
    <>
      <form className="searchbar" onSubmit={handleSubmit}>
        <img src={getIconImage(2)} alt="Icon" className="searchbar-left-icon" />

        <input
          className="searchbar-input"
          onChange={(e) => {
            setInputVal(e.target.value);
          }}
        ></input>

        <div className="button-area">
          <button type="button" className="filter-button" onClick={handleModal}>
            상세 검색
            <AiFillCaretDown style={{ fontSize: "25px" }} />
          </button>

          <button className="search-button" type="submit">
            <AiOutlineSearch style={{ fontSize: "25px" }} />
          </button>
        </div>
      </form>
      {isModalOpen && (
        <FilterModal
          onClose={handleModal}
          filters={filters}
          setFilters={setFilters}
        />
      )}
    </>
  );
};

export default Searchbar;
