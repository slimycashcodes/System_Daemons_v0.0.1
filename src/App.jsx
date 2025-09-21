import { useState, useEffect } from "react";
import Papa from "papaparse";

export default function RainHarvestPro() {
  const [district, setDistrict] = useState("");
  const [roofArea, setRoofArea] = useState("");
  const [roofType, setRoofType] = useState("Concrete");
  const [dwellers, setDwellers] = useState(4);
  const [report, setReport] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rainfallData, setRainfallData] = useState([]);
  const [groundwaterData, setGroundwaterData] = useState([]);
  const [soilData, setSoilData] = useState([]);
  const [aquiferData, setAquiferData] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);

  // Unified input/select style
  const commonInputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.3)",
    marginBottom: "15px",
    backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "#fff",
    color: darkMode ? "#fff" : "#222",
    fontFamily: "Poppins, sans-serif",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "background 0.2s,color 0.2s"
  };

  // Needed for option elements but not all browsers apply these
  const optionStyle = {
    color: darkMode ? "#fff" : "#222",
    backgroundColor: darkMode ? "#222" : "#fff",
    fontFamily: "Poppins, sans-serif",
    fontSize: "14px",
  };

  const containerStyle = {
    width: "100vw",
    minHeight: "100vh",
    margin: 0,
    padding: "20px",
    background: darkMode
      ? "linear-gradient(135deg, #0f0c29, #302b63, #24243e)"
      : "linear-gradient(135deg, #dbe6f6, #c5796d)",
    color: darkMode ? "#f5f5f5" : "#222",
    fontFamily: "Poppins, sans-serif",
    boxSizing: "border-box",
  };

  const cardStyle = {
    backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    backdropFilter: "blur(12px)",
    flex: "1 1 auto",
    transition: "all 0.3s ease-in-out",
  };

  const buttonStyle = {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "16px",
    color: "#fff",
    cursor: "pointer",
    background: "linear-gradient(270deg, #00c6ff, #0072ff, #00c6ff)",
    backgroundSize: "600% 600%",
    animation: "gradientShift 6s ease infinite",
    boxShadow: "0px 4px 20px rgba(0, 114, 255, 0.6)",
    fontFamily: "Poppins, sans-serif",
    marginBottom: "10px"
  };

  const gradientAnimation = `
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  // Load CSVs
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        setError("");

        const csvFiles = [
          { path: "/data/rainfall_by_district.csv", setter: setRainfallData },
          { path: "/data/groundwater_depth.csv", setter: setGroundwaterData },
          { path: "/data/soil_type.csv", setter: setSoilData },
          { path: "/data/aquifer_info.csv", setter: setAquiferData },
        ];

        const loadedData = {};
        for (const file of csvFiles) {
          try {
            const response = await fetch(file.path);
            if (!response.ok) throw new Error(`Failed to fetch ${file.path}`);
            const csvContent = await response.text();

            Papa.parse(csvContent, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                const cleanData = results.data
                  .filter((row) =>
                    Object.values(row).some((val) => val !== null && val !== "")
                  )
                  .map((row) => {
                    const cleanRow = {};
                    Object.keys(row).forEach((key) => {
                      cleanRow[key.trim()] =
                        typeof row[key] === "string" ? row[key].trim() : row[key];
                    });
                    return cleanRow;
                  });

                file.setter(cleanData);
                loadedData[file.path] = cleanData;
              },
            });
          } catch {
            file.setter([]);
            loadedData[file.path] = [];
          }
        }

        setTimeout(() => {
          const allDistricts = new Set();
          Object.values(loadedData).forEach((dataset) => {
            dataset.forEach((row) => {
              const possibleDistrictFields = [
                "District",
                "district",
                "City",
                "city",
                "Location",
                "location",
                "State",
                "state",
              ];
              possibleDistrictFields.forEach((field) => {
                if (row[field] && typeof row[field] === "string" && row[field].trim()) {
                  allDistricts.add(row[field].trim());
                }
              });
            });
          });

          setAvailableDistricts(Array.from(allDistricts).sort());
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError(`Error loading data: ${err.message}`);
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const findDataByDistrict = (dataset, searchDistrict) => {
    return dataset.find((row) => {
      const districtValue =
        row.District ||
        row.district ||
        row.City ||
        row.city ||
        row.Location ||
        row.location ||
        row.State ||
        row.state;
      return (
        districtValue &&
        districtValue.toLowerCase() === searchDistrict.toLowerCase()
      );
    });
  };

  const calculate = () => {
    if (!district || !roofArea || !dwellers) {
      alert("Please fill all required fields");
      return;
    }

    const rainfallRow = findDataByDistrict(rainfallData, district);
    const groundwaterRow = findDataByDistrict(groundwaterData, district);
    const soilRow = findDataByDistrict(soilData, district);
    const aquiferRow = findDataByDistrict(aquiferData, district);

    const rainfall = rainfallRow
      ? rainfallRow.Annual_Rainfall_mm ||
        rainfallRow["Annual Rainfall (mm)"] ||
        rainfallRow.Rainfall ||
        1000
      : 1000;

    const runoffCoeff = {
      Concrete: 0.85,
      Tile: 0.75,
      Metal: 0.9,
      Thatched: 0.5,
    };
    const rc = runoffCoeff[roofType] || 0.8;

    const harvest = roofArea * rainfall * rc * 0.001;

    const cost = harvest < 50000 ? 15000 : harvest < 200000 ? 30000 : 50000;
    const structure = harvest < 50000 ? "Pit" : harvest < 200000 ? "Trench" : "Shaft";

    const gwDepth = groundwaterRow
      ? groundwaterRow.Groundwater_Depth_m || "NA"
      : "NA";
    const soilType = soilRow ? soilRow.Soil_Type || "Unknown" : "Unknown";
    const aquifer = aquiferRow ? aquiferRow.Principal_Aquifer || "Unknown" : "Unknown";
    const recharge = aquiferRow ? aquiferRow.Recharge_Potential || "Moderate" : "Moderate";

    const volume = harvest / 1000;
    const savings = volume * 50;
    const payback = savings > 0 ? (cost / savings).toFixed(2) : "NA";
    const efficiencyRating =
      harvest > 100000 ? "🟢 Excellent" : harvest > 50000 ? "🟡 Good" : "🟠 Moderate";

    setReport(`
      <div style="margin-top: 10px; line-height: 1.6; color: ${darkMode ? "#f0f0f0" : "#222"};">
        <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">📊 Assessment Report: ${district}</h2>
        
        <div style="background: ${darkMode ? "#2c2c2c" : "#f8f9fa"}; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
          <h3>💧 Harvest Analysis</h3>
          <p><b>Annual Rainfall:</b> ${rainfall} mm</p>
          <p><b>Harvest Potential:</b> ${harvest.toLocaleString()} L/year</p>
          <p><b>Efficiency Rating:</b> ${efficiencyRating}</p>
          <p><b>Per Person Supply:</b> ${(harvest / dwellers).toFixed(0)} L/year</p>
        </div>

        <div style="background: ${darkMode ? "#2c2c2c" : "#f8f9fa"}; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
          <h3>🏗️ Infrastructure</h3>
          <p><b>Structure:</b> ${structure}</p>
          <p><b>Storage Volume:</b> ${volume.toFixed(2)} m³</p>
          <p><b>Roof Type:</b> ${roofType}</p>
        </div>

        <div style="background: ${darkMode ? "#2c2c2c" : "#f8f9fa"}; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
          <h3>🌍 Local Conditions</h3>
          <p><b>Groundwater Depth:</b> ${gwDepth} m</p>
          <p><b>Soil Type:</b> ${soilType}</p>
          <p><b>Aquifer:</b> ${aquifer}</p>
          <p><b>Recharge:</b> ${recharge}</p>
        </div>

        <div style="background: ${darkMode ? "#2c2c2c" : "#e8f5e8"}; padding: 15px; border-radius: 12px;">
          <h3>💰 Economic Analysis</h3>
          <p><b>Installation Cost:</b> ₹${cost.toLocaleString()}</p>
          <p><b>Annual Savings:</b> ₹${savings.toLocaleString()}</p>
          <p><b>Payback:</b> ${payback} years</p>
        </div>
      </div>
    `);
  };

  return (
    <div style={containerStyle}>
      <style>{gradientAnimation}</style>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/generated-image.ico" 
            alt="Icon" 
            style={{ width: 75, height: 75, marginRight: 8 }} 
          />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>RainServe India</h1>
        </div>

        <button
          style={{
            padding: "10px 18px",
            borderRadius: "10px",
            background: darkMode
              ? "linear-gradient(45deg, #ff9966, #ff5e62)"
              : "linear-gradient(45deg, #36d1dc, #5b86e5)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            fontFamily: "Poppins, sans-serif",
          }}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "stretch" }}>
        {/* Project Details */}
        <div style={{ ...cardStyle, flex: "0 0 35%" }}>
          <h2>📋 Project Details</h2>
          <label>📍 Select District</label>
          <select
            style={commonInputStyle}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option style={optionStyle} value="">-- Choose --</option>
            {availableDistricts.map((d) => (
              <option style={optionStyle} key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <label>🏠 Roof Area (sq.m)</label>
          <input
            style={commonInputStyle}
            type="number"
            value={roofArea}
            onChange={(e) => setRoofArea(Number(e.target.value))}
          />

          <label>🏗️ Roof Type</label>
          <select
            style={commonInputStyle}
            value={roofType}
            onChange={(e) => setRoofType(e.target.value)}
          >
            <option style={optionStyle} value="Concrete">Concrete</option>
            <option style={optionStyle} value="Tile">Tile</option>
            <option style={optionStyle} value="Metal">Metal</option>
            <option style={optionStyle} value="Thatched">Thatched</option>
          </select>

          <label>👨‍👩‍👧‍👦 Number of Dwellers</label>
          <input
            style={commonInputStyle}
            type="number"
            value={dwellers}
            onChange={(e) => setDwellers(Number(e.target.value))}
          />

          <button style={buttonStyle} onClick={calculate}>
            🚀 Generate Assessment Report
          </button>
        </div>

        {/* Results */}
        <div style={{ ...cardStyle, flex: "1 1 65%", overflowY: "auto", maxHeight: "80vh" }}>
          <h2>📊 Assessment Results</h2>
          {report ? (
            <div dangerouslySetInnerHTML={{ __html: report }} />
          ) : (
            <p style={{ opacity: 0.7 }}>
              📋 Fill out the project details and click "Generate Assessment Report"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
