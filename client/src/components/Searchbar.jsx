import "./Searchbar.css";
import { useState } from "react";
import { getIconImage } from "../util/get-img-icon";
import { AiFillCaretDown } from "react-icons/ai";
import { AiOutlineSearch } from "react-icons/ai";

const Searchbar = ({ onSearch }) => {
  const [inputVal, setInputVal] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(inputVal);
  };

  return (
    <form onSubmit={handleSubmit} className="Searchbar">
      <img src={getIconImage(1)} alt="Icon" className="SearchbarLeftIcon" />

      <input
        className="SearchbarInput"
        type="text"
        placeholder="검색어를 입력하세요..."
        value={inputVal} //입력 데이터 UI요소 동기화.
        onChange={(e) => setInputVal(e.target.value)}
      ></input>

      <div className="SearchbarButtonGroup">
        <button
          type="button"
          className="SearchbarFilterButton"
          aria-label="상세기능"
        >
          <AiFillCaretDown className="FeatureIconDropdown" />
        </button>

        <button type="submit" className="SearchButton" aria-label="검색">
          <AiOutlineSearch className="Search" />
        </button>
      </div>
    </form>
  );
};

export default Searchbar;
