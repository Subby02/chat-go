import { useState } from "react";
import regionData from "../full_region_dict";
import "./FilterModal.css";

const FilterModal = ({
  onClose,
  filters,
  setFilters,
  sd,
  ed,
  sub_sd,
  sub_ed,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [selectedProvince, setSelectedProvince] = useState(filters.si || "");
  const [selectedCity, setSelectedCity] = useState(filters.sgg || "");
  const [selectedTown, setSelectedTown] = useState(filters.emd || "");

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const handleApply = () => {
    setFilters({
      ...localFilters,
      si: selectedProvince,
      sgg: selectedCity,
      emd: selectedTown,
    });
    onClose();
  };

  const handleProvinceChange = (e) => {
    const si = e.target.value;
    setSelectedProvince(si);
    setSelectedCity("");
    setSelectedTown("");
  };

  const handleCityChange = (e) => {
    const sgg = e.target.value;
    setSelectedCity(sgg);
    setSelectedTown("");
  };

  const handleTownChange = (e) => {
    setSelectedTown(e.target.value);
  };

  const handleReset = () => {
    setLocalFilters({
      startDate: "",
      endDate: "",
      [sub_sd]: "",
      [sub_ed]: "",
    });
    setSelectedProvince("");
    setSelectedCity("");
    setSelectedTown("");
  };

  return (
    <div className="modalContainer" onClick={onClose}>
      <div className="modalContent" onClick={handleContentClick}>
        <h1 className="modal-title">상세 검색</h1>

        <div className="filter-section">
          <div className="date-range-container">
            <label className="filter-label" htmlFor="dateStart">
              글 등록일
            </label>
            <input
              id="dateStart"
              type="date"
              value={localFilters.startDate || ""}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
            />
            <span className="date-separator">~</span>
            <input
              id="dateEnd"
              type="date"
              value={localFilters.endDate || ""}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
            />
          </div>

          <div className="date-range-container">
            <label className="filter-label" htmlFor={sub_sd}>
              {sd}
            </label>
            <input
              id={sub_sd}
              type="date"
              value={localFilters[sub_sd] || ""}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  [sub_sd]: e.target.value,
                }))
              }
            />
            <span className="date-separator">~</span>
            <input
              id={sub_ed}
              type="date"
              value={localFilters[sub_ed] || ""}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  [sub_ed]: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="filter-section">
          <div className="region-select-container">
            <label className="filter-label">지역 선택</label>
            <select value={selectedProvince} onChange={handleProvinceChange}>
              <option value="">시/도 선택</option>
              {Object.keys(regionData).map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>

            {selectedProvince && (
              <select value={selectedCity} onChange={handleCityChange}>
                <option value="">시/군/구 선택</option>
                {Object.keys(regionData[selectedProvince]).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            )}

            {selectedProvince && selectedCity && (
              <select value={selectedTown} onChange={handleTownChange}>
                <option value="">읍/면/동 선택</option>
                {regionData[selectedProvince][selectedCity].map((town) => (
                  <option key={town} value={town}>
                    {town}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="modal-buttons">
          <button className="modal-button reset-button" onClick={handleReset}>
            초기화
          </button>
          <button className="modal-button apply-button" onClick={handleApply}>
            적용
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
