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

  // Load CSVs from public/data folder
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        setError("");

        // List of CSV files to load from public/data folder
        const csvFiles = [
          { path: '/data/rainfall_by_district.csv', setter: setRainfallData, name: 'rainfall' },
          { path: '/data/groundwater_depth.csv', setter: setGroundwaterData, name: 'groundwater' },
          { path: '/data/soil_type.csv', setter: setSoilData, name: 'soil' },
          { path: '/data/aquifer_info.csv', setter: setAquiferData, name: 'aquifer' }
        ];

        const loadedData = {};
        let totalFilesLoaded = 0;

        // Load each CSV file
        for (const file of csvFiles) {
          try {
            console.log(`🔍 Attempting to load: ${file.path}`);
            const response = await fetch(file.path);
            
            if (!response.ok) {
              console.error(`❌ Failed to fetch ${file.path} - Status: ${response.status}`);
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            console.log(`✅ Successfully fetched ${file.path}`);
            const csvContent = await response.text();
            console.log(`📄 CSV content length for ${file.name}:`, csvContent.length);
            console.log(`📝 First 200 chars of ${file.name}:`, csvContent.substring(0, 200));
            
            Papa.parse(csvContent, {
              header: true,
              skipEmptyLines: true,
              dynamicTyping: false, // Keep as strings first for debugging
              delimitersToGuess: [',', '\t', '|', ';'],
              complete: (results) => {
                console.log(`🎯 Parsed ${file.name} - Rows: ${results.data.length}, Errors: ${results.errors.length}`);
                
                if (results.errors.length > 0) {
                  console.warn(`⚠️ Parse errors for ${file.name}:`, results.errors);
                }
                
                // Log column headers
                if (results.data.length > 0) {
                  console.log(`📊 Headers for ${file.name}:`, Object.keys(results.data[0]));
                }
                
                const cleanData = results.data
                  .filter(row => Object.values(row).some(val => val !== null && val !== "")) // Remove empty rows
                  .map(row => {
                    const cleanRow = {};
                    Object.keys(row).forEach(key => {
                      const cleanKey = key.trim();
                      cleanRow[cleanKey] = typeof row[key] === 'string' ? row[key].trim() : row[key];
                    });
                    return cleanRow;
                  });
                
                console.log(`🧹 Cleaned ${file.name} data:`, cleanData.slice(0, 3));
                file.setter(cleanData);
                loadedData[file.path] = cleanData;
                totalFilesLoaded++;
              },
              error: (error) => {
                console.error(`💥 Parse error for ${file.name}:`, error);
              }
            });
            
          } catch (fileError) {
            console.error(`❌ Could not load ${file.path}:`, fileError.message);
            file.setter([]);
            loadedData[file.path] = [];
          }
        }

        // Wait for parsing to complete
        setTimeout(() => {
          console.log(`📈 Total files loaded: ${totalFilesLoaded}`);
          console.log(`💾 All loaded data:`, loadedData);
          
          // Extract unique districts from all datasets
          const allDistricts = new Set();
          let totalRowsChecked = 0;
          
          Object.entries(loadedData).forEach(([path, dataset]) => {
            console.log(`🔍 Checking ${dataset.length} rows in ${path} for districts...`);
            
            dataset.forEach((row, index) => {
              totalRowsChecked++;
              // Check ALL possible column names for district
              const possibleDistrictFields = [
                'District', 'district', 'DISTRICT',
                'City', 'city', 'CITY', 
                'Location', 'location', 'LOCATION',
                'State', 'state', 'STATE',
                'Region', 'region', 'REGION',
                'Place', 'place', 'PLACE'
              ];
              
              let districtFound = false;
              possibleDistrictFields.forEach(field => {
                if (row[field] && typeof row[field] === 'string' && row[field].trim()) {
                  allDistricts.add(row[field].trim());
                  if (!districtFound) {
                    console.log(`✅ Found district "${row[field]}" in field "${field}" at row ${index + 1}`);
                    districtFound = true;
                  }
                }
              });
              
              // If first few rows, log all available fields
              if (index < 3) {
                console.log(`🔎 Row ${index + 1} fields:`, Object.keys(row));
                console.log(`📋 Row ${index + 1} sample data:`, row);
              }
            });
          });

          console.log(`🎯 Total rows checked: ${totalRowsChecked}`);
          console.log(`🏙️ Unique districts found: ${allDistricts.size}`);
          
          const districtsArray = Array.from(allDistricts).sort();
          console.log(`📍 Final districts list:`, districtsArray);
          
          setAvailableDistricts(districtsArray);
          setLoading(false);
          
          if (districtsArray.length === 0) {
            setError(`No districts found in CSV files. Please check your CSV structure and column names.`);
          }
        }, 1000); // Increased wait time

      } catch (err) {
        console.error(`💥 General error:`, err);
        setError(`Error loading data: ${err.message}`);
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const findDataByDistrict = (dataset, searchDistrict) => {
    return dataset.find(row => {
      const districtValue = row.District || row.district || row.City || row.city || 
                           row.Location || row.location || row.State || row.state;
      return districtValue && districtValue.toLowerCase() === searchDistrict.toLowerCase();
    });
  };

  const calculate = () => {
    if (!district || !roofArea || !dwellers) {
      alert("Please fill all required fields");
      return;
    }

    // Find data for the selected district
    const rainfallRow = findDataByDistrict(rainfallData, district);
    const groundwaterRow = findDataByDistrict(groundwaterData, district);
    const soilRow = findDataByDistrict(soilData, district);
    const aquiferRow = findDataByDistrict(aquiferData, district);

    console.log('Data found for', district, {
      rainfall: rainfallRow,
      groundwater: groundwaterRow,
      soil: soilRow,
      aquifer: aquiferRow
    });

    // Extract rainfall data (try different possible column names)
    const rainfall = rainfallRow ? 
      (rainfallRow.Annual_Rainfall_mm || rainfallRow['Annual Rainfall (mm)'] || 
       rainfallRow.Rainfall || rainfallRow.rainfall || rainfallRow['Avg Annual Rainfall'] || 1000) : 1000;

    // Runoff coefficients for different roof types
    const runoffCoeff = { 
      Concrete: 0.85, 
      Tile: 0.75, 
      Metal: 0.9, 
      Thatched: 0.5 
    };
    const rc = runoffCoeff[roofType] || 0.8;

    // Calculate harvest potential (in liters)
    const harvest = roofArea * rainfall * rc * 0.001; // Convert mm to meters, then to liters

    // Determine cost and structure type
    const cost = harvest < 50000 ? 15000 : harvest < 200000 ? 30000 : 50000;
    const structure = harvest < 50000 ? "Pit" : harvest < 200000 ? "Trench" : "Shaft";

    // Extract other data with multiple column name options
    const gwDepth = groundwaterRow ? 
      (groundwaterRow.Groundwater_Depth_m || groundwaterRow['Groundwater Depth (m)'] || 
       groundwaterRow['Depth to Water Table'] || groundwaterRow.depth || "NA") : "NA";
    
    const soilType = soilRow ? 
      (soilRow.Soil_Type || soilRow['Soil Type'] || soilRow['Dominant Soil'] || 
       soilRow.soil || soilRow.type || "Unknown") : "Unknown";
    
    const aquifer = aquiferRow ? 
      (aquiferRow.Principal_Aquifer || aquiferRow['Principal Aquifer'] || 
       aquiferRow.Aquifer || aquiferRow.aquifer || "Unknown") : "Unknown";
    
    const recharge = aquiferRow ? 
      (aquiferRow.Recharge_Potential || aquiferRow['Recharge Potential'] || 
       aquiferRow.Recharge || aquiferRow.recharge || "Moderate") : "Moderate";

    // Calculate additional metrics
    const volume = harvest / 1000; // Convert liters to cubic meters
    const savings = volume * 50; // Estimated savings per cubic meter
    const payback = savings > 0 ? (cost / savings).toFixed(2) : "NA";
    
    const efficiencyRating = harvest > 100000 ? "🟢 Excellent" : 
                           harvest > 50000 ? "🟡 Good" : "🟠 Moderate";

setReport(`
  <div style="margin-top: 10px; line-height: 1.6; background: ${darkMode ? '#222' : '#fff'}; padding: 20px; border-radius: 10px; max-width: 540px; box-sizing: border-box;">
    <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">📊 Assessment Report: ${district}</h2>
    
    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 16px; margin-bottom: 10px;">💧 Harvest Analysis</h3>
      <p><b>Annual Rainfall:</b> ${rainfall} mm</p>
      <p><b>Harvest Potential:</b> ${harvest.toLocaleString()} L/year</p>
      <p><b>Efficiency Rating:</b> ${efficiencyRating}</p>
      <p><b>Per Person Supply:</b> ${(harvest / dwellers).toFixed(0)} L/year (for ${dwellers} people)</p>
    </div>

    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 16px; margin-bottom: 10px;">🏗️ Infrastructure</h3>
      <p><b>Recommended Structure:</b> ${structure}</p>
      <p><b>Storage Volume:</b> ${volume.toFixed(2)} m³</p>
      <p><b>Roof Type:</b> ${roofType} (${(rc * 100)}% efficiency)</p>
    </div>

    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 16px; margin-bottom: 10px;">🌍 Local Conditions</h3>
      <p><b>Groundwater Depth:</b> ${gwDepth} m</p>
      <p><b>Soil Type:</b> ${soilType}</p>
      <p><b>Principal Aquifer:</b> ${aquifer}</p>
      <p><b>Recharge Potential:</b> ${recharge}</p>
    </div>

    <div style="background: ${darkMode ? '#253625' : '#e8f5e8'}; padding: 15px; border-radius: 8px;">
      <h3 style="font-size: 16px; margin-bottom: 10px;">💰 Economic Analysis</h3>
      <p><b>Installation Cost:</b> ₹${cost.toLocaleString()}</p>
      <p><b>Annual Savings:</b> ₹${savings.toLocaleString()}</p>
      <p><b>Payback Period:</b> ${payback} years</p>
    </div>
  </div>
`);
  };

  const containerStyle = {
    minHeight: "100vh",
    padding: "20px",
    backgroundColor: darkMode ? "#1a1a1a" : "#f5f5f5",
    color: darkMode ? "#fff" : "#333",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const cardStyle = {
    backgroundColor: darkMode ? "#2d2d2d" : "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: darkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: darkMode ? "1px solid #555" : "1px solid #ddd",
    marginBottom: "15px",
    backgroundColor: darkMode ? "#3a3a3a" : "#fff",
    color: darkMode ? "#fff" : "#333",
    fontSize: "14px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    fontSize: "14px",
  };

  const buttonStyle = {
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    backgroundColor: darkMode ? "#4a90e2" : "#007bff",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "14px",
    transition: "background-color 0.2s",
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h1>🌧️ RainHarvest Pro</h1>
          <p>Loading CSV data from public/data folder...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h1>🌧️ RainHarvest Pro</h1>
          <p style={{ color: "red" }}>{error}</p>
          <p>Please ensure CSV files are in the public/data/ folder:</p>
          <ul style={{ textAlign: "left", display: "inline-block" }}>
            <li>public/data/rainfall_by_district.csv</li>
            <li>public/data/groundwater_depth.csv</li>
            <li>public/data/soil_type.csv</li>
            <li>public/data/aquifer_info.csv</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div style={{
      maxWidth: 1100,  // Limit overall width for all content blocks
      margin: "0 auto",
      width: "100%",   // Flex to full width on small screens
    }}></div>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>🌧️ RainHarvest Pro</h1>
        <button style={buttonStyle} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "30px", 
        alignItems: "start" 
      }}>
        <div style={cardStyle}>
          <h2 style={{ marginBottom: "20px", fontSize: "20px" }}>📋 Project Details</h2>
          
          <label style={labelStyle}>📍 Select District/City ({availableDistricts.length} available)</label>
          <select style={inputStyle} value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">-- Choose Location --</option>
            {availableDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <label style={labelStyle}>🏠 Roof Area (sq.m)</label>
          <input 
            style={inputStyle} 
            type="number" 
            value={roofArea} 
            onChange={(e) => setRoofArea(Number(e.target.value))} 
            placeholder="Enter roof area in square meters"
          />

          <label style={labelStyle}>🏗️ Roof Type</label>
          <select style={inputStyle} value={roofType} onChange={(e) => setRoofType(e.target.value)}>
            <option value="Concrete">Concrete (85% efficiency)</option>
            <option value="Tile">Tile (75% efficiency)</option>
            <option value="Metal">Metal (90% efficiency)</option>
            <option value="Thatched">Thatched (50% efficiency)</option>
          </select>

          <label style={labelStyle}>👨‍👩‍👧‍👦 Number of Dwellers</label>
          <input 
            style={inputStyle} 
            type="number" 
            value={dwellers} 
            onChange={(e) => setDwellers(Number(e.target.value))} 
            min="1"
            placeholder="Number of people"
          />

          <button style={{...buttonStyle, width: "100%"}} onClick={calculate}>
            🚀 Generate Assessment Report
          </button>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginBottom: "20px", fontSize: "20px" }}>📊 Assessment Results</h2>
          {report ? (
            <div dangerouslySetInnerHTML={{ __html: report }} />
          ) : (
            <div style={{ textAlign: "center", padding: "40px", color: darkMode ? "#aaa" : "#666" }}>
              <p>📋 Fill out the project details and click "Generate Assessment Report" to see your rainwater harvesting analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}