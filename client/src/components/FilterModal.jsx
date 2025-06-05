import { useState, useEffect } from "react";
import regionData from "../full_region_dict"; // 상대경로에 맞게 수정
import "./FilterModal.css";

const FilterModal = ({ onClose, filters, setFilters }) => {
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

  // 지역 선택 핸들러는 기존과 동일
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

  return (
    <div className="modalContainer" onClick={onClose}>
      <div className="modalContent" onClick={handleContentClick}>
        {/* 날짜 입력 필드들 */}
        <h1 style={{ fontWeight: "normal" }}>날짜 선택</h1>
        <div>
          <label htmlFor="dateStart">시작 검색 날짜</label>
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
        </div>
        <div style={{ marginTop: "10px" }}>
          <label htmlFor="dateEnd">종료 검색 날짜</label>
          <input
            id="dateEnd"
            type="date"
            value={localFilters.endDate || ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, endDate: e.target.value }))
            }
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          <label htmlFor="lstYmdStart">분실 시작일</label>
          <input
            id="lstYmdStart"
            type="date"
            value={localFilters.lstYmdStart || ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                lstYmdStart: e.target.value,
              }))
            }
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          <label htmlFor="lstYmdEnd">분실 종료일</label>
          <input
            id="lstYmdEnd"
            type="date"
            value={localFilters.lstYmdEnd || ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                lstYmdEnd: e.target.value,
              }))
            }
          />
        </div>

        <h1 style={{ fontWeight: "normal", marginTop: "20px" }}>지역 선택</h1>
        <label>시/도</label>
        <select value={selectedProvince} onChange={handleProvinceChange}>
          <option value="">선택</option>
          {Object.keys(regionData).map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </select>

        {selectedProvince && (
          <>
            <label>시/군/구</label>
            <select value={selectedCity} onChange={handleCityChange}>
              <option value="">선택</option>
              {Object.keys(regionData[selectedProvince]).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </>
        )}

        {selectedProvince && selectedCity && (
          <>
            <label>읍/면/동</label>
            <select value={selectedTown} onChange={handleTownChange}>
              <option value="">선택</option>
              {regionData[selectedProvince][selectedCity].map((town) => (
                <option key={town} value={town}>
                  {town}
                </option>
              ))}
            </select>
          </>
        )}

        <div style={{ textAlign: "right" /* 예시 스타일 */ }}>
          <button
            style={{
              fontSize: "20px",
              cursor: "pointer",
              padding: "10px 20px",
              borderRadius: "10px",
              marginRight: "10px",
            }}
            onClick={handleApply}
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
