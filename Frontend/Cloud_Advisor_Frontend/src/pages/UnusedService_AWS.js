import React, { useState, useEffect } from "react";

const UnusedServices = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDates, setServiceDates] = useState([]);

  const API_URL = "http://127.0.0.1:5002/api/unused-services"; 
  ; // Ensure this matches Flask

  // Fetch services automatically when the component loads
  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        const uniqueServices = [...new Set(data.map((item) => item.service))];
        setServices(uniqueServices);
      })
      .catch((error) => console.error("❌ Error fetching services:", error));
  }, []);

  // Fetch dates for the selected service
  const handleServiceClick = (serviceName) => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        const filteredDates = data
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
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  textAlign: "center",
                  transition: "background 0.3s",
              
                }}
                onMouseOver={(e) => (e.target.style.background = "#218838")}
                onMouseOut={(e) => (e.target.style.background = "#28a745")}
              >
                {service}
              </button>
            ))
          ) : (
            <p>Loading services...</p>
          )}
        </div>
      ) : (
        <div>
          {/* Styled Selected Service Heading */}
          <h3 style={{ color: "#28a745", fontWeight: "bold",fontSize: "24px",marginBottom: "23px",marginTop: "1px" }}>
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

          {/* Back Button with Hover Effect */}
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

export default UnusedServices;
