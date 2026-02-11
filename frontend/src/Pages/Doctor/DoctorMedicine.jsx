import { useEffect, useState, useRef } from "react";
import api from "../../api";
import "../../css/DoctorLayout.css";
import DoctorSidebar from "./DoctorSidebar";

function DoctorMedicine() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [reviewOpen, setReviewOpen] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Patient details collapse state
  const [patientDetailsOpen, setPatientDetailsOpen] = useState(true);

  // dose state: { [medicineId]: { morning: bool, afternoon: bool, evening: bool } }
  const [doses, setDoses] = useState({});

  // medicine details: { [medicineId]: { duration, instructions } }
  const [medDetails, setMedDetails] = useState({});

  // Test section - separate from individual medicines
  const [testRequired, setTestRequired] = useState(false);
  const [testName, setTestName] = useState("");

  // Horizontal resizer state for cart panel
  const [cartWidth, setCartWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const cartPanelRef = useRef(null);

  // Vertical resizer states for internal sections
  const [cartBodyHeight, setCartBodyHeight] = useState(300); // Default height
  const [testSectionHeight, setTestSectionHeight] = useState(120); // Default height - reduced to avoid blank space
  const [patientDetailsHeight, setPatientDetailsHeight] = useState(250); // Default height

  const [isResizingCartBody, setIsResizingCartBody] = useState(false);
  const [isResizingTest, setIsResizingTest] = useState(false);
  const [isResizingPatient, setIsResizingPatient] = useState(false);

  const [patient, setPatient] = useState({
    name: "",
    age: "",
    gender: "",
    symptoms: "",
    date: "",
    weight: "",
    contactNo: "",
    location: "",
    notes: "",
  });

  useEffect(() => {
    fetchMedicines();

    // Load patient data from localStorage if available
    const savedPatient = localStorage.getItem("selectedPatient");
    if (savedPatient) {
      setPatient(JSON.parse(savedPatient));
      setCartOpen(true);
      localStorage.removeItem("selectedPatient");
    }
  }, []);

  // Horizontal resizer for cart panel
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setCartWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  // Vertical resizer for cart body
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingCartBody) return;

      const cartPanel = cartPanelRef.current;
      if (!cartPanel) return;

      const rect = cartPanel.getBoundingClientRect();
      const newHeight = e.clientY - rect.top - 60; // 60px offset for header

      if (newHeight >= 100 && newHeight <= 600) {
        setCartBodyHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizingCartBody(false);
    };

    if (isResizingCartBody) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (!isResizingTest && !isResizingPatient) {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
  }, [isResizingCartBody, isResizingTest, isResizingPatient]);

  // Vertical resizer for test section
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingTest) return;

      const cartPanel = cartPanelRef.current;
      if (!cartPanel) return;

      const testSection = cartPanel.querySelector('.test-section');
      if (!testSection) return;

      const rect = testSection.getBoundingClientRect();
      const newHeight = e.clientY - rect.top;

      if (newHeight >= 80 && newHeight <= 400) {
        setTestSectionHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizingTest(false);
    };

    if (isResizingTest) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (!isResizingCartBody && !isResizingPatient) {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
  }, [isResizingTest, isResizingCartBody, isResizingPatient]);

  // Vertical resizer for patient details
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingPatient) return;

      const cartPanel = cartPanelRef.current;
      if (!cartPanel) return;

      const patientSection = cartPanel.querySelector('.patient-details-card');
      if (!patientSection) return;

      const rect = patientSection.getBoundingClientRect();
      const newHeight = e.clientY - rect.top;

      if (newHeight >= 80 && newHeight <= 600) {
        setPatientDetailsHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizingPatient(false);
    };

    if (isResizingPatient) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (!isResizingCartBody && !isResizingTest) {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
  }, [isResizingPatient, isResizingCartBody, isResizingTest]);

  const fetchMedicines = async () => {
    try {
      const res = await api.get("/api/medicines");
      setMedicines(res.data.data);
    } catch (err) {
      console.error("Error fetching medicines", err);
    } finally {
      setLoading(false);
    }
  };

  const getQty = (id) => {
    const item = cart.find((m) => m.id === id);
    return item ? item.qty : 0;
  };

  const increaseQty = (med) => {
    setCart((prev) => {
      const found = prev.find((m) => m.id === med.id);

      if (found) {
        return prev.map((m) => (m.id === med.id ? { ...m, qty: m.qty + 1 } : m));
      }

      setDoses((d) => ({
        ...d,
        [med.id]: { morning: true, afternoon: false, evening: true },
      }));

      setMedDetails((prev) => ({
        ...prev,
        [med.id]: { duration: 3, instructions: "" },
      }));

      return [...prev, { ...med, qty: 1 }];
    });

    setCartOpen(true);
  };

  const decreaseQty = (med) => {
    setCart((prev) => {
      const found = prev.find((m) => m.id === med.id);
      if (!found) return prev;

      if (found.qty === 1) {
        setDoses((d) => {
          const updated = { ...d };
          delete updated[med.id];
          return updated;
        });
        setMedDetails((prev) => {
          const updated = { ...prev };
          delete updated[med.id];
          return updated;
        });
        return prev.filter((m) => m.id !== med.id);
      }

      return prev.map((m) => (m.id === med.id ? { ...m, qty: m.qty - 1 } : m));
    });
  };

  const toggleDose = (medId, slot) => {
    setDoses((prev) => ({
      ...prev,
      [medId]: { ...prev[medId], [slot]: !prev[medId]?.[slot] },
    }));
  };

  const getDoseString = (medId) => {
    const d = doses[medId];
    if (!d) return "0-0-0";
    return `${d.morning ? 1 : 0}-${d.afternoon ? 1 : 0}-${d.evening ? 1 : 0}`;
  };

  const handleMedDetailChange = (medId, field, value) => {
    setMedDetails((prev) => ({
      ...prev,
      [medId]: { ...prev[medId], [field]: value },
    }));
  };

  const savePrescription = async () => {
    const payload = {
         patientId: patient.id || null,   //chnages
      patient,
      medicines: cart.map((item) => ({
        medicineId: item.id,
        quantity: item.qty,
        price: item.price,
        total: item.qty * item.price,
        dose: getDoseString(item.id),
        duration: medDetails[item.id]?.duration || 0,
        instructions: medDetails[item.id]?.instructions || "",
        testRequired: testRequired,
        testName: testRequired ? testName : "",
      })),
      totalAmount: getTotalAmount(),
    };

    try {
      await api.post("/api/prescriptions", payload);
      alert("Prescription saved successfully");
    } catch (err) {
      console.error(err);
    }

    // Reset
    setCart([]);
    setDoses({});
    setMedDetails({});
    setTestRequired(false);
    setTestName("");
    setReviewOpen(false);
    setCartOpen(false);
    setPatient({
      name: "",
      age: "",
      gender: "",
      symptoms: "",
      date: "",
      weight: "",
      contactNo: "",
      location: "",
      notes: "",
    });
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => {
      return sum + item.qty * item.price;
    }, 0);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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

        {/* 🛒 Cart Button */}
        <div className="cart-icon-wrapper" onClick={() => setCartOpen(true)}>
          <img
            src="https://assets.1mg.com/pwa-app/production/dweb/2.0.3/static/images/svgs/icons/cart.svg"
            alt="cart"
            width="22"
            height="22"
          />
          {cart.length > 0 && <div className="cart-badge">{cart.length}</div>}
        </div>

        <h2>💊 Available Medicines</h2>

        {loading ? (
          <p>Loading medicines...</p>
        ) : (
          <div className="medicine-grid">
            {medicines.map((med) => (
              <div className="medicine-card" key={med.id}>
                <img src="https://cdn-icons-png.flaticon.com/512/822/822092.png" alt={med.medicineName} />
                <h4 className="med-name">{med.medicineName}</h4>
                <p className="brand">{med.manufacturer}</p>
                <p className="category">{med.dosageForm}</p>
                <p className="expiry">
                  Expiry:{" "}
                  {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString("en-GB") : "N/A"}
                </p>
                <p className="desc">{med.description?.slice(0, 60)}...</p>

                <div className="card-footer">
                  <span className="price">₹{med.price}</span>
                  <span className={med.quantity > 0 ? "in-stock" : "out-stock"}>
                    {med.quantity > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                  <div className="qty-controller">
                    {getQty(med.id) === 0 ? (
                      <button className="add-btn" disabled={med.quantity <= 0} onClick={() => increaseQty(med)}>
                        ADD
                      </button>
                    ) : (
                      <div className="qty-box">
                        <button onClick={() => decreaseQty(med)}>🗑</button>
                        <span>{getQty(med.id)}</span>
                        <button onClick={() => increaseQty(med)}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============ CART PANEL ============ */}
      {cartOpen && (
        <div
          className="cart-panel"
          ref={cartPanelRef}
          style={{
            width: `${cartWidth}px`,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'fixed',
            right: 0,
            top: 0,
            background: 'white',
            boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
            zIndex: 1000
          }}
        >
          {/* Horizontal Resize Handle */}
          <div
            className="cart-resizer"
            onMouseDown={() => setIsResizing(true)}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '6px',
              cursor: 'ew-resize',
              backgroundColor: 'transparent',
              zIndex: 1000,
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 123, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <div style={{
              position: 'absolute',
              left: '2px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '2px',
              height: '40px',
              backgroundColor: '#ccc',
              borderRadius: '2px',
            }} />
          </div>

          {/* Cart Header - Fixed at top */}
          <div className="cart-header" style={{
            flexShrink: 0,
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'white'
          }}>
            <h3>📝 Prescription</h3>
            <span onClick={() => setCartOpen(false)} style={{ cursor: 'pointer', fontSize: '1.5rem' }}>✖</span>
          </div>

          {/* Scrollable Middle Section */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            {/* Medicines List with Vertical Resizer */}
            <div style={{ position: 'relative' }}>
              <div
                className="cart-body"
                style={{
                  minHeight: `${cartBodyHeight}px`,
                  maxHeight: `${cartBodyHeight}px`,
                  overflowY: 'auto',
                  position: 'relative'
                }}
              >
                {cart.length === 0 ? (
                  <p style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>No medicines added</p>
                ) : (
                  cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div className="cart-item-left">
                        <strong>{item.medicineName}</strong>
                        <p>Qty: {item.qty} × ₹{item.price}</p>

                        {/* Dose selector */}
                        <div className="dose-selector">
                          <button
                            className={`dose-btn ${doses[item.id]?.morning ? "dose-active" : ""}`}
                            onClick={() => toggleDose(item.id, "morning")}
                          >M</button>
                          <button
                            className={`dose-btn ${doses[item.id]?.afternoon ? "dose-active" : ""}`}
                            onClick={() => toggleDose(item.id, "afternoon")}
                          >A</button>
                          <button
                            className={`dose-btn ${doses[item.id]?.evening ? "dose-active" : ""}`}
                            onClick={() => toggleDose(item.id, "evening")}
                          >E</button>
                          <span className="dose-text">{getDoseString(item.id)}</span>
                        </div>

                        {/* Duration */}
                        <div className="med-detail-row">
                          <span className="med-detail-label">Duration</span>
                          <div className="duration-input-wrap">
                            <input
                              type="number"
                              min="1"
                              max="365"
                              className="duration-input"
                              value={medDetails[item.id]?.duration || ""}
                              onChange={(e) => handleMedDetailChange(item.id, "duration", Number(e.target.value))}
                            />
                            <span className="duration-unit">days</span>
                          </div>
                        </div>

                        {/* Instructions */}
                        <div className="med-detail-row">
                          <span className="med-detail-label">Instructions</span>
                          <input
                            type="text"
                            className="instructions-input"
                            placeholder="e.g. khali pet"
                            value={medDetails[item.id]?.instructions || ""}
                            onChange={(e) => handleMedDetailChange(item.id, "instructions", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="item-total">₹{item.qty * item.price}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Vertical Resize Handle for Cart Body */}
              {cart.length > 0 && (
                <div
                  onMouseDown={() => setIsResizingCartBody(true)}
                  style={{
                    position: 'relative',
                    height: '6px',
                    cursor: 'ns-resize',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{
                    width: '40px',
                    height: '2px',
                    backgroundColor: '#ccc',
                    borderRadius: '2px',
                  }} />
                </div>
              )}
            </div>

            {/* ======== TEST REQUIRED SECTION with Vertical Resizer ======== */}
            {cart.length > 0 && (
              <div style={{ position: 'relative' }}>
                <div
                  className="test-section"
                  style={{
                    minHeight: `${testSectionHeight}px`,
                    maxHeight: `${testSectionHeight}px`,
                    overflowY: 'auto',
                    position: 'relative'
                  }}
                >
                  <h4>🧪 Laboratory Test</h4>
                  <div className="test-toggle-row">
                    <span className="test-label">Test Required?</span>
                    <button
                      className={`test-toggle ${testRequired ? "test-toggle-yes" : "test-toggle-no"}`}
                      onClick={() => setTestRequired(!testRequired)}
                    >
                      {testRequired ? "Yes" : "No"}
                    </button>
                  </div>

                  {testRequired && (
                    <div className="test-name-row">
                      <span className="test-label">Test Name</span>
                      <input
                        type="text"
                        className="test-name-input"
                        placeholder="e.g. CBC, Blood Sugar, X-Ray"
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Vertical Resize Handle for Test Section */}
                <div
                  onMouseDown={() => setIsResizingTest(true)}
                  style={{
                    position: 'relative',
                    height: '6px',
                    cursor: 'ns-resize',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{
                    width: '40px',
                    height: '2px',
                    backgroundColor: '#ccc',
                    borderRadius: '2px',
                  }} />
                </div>
              </div>
            )}

            {/* ======== Patient Details with Vertical Resizer ======== */}
            {patient.name && (
              <div style={{ position: 'relative' }}>
                <div
                  className="patient-details-card"
                  style={{
                    minHeight: patientDetailsOpen ? `${patientDetailsHeight}px` : 'auto',
                    maxHeight: patientDetailsOpen ? `${patientDetailsHeight}px` : 'auto',
                    overflowY: patientDetailsOpen ? 'auto' : 'visible',
                    position: 'relative'
                  }}
                >
                  <h4
                    onClick={() => setPatientDetailsOpen(!patientDetailsOpen)}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>👤 Patient Details</span>
                    <span style={{ fontSize: '16px' }}>{patientDetailsOpen ? '▼' : '▶'}</span>
                  </h4>
                  {patientDetailsOpen && (
                    <>
                      <div className="patient-detail-row">
                        <span className="detail-label">Name</span>
                        <span className="detail-value">{patient.name}</span>
                      </div>
                      <div className="patient-detail-row">
                        <span className="detail-label">Age</span>
                        <span className="detail-value">{patient.age || "—"}</span>
                      </div>
                      <div className="patient-detail-row">
                        <span className="detail-label">Gender</span>
                        <span className="detail-value">{patient.gender || "—"}</span>
                      </div>
                      <div className="patient-detail-row">
                        <span className="detail-label">Weight</span>
                        <span className="detail-value">{patient.weight ? `${patient.weight} kg` : "—"}</span>
                      </div>
                      <div className="patient-detail-row">
                        <span className="detail-label">Contact</span>
                        <span className="detail-value">{patient.contactNo || "—"}</span>
                      </div>
                      <div className="patient-detail-row">
                        <span className="detail-label">Location</span>
                        <span className="detail-value">{patient.location || "—"}</span>
                      </div>
                      <div className="patient-detail-row">
                        <span className="detail-label">Date</span>
                        <span className="detail-value">{patient.date || "—"}</span>
                      </div>
                      {patient.symptoms && (
                        <div className="patient-detail-row">
                          <span className="detail-label">Symptoms</span>
                          <span className="detail-value">{patient.symptoms}</span>
                        </div>
                      )}
                      {patient.notes && (
                        <div className="patient-detail-row">
                          <span className="detail-label">Notes</span>
                          <span className="detail-value">{patient.notes}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Vertical Resize Handle for Patient Details */}
                {patientDetailsOpen && (
                  <div
                    onMouseDown={() => setIsResizingPatient(true)}
                    style={{
                      position: 'relative',
                      height: '6px',
                      cursor: 'ns-resize',
                      backgroundColor: 'transparent',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 100
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: '40px',
                      height: '2px',
                      backgroundColor: '#ccc',
                      borderRadius: '2px',
                    }} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Footer - Fixed at Bottom */}
          <div style={{
            flexShrink: 0,
            background: 'white',
            borderTop: '1px solid #e5e7eb',
            padding: '1rem 1.5rem',
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)'
          }}>
            {/* Total - Fixed at bottom, non-resizable */}
            {cart.length > 0 && (
              <div className="cart-total" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                fontSize: '1.125rem'
              }}>
                <strong style={{ color: '#374151' }}>Total:</strong>
                <span style={{ color: '#059669', fontWeight: 700, fontSize: '1.25rem' }}>₹{getTotalAmount()}</span>
              </div>
            )}

            <button className="save-btn" onClick={() => setReviewOpen(true)} style={{
              width: '100%',
              padding: '0.875rem',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(37, 99, 235, 0.3)'
            }}>
              Review Prescription
            </button>
          </div>
        </div>
      )}

      {/* ============ REVIEW MODAL ============ */}
      {reviewOpen && (
        <div className="review-overlay">
          <div className="review-modal">
            <div className="review-header">
              <h3>🧾 Review Prescription</h3>
              <span onClick={() => setReviewOpen(false)}>✖</span>
            </div>

            {/* Patient Info */}
            <div className="review-section">
              <h4>👤 Patient Details</h4>
              <p>
                <b>Name:</b> {patient.name}
              </p>
              <p>
                <b>Age:</b> {patient.age}
              </p>
              <p>
                <b>Gender:</b> {patient.gender}
              </p>
              <p>
                <b>Weight:</b> {patient.weight} kg
              </p>
              <p>
                <b>Contact:</b> {patient.contactNo}
              </p>
              <p>
                <b>Location:</b> {patient.location}
              </p>
              <p>
                <b>Date:</b> {patient.date}
              </p>
              <p>
                <b>Symptoms:</b> {patient.symptoms}
              </p>
              <p>
                <b>Notes:</b> {patient.notes}
              </p>
            </div>

            {/* Medicines Table */}
            <div className="review-section">
              <h4>💊 Medicines</h4>
              <table className="review-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dose</th>
                    <th>Days</th>
                    <th>Instructions</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td>{item.medicineName}</td>
                      <td>{getDoseString(item.id)}</td>
                      <td>{medDetails[item.id]?.duration || "—"}</td>
                      <td>{medDetails[item.id]?.instructions || "—"}</td>
                      <td>{item.qty}</td>
                      <td>₹{item.qty * item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Test Required Section */}
            {testRequired && (
              <div className="review-section">
                <h4>🧪 Laboratory Test</h4>
                <p>
                  <b>Test Required:</b> Yes
                </p>
                <p>
                  <b>Test Name:</b> {testName || "—"}
                </p>
              </div>
            )}

            {/* Total */}
            <div className="review-total">
              <b>Total Amount:</b> ₹{getTotalAmount()}
            </div>

            <button className="confirm-btn" onClick={savePrescription}>
              Confirm & Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorMedicine;