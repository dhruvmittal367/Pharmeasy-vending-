import { useEffect, useState } from "react";
import api from "../../api";
import "../../css/DoctorPrescriptions.css";
import DoctorSidebar from "./DoctorSidebar";

function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    api.get("/api/prescriptions")
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        const sortedData = data.sort((a, b) => b.id - a.id);
        setPrescriptions(sortedData);
        setFilteredPrescriptions(sortedData);
      })
      .catch(err => {
        console.error(err);
        setPrescriptions([]);
        setFilteredPrescriptions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Search filter function
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === "") {
      setFilteredPrescriptions(prescriptions);
    } else {
      const filtered = prescriptions.filter((p) =>
        p.patientName.toLowerCase().includes(value) ||
        p.id.toString().includes(value) ||
        p.symptoms?.toLowerCase().includes(value)
      );
      setFilteredPrescriptions(filtered);
    }
  };

  const downloadPDF = async (id) => {
    try {
      const response = await api.get(`/api/prescriptions/${id}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="doctor-container">
        <DoctorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <div className={`doctor-main ${sidebarOpen ? "main-shifted" : "main-full"}`}>
          {/* Toggle Button */}
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? (
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <div className="prescription-page">
            <h2>📄 Prescriptions</h2>
            <div className="loading">Loading prescriptions...</div>
          </div>
        </div>
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="doctor-container">
        <DoctorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <div className={`doctor-main ${sidebarOpen ? "main-shifted" : "main-full"}`}>
          {/* Toggle Button */}
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? (
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <div className="prescription-page">
            <h2>📄 Prescriptions</h2>
            <div className="no-data">No prescriptions found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-container">
      <DoctorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={`doctor-main ${sidebarOpen ? "main-shifted" : "main-full"}`}>
        {/* Toggle Button */}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {sidebarOpen ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <div className="prescription-page">
          <div className="page-header">
            <h2>📄 Prescriptions</h2>
            <p className="total-count"> (Total: {prescriptions.length} prescriptions)</p>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Search by patient name, ID, or symptoms..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => {
                  setSearchTerm("");
                  setFilteredPrescriptions(prescriptions);
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Results count */}
          {searchTerm && (
            <p className="search-results">
              Found {filteredPrescriptions.length} result(s) for "{searchTerm}"
            </p>
          )}

          {/* Prescriptions Grid */}
          {filteredPrescriptions.length === 0 ? (
            <div className="no-data">No prescriptions match your search</div>
          ) : (
            <div className="prescriptions-grid">
              {filteredPrescriptions.map((p) => (
                <div className="prescription-card" key={p.id}>
                  <div className="card-header">
                    <div className="patient-info">
                      <h3>{p.patientName}</h3>
                      <span className="patient-details">
                        {p.age} years • {p.gender}
                      </span>
                    </div>
                    <span className="prescription-id">#{p.id}</span>
                  </div>

                  <div className="card-body">
                    <div className="info-row">
                      <span className="label">📅 Visit Date:</span>
                      <span className="value">{p.visitDate}</span>
                    </div>

                    {p.symptoms && (
                      <div className="info-row">
                        <span className="label">🩺 Symptoms:</span>
                        <span className="value">{p.symptoms}</span>
                      </div>
                    )}

                    {p.items && p.items.length > 0 && (
                      <div className="medicines-section">
                        <span className="label">💊 Medicines:</span>
                        <ul className="medicines-list">
                          {p.items.map((item, index) => (
                            <li key={index}>
                              {item.medicine?.medicineName || 'N/A'}
                              <span className="medicine-qty"> × {item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="info-row total-amount">
                      <span className="label">💰 Total Amount:</span>
                      <span className="value amount">₹{p.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <button
                      className="download-btn"
                      onClick={() => downloadPDF(p.id)}
                    >
                      📄 Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorPrescriptions;