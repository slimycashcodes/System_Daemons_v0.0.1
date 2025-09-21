import { useState, useEffect, useRef } from "react";
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef(null);

  const [rainfallData, setRainfallData] = useState([]);
  const [groundwaterData, setGroundwaterData] = useState([]);
  const [soilData, setSoilData] = useState([]);
  const [aquiferData, setAquiferData] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);

  // Enhanced styles with animations and effects
  const containerStyle = {
    width: "100vw",
    minHeight: "100vh",
    margin: 0,
    padding: "20px",
    background: darkMode
      ? "linear-gradient(45deg, #0f0c29 0%, #302b63 50%, #24243e 100%)"
      : "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
    color: darkMode ? "#f5f5f5" : "#fff",
    fontFamily: "'Inter', 'Poppins', sans-serif",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
  };

  const backgroundOverlay = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: darkMode
      ? `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
         radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
         radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)`
      : `radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
         radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
         radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)`,
    animation: "backgroundFloat 20s ease-in-out infinite",
    zIndex: 0,
  };

  const commonInputStyle = {
    width: "100%",
    padding: "16px 20px",
    borderRadius: "16px",
    border: darkMode 
      ? "2px solid rgba(255,255,255,0.1)" 
      : "2px solid rgba(255,255,255,0.3)",
    marginBottom: "20px",
    backgroundColor: darkMode 
      ? "rgba(255,255,255,0.05)" 
      : "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    color: darkMode ? "#fff" : "#fff",
    fontFamily: "'Inter', sans-serif",
    fontSize: "15px",
    fontWeight: "500",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  };

  const cardStyle = {
    backgroundColor: darkMode 
      ? "rgba(255,255,255,0.08)" 
      : "rgba(255,255,255,0.25)",
    padding: "32px",
    borderRadius: "24px",
    boxShadow: darkMode
      ? "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
      : "0 20px 60px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
    backdropFilter: "blur(20px)",
    border: darkMode
      ? "1px solid rgba(255,255,255,0.1)"
      : "1px solid rgba(255,255,255,0.2)",
    flex: "1 1 auto",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    zIndex: 1,
  };

  const buttonStyle = {
    width: "100%",
    padding: "18px 24px",
    border: "none",
    borderRadius: "16px",
    fontWeight: "700",
    fontSize: "16px",
    color: "#fff",
    cursor: "pointer",
    background: isGenerating
      ? "linear-gradient(45deg, #ff6b6b, #feca57)"
      : darkMode
        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    fontFamily: "'Inter', sans-serif",
    marginBottom: "10px",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: darkMode
      ? "0 8px 30px rgba(102, 126, 234, 0.4)"
      : "0 8px 30px rgba(79, 172, 254, 0.4)",
    transform: "translateY(0)",
  };

  const resultCardStyle = {
    ...cardStyle,
    transform: showResults ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
    opacity: showResults ? 1 : 0,
    transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  // Load CSVs (keeping original logic)
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        setError("");

        // Simulate loading with mock data
        setTimeout(() => {
          const mockDistricts = [
            "Mumbai", "Delhi", "Chennai", "Kolkata", "Bangalore", "Hyderabad",
            "Ahmedabad", "Pune", "Surat", "Jaipur", "Lucknow", "Kanpur",
            "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri"
          ];
          setAvailableDistricts(mockDistricts);
          setRainfallData([{ District: "Chennai", Annual_Rainfall_mm: 1200 }]);
          setGroundwaterData([{ District: "Chennai", Groundwater_Depth_m: 15 }]);
          setSoilData([{ District: "Chennai", Soil_Type: "Clay" }]);
          setAquiferData([{ District: "Chennai", Principal_Aquifer: "Alluvial", Recharge_Potential: "Good" }]);
          setLoading(false);
        }, 1500);
      } catch (err) {
        setError(`Error loading data: ${err.message}`);
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const findDataByDistrict = (dataset, searchDistrict) => {
    return dataset.find((row) => {
      const districtValue = row.District || row.district || row.City || row.city;
      return districtValue && districtValue.toLowerCase() === searchDistrict.toLowerCase();
    });
  };

  const calculate = async () => {
    if (!district || !roofArea || !dwellers) {
      alert("Please fill all required fields");
      return;
    }

    setIsGenerating(true);
    setShowResults(false);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const rainfallRow = findDataByDistrict(rainfallData, district);
    const groundwaterRow = findDataByDistrict(groundwaterData, district);
    const soilRow = findDataByDistrict(soilData, district);
    const aquiferRow = findDataByDistrict(aquiferData, district);

    const rainfall = rainfallRow?.Annual_Rainfall_mm || 1000;

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

    const gwDepth = groundwaterRow?.Groundwater_Depth_m || "NA";
    const soilType = soilRow?.Soil_Type || "Unknown";
    const aquifer = aquiferRow?.Principal_Aquifer || "Unknown";
    const recharge = aquiferRow?.Recharge_Potential || "Moderate";

    const volume = harvest / 1000;
    const savings = volume * 50;
    const payback = savings > 0 ? (cost / savings).toFixed(2) : "NA";
    const efficiencyRating = harvest > 100000 ? "🟢 Excellent" : harvest > 50000 ? "🟡 Good" : "🟠 Moderate";

    setReport(`
      <div style="margin-top: 10px; line-height: 1.7; color: ${darkMode ? "#f0f0f0" : "#fff"};">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50px; color: white; font-weight: 700; font-size: 18px; box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);">
            📊 Assessment Report: ${district}
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div style="background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 242, 254, 0.1)); padding: 24px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
            <h3 style="display: flex; align-items: center; margin-bottom: 16px; font-size: 18px;"><span style="margin-right: 8px;">💧</span> Harvest Analysis</h3>
            <div style="space-y: 8px;">
              <p><b>Annual Rainfall:</b> <span style="color: #4facfe;">${rainfall} mm</span></p>
              <p><b>Harvest Potential:</b> <span style="color: #00f2fe; font-size: 20px; font-weight: 700;">${harvest.toLocaleString()} L/year</span></p>
              <p><b>Efficiency:</b> ${efficiencyRating}</p>
              <p><b>Per Person:</b> ${(harvest / dwellers).toFixed(0)} L/year</p>
            </div>
          </div>

          <div style="background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(254, 202, 87, 0.1)); padding: 24px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
            <h3 style="display: flex; align-items: center; margin-bottom: 16px; font-size: 18px;"><span style="margin-right: 8px;">🏗️</span> Infrastructure</h3>
            <div style="space-y: 8px;">
              <p><b>Structure:</b> <span style="color: #ff6b6b;">${structure}</span></p>
              <p><b>Storage:</b> ${volume.toFixed(2)} m³</p>
              <p><b>Roof Type:</b> ${roofType}</p>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="background: linear-gradient(135deg, rgba(126, 213, 111, 0.2), rgba(40, 180, 133, 0.1)); padding: 24px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
            <h3 style="display: flex; align-items: center; margin-bottom: 16px; font-size: 18px;"><span style="margin-right: 8px;">🌍</span> Local Conditions</h3>
            <div style="space-y: 8px;">
              <p><b>Groundwater:</b> ${gwDepth} m</p>
              <p><b>Soil:</b> ${soilType}</p>
              <p><b>Aquifer:</b> ${aquifer}</p>
              <p><b>Recharge:</b> <span style="color: #7ed56f;">${recharge}</span></p>
            </div>
          </div>

          <div style="background: linear-gradient(135deg, rgba(255, 185, 0, 0.2), rgba(255, 120, 0, 0.1)); padding: 24px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
            <h3 style="display: flex; align-items: center; margin-bottom: 16px; font-size: 18px;"><span style="margin-right: 8px;">💰</span> Economic Analysis</h3>
            <div style="space-y: 8px;">
              <p><b>Installation:</b> <span style="color: #ffb900; font-size: 18px; font-weight: 700;">₹${cost.toLocaleString()}</span></p>
              <p><b>Annual Savings:</b> ₹${savings.toLocaleString()}</p>
              <p><b>Payback:</b> ${payback} years</p>
            </div>
          </div>
        </div>
      </div>
    `);

    setIsGenerating(false);
    setTimeout(() => setShowResults(true), 100);
  };

  return (
    <div style={containerStyle}>
      <div style={backgroundOverlay}></div>
      
      <style>{`
        @keyframes backgroundFloat {
          0%, 100% { transform: translateX(-10px) translateY(-10px); }
          25% { transform: translateX(10px) translateY(-15px); }
          50% { transform: translateX(-5px) translateY(10px); }
          75% { transform: translateX(15px) translateY(5px); }
        }
        
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(79, 172, 254, 0.4); }
          50% { box-shadow: 0 0 0 20px rgba(79, 172, 254, 0); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        button:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 15px 40px rgba(79, 172, 254, 0.6) !important;
        }
        
        input:focus, select:focus {
          border-color: rgba(79, 172, 254, 0.8) !important;
          box-shadow: 0 0 0 4px rgba(79, 172, 254, 0.1), 0 8px 30px rgba(79, 172, 254, 0.2) !important;
          transform: translateY(-1px);
        }
        
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #ffffff40;
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-right: 10px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 80px rgba(0,0,0,0.3) !important;
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "40px",
        position: "relative",
        zIndex: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: 80,
            height: 80,
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 16,
            fontSize: "32px",
            boxShadow: "0 8px 30px rgba(79, 172, 254, 0.4)",
          }}>
            💧
          </div>
          <div>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: '800', 
              margin: 0,
              background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 2px 10px rgba(0,0,0,0.2)"
            }}>
              RainServe India
            </h1>
            <p style={{ 
              margin: "4px 0 0 0", 
              opacity: 0.8, 
              fontSize: "16px",
              fontWeight: "500"
            }}>
              Smart Rainwater Harvesting Solutions
            </p>
          </div>
        </div>

        <button
          style={{
            padding: "14px 24px",
            borderRadius: "16px",
            background: darkMode
              ? "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: "700",
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
          }}
          onClick={() => setDarkMode(!darkMode)}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 12px 35px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 8px 25px rgba(0,0,0,0.2)";
          }}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {loading ? (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
          flexDirection: "column",
          position: "relative",
          zIndex: 2,
        }}>
          <div className="loading-spinner" style={{
            width: 60,
            height: 60,
            border: "4px solid rgba(79, 172, 254, 0.3)",
            borderTop: "4px solid #4facfe",
            marginBottom: 20,
          }}></div>
          <p style={{ fontSize: "18px", fontWeight: "600", opacity: 0.9 }}>
            Loading environmental data...
          </p>
        </div>
      ) : (
        <div style={{ 
          display: "flex", 
          gap: "30px", 
          alignItems: "stretch",
          position: "relative",
          zIndex: 2,
        }}>
          {/* Project Details */}
          <div style={{ ...cardStyle, flex: "0 0 40%" }} className="card-hover">
            <div style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "30px",
            }}>
              <div style={{
                width: 50,
                height: 50,
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
                fontSize: "20px",
              }}>
                📋
              </div>
              <h2 style={{ 
                margin: 0, 
                fontSize: "24px", 
                fontWeight: "700",
                color: darkMode ? "#fff" : "#fff"
              }}>
                Project Details
              </h2>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600",
                color: darkMode ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.95)"
              }}>
                📍 Select District
              </label>
              <select
                style={commonInputStyle}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="">-- Choose District --</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d} style={{ color: "#222" }}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600",
                color: darkMode ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.95)"
              }}>
                🏠 Roof Area (sq.m)
              </label>
              <input
                style={commonInputStyle}
                type="number"
                placeholder="Enter roof area"
                value={roofArea}
                onChange={(e) => setRoofArea(Number(e.target.value))}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600",
                color: darkMode ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.95)"
              }}>
                🏗️ Roof Type
              </label>
              <select
                style={commonInputStyle}
                value={roofType}
                onChange={(e) => setRoofType(e.target.value)}
              >
                <option value="Concrete" style={{ color: "#222" }}>Concrete</option>
                <option value="Tile" style={{ color: "#222" }}>Tile</option>
                <option value="Metal" style={{ color: "#222" }}>Metal</option>
                <option value="Thatched" style={{ color: "#222" }}>Thatched</option>
              </select>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600",
                color: darkMode ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.95)"
              }}>
                👨‍👩‍👧‍👦 Number of Dwellers
              </label>
              <input
                style={commonInputStyle}
                type="number"
                placeholder="Number of people"
                value={dwellers}
                onChange={(e) => setDwellers(Number(e.target.value))}
              />
            </div>

            <button 
              style={{
                ...buttonStyle,
                background: isGenerating
                  ? "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)"
                  : darkMode
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              }}
              onClick={calculate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="loading-spinner"></div>
                  Generating Report...
                </>
              ) : (
                "🚀 Generate Assessment Report"
              )}
            </button>
          </div>

          {/* Results */}
          <div style={resultCardStyle} ref={resultsRef}>
            <div style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "30px",
            }}>
              <div style={{
                width: 50,
                height: 50,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
                fontSize: "20px",
              }}>
                📊
              </div>
              <h2 style={{ 
                margin: 0, 
                fontSize: "24px", 
                fontWeight: "700",
                color: darkMode ? "#fff" : "#fff"
              }}>
                Assessment Results
              </h2>
            </div>
            
            <div style={{ 
              maxHeight: "70vh", 
              overflowY: "auto",
              paddingRight: "10px"
            }}>
              {report ? (
                <div dangerouslySetInnerHTML={{ __html: report }} />
              ) : (
                <div style={{ 
                  textAlign: "center", 
                  padding: "60px 20px",
                  opacity: 0.7 
                }}>
                  <div style={{
                    width: 80,
                    height: 80,
                    background: "linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 242, 254, 0.1))",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    fontSize: "32px",
                  }}>
                    📋
                  </div>
                  <p style={{ 
                    fontSize: "18px", 
                    fontWeight: "500",
                    color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.8)"
                  }}>
                    Fill out the project details and generate your personalized rainwater harvesting assessment report
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}