import React, { useState, useEffect } from "react";

const UnusedService_GCP = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDates, setServiceDates] = useState([]);

  const API_URL = "http://127.0.0.1:5002/api/gcp-unused-services";

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        const servicesData = data.unused_services; // ✅ correct
        const uniqueServices = [...new Set(servicesData.map((item) => item.service))];
        setServices(uniqueServices);
      })
      .catch((error) => console.error("❌ Error fetching GCP services:", error));
  }, []);
  

  const handleServiceClick = (serviceName) => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        const servicesData = data.unused_services; // ✅ correct
        const filteredDates = servicesData
          .filter((item) => item.service === serviceName)
          .map((item) => item.date);
        setSelectedService(serviceName);
        setServiceDates([...new Set(filteredDates)]);
      })
      
      .catch((error) => console.error("❌ Error fetching dates:", error));
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {!selectedService ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px",
            justifyContent: "center",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          {services.length > 0 ? (
            services.map((service, index) => (
              <button
                key={index}
                onClick={() => handleServiceClick(service)}
                style={{
                  padding: "12px",
                  fontSize: "14px",
                  cursor: "pointer",
                  background: "#DB4437",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  textAlign: "center",
                  transition: "background 0.3s",
                }}
                onMouseOver={(e) => (e.target.style.background = "#C23321")}
                onMouseOut={(e) => (e.target.style.background = "#DB4437")}
              >
                {service}
              </button>
            ))
          ) : (
            <p>Loading GCP services...</p>
          )}
        </div>
      ) : (
        <div>
          <h3 style={{ color: "#DB4437", fontWeight: "bold", fontSize: "24px", marginBottom: "23px", marginTop: "1px" }}>
            "{selectedService}"
          </h3>

          {serviceDates.length > 0 ? (
            <table
              style={{
                margin: "0 auto",
                borderCollapse: "collapse",
                width: "50%",
              }}
              border="1"
            >
              <thead>
                <tr style={{ background: "#f2f2f2" }}>
                  <th style={{ padding: "10px" }}>Dates</th>
                </tr>
              </thead>
              <tbody>
                {serviceDates.map((date, index) => (
                  <tr key={index}>
                    <td style={{ padding: "10px" }}>{date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data available</p>
          )}

          <button
            onClick={() => setSelectedService(null)}
            style={{
              padding: "8px 12px",
              fontSize: "14px",
              cursor: "pointer",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              marginTop: "20px",
              transition: "background 0.3s",
            }}
            onMouseOver={(e) => (e.target.style.background = "#c82333")}
            onMouseOut={(e) => (e.target.style.background = "#dc3545")}
          >
            Back to Services
          </button>
        </div>
      )}
    </div>
  );
};

export default UnusedService_GCP;
