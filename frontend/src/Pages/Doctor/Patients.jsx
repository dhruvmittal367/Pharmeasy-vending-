// File: `frontend/src/Pages/Doctor/Patients.jsx` - ULTRA CLEAN VERSION (2 BUTTONS)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "../../css/Patients.css";
import DoctorSidebar from "./DoctorSidebar";
import { IoMdSearch } from "react-icons/io";
import PrescriptionHistoryModal from "./PrescriptionHistoryModal";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [disabledPatients, setDisabledPatients] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Prescription history modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState(null);

  // Action dropdown menu state
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    gender: "Male",
    weight: "",
    contactNo: "",
    location: "",
    symptoms: "",
    notes: "",
    visitDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-menu-wrapper')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/prescriptions/patients");
      const patients = response.data || [];
      setPatients(patients);
      setFilteredPatients(patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.trim().toLowerCase();
    setSearchTerm(value);

    if (!value) {
      setFilteredPatients(patients);
      return;
    }

    const isNumber = /^\d+$/.test(value);

    const filtered = patients.filter((p) => {
      if (isNumber && value.length <= 5) {
        return p.id?.toString() === value;
      }
      if (isNumber && value.length > 5) {
        return p.contactNo?.includes(value);
      }
      return (
        p.patientName?.toLowerCase().includes(value) ||
        p.location?.toLowerCase().includes(value)
      );
    });

    setFilteredPatients(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    localStorage.setItem('selectedPatient', JSON.stringify({
      name: formData.patientName,
      age: parseInt(formData.age || "0"),
      gender: formData.gender,
      weight: parseFloat(formData.weight || "0"),
      contactNo: formData.contactNo,
      location: formData.location,
      symptoms: formData.symptoms,
      notes: formData.notes,
      date: formData.visitDate,
    }));

    setFormData({
      patientName: "",
      age: "",
      gender: "Male",
      weight: "",
      contactNo: "",
      location: "",
      symptoms: "",
      notes: "",
      visitDate: new Date().toISOString().split("T")[0],
    });
    setShowModal(false);
    navigate('/doctor/medicine');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        patient: {
          name: formData.patientName,
          age: parseInt(formData.age),
          gender: formData.gender,
          weight: parseFloat(formData.weight),
          contactNo: formData.contactNo,
          location: formData.location,
          symptoms: formData.symptoms,
          notes: formData.notes,
          date: formData.visitDate,
        }
      };

      let response;
      try {
        response = await api.patch(`/api/prescriptions/${editingPatient.id}`, updateData);
      } catch (patchError) {
        response = await api.put(`/api/prescriptions/${editingPatient.id}`, updateData);
      }

      alert("Patient updated successfully!");
      setFormData({
        patientName: "",
        age: "",
        gender: "Male",
        weight: "",
        contactNo: "",
        location: "",
        symptoms: "",
        notes: "",
        visitDate: new Date().toISOString().split("T")[0],
      });
      setShowEditModal(false);
      setEditingPatient(null);
      fetchPatients();
    } catch (err) {
      console.error("Update failed:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to update patient";
      alert(`Failed to update patient: ${errorMessage}`);
    }
  };

  const handleAddPrescription = (patient) => {
    localStorage.setItem('selectedPatient', JSON.stringify({
      id: patient.id,
      name: patient.patientName,
      age: patient.age,
      gender: patient.gender,
      weight: patient.weight,
      contactNo: patient.contactNo,
      location: patient.location,
      symptoms: patient.symptoms,
      notes: patient.notes,
      date: new Date().toISOString().split("T")[0]
    }));
    navigate('/doctor/medicine');
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setFormData({
      patientName: patient.patientName || "",
      age: patient.age?.toString() || "",
      gender: patient.gender || "Male",
      weight: patient.weight?.toString() || "",
      contactNo: patient.contactNo || "",
      location: patient.location || "",
      symptoms: patient.symptoms || "",
      notes: patient.notes || "",
      visitDate: patient.visitDate ? patient.visitDate.split("T")[0] : new Date().toISOString().split("T")[0],
    });
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const handleTogglePatient = (patient) => {
    setDisabledPatients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(patient.id)) {
        newSet.delete(patient.id);
      } else {
        newSet.add(patient.id);
      }
      return newSet;
    });
    setActiveDropdown(null);
  };

  const handleDeletePatient = async (patient) => {
    if (window.confirm(`Are you sure you want to delete ${patient.patientName}?`)) {
      try {
        await api.delete(`/api/prescriptions/${patient.id}`);
        alert("Patient deleted successfully!");
        fetchPatients();
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete patient. Please try again.");
      }
    }
    setActiveDropdown(null);
  };

  const handleViewHistory = (patient) => {
    setSelectedPatientForHistory(patient);
    setShowHistoryModal(true);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDropdown = (patientId, e) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === patientId ? null : patientId);
  };

  if (loading) {
    return (
      <div className="doctor-container">
        <DoctorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="patients-page">
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
          <div className="loading">Loading patients...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-container">
      <DoctorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="patients-page container">
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

        <header className="page-header">
          <div className="header-left">
            <h1>👥 Patients</h1>
            <p className="total-count">Total: <span className="count-pill">{patients.length}</span></p>
          </div>

          <div className="header-actions">
            <div className="search-box">
              <IoMdSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <button className="clear-btn" onClick={() => { setSearchTerm(""); setFilteredPatients(patients); }}>
                  ✕
                </button>
              )}
            </div>

            <button className="create-patient-btn" onClick={() => setShowModal(true)}>
              ➕ New Patient
            </button>
          </div>
        </header>

        {searchTerm && <p className="search-results">Found {filteredPatients.length} result(s)</p>}

        {filteredPatients.length === 0 ? (
          <div className="no-data">No patients found</div>
        ) : (
          <div className="patients-grid">
            {filteredPatients.map((patient) => (
              <article className="patient-card" key={patient.id}>
                {/* Action Dropdown Menu (Top-Right) */}
                <div className="card-header-actions">
                  <div className="action-menu-wrapper">
                    <button
                      className="action-menu-btn"
                      onClick={(e) => toggleDropdown(patient.id, e)}
                    >
                      ⋮ Actions
                    </button>

                    {activeDropdown === patient.id && (
                      <div className="action-dropdown">
                        <button
                          className="dropdown-edit"
                          onClick={() => handleEditPatient(patient)}
                          disabled={disabledPatients.has(patient.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="dropdown-toggle"
                          onClick={() => handleTogglePatient(patient)}
                        >
                          {disabledPatients.has(patient.id) ? ' Enable' : ' Disable'}
                        </button>
                        <button
                          className="dropdown-delete"
                          onClick={() => handleDeletePatient(patient)}
                          disabled={disabledPatients.has(patient.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-top">
                  <div className="avatar" aria-hidden>
                    {getInitials(patient.patientName)}
                  </div>

                  <div className="patient-meta">
                    <h3 className="patient-name">{patient.patientName}</h3>
                    <div className="meta-row">
                      <span className="patient-id">#{patient.id}</span>
                      <span className={`gender-badge ${patient.gender?.toLowerCase()}`}>{patient.gender}</span>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="info-grid">
                    <div className="info-item">
                      <p className="label">Age</p>
                      <p className="value">{patient.age ?? "N/A"} yrs</p>
                    </div>
                    <div className="info-item">
                      <p className="label">Weight</p>
                      <p className="value">{patient.weight ?? "N/A"} kg</p>
                    </div>
                    <div className="info-item">
                      <p className="label">Contact</p>
                      <p className="value">{patient.contactNo ?? "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <p className="label">Location</p>
                      <p className="value">{patient.location ?? "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <p className="label">Last Visit</p>
                      <p className="value">{formatDate(patient.visitDate)}</p>
                    </div>
                  </div>

                  {patient.symptoms && (
                    <div className="symptoms">
                      <p className="label">Symptoms</p>
                      <p className="symptoms-text" title={patient.symptoms}>{patient.symptoms}</p>
                    </div>
                  )}

                  {patient.notes && (
                    <div className="symptoms">
                      <p className="label">Notes</p>
                      <p className="symptoms-text" title={patient.notes}>{patient.notes}</p>
                    </div>
                  )}
                </div>

                {/* ✅ ULTRA CLEAN: ONLY 2 BUTTONS */}
                <div className="card-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAddPrescription(patient)}
                    disabled={disabledPatients.has(patient.id)}
                  >
                    ➕ Add Prescription
                  </button>

                  <button
                    className="btn btn-history"
                    onClick={() => handleViewHistory(patient)}
                    disabled={disabledPatients.has(patient.id)}
                  >
                    View Prescriptions
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Modals remain same */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>➕ Create New Patient</h2>
                <button className="close-modal" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="patient-form">
                <div className="form-grid">
                  <label>
                    Patient Name *
                    <input name="patientName" value={formData.patientName} onChange={handleInputChange} required />
                  </label>

                  <label>
                    Age *
                    <input name="age" type="number" value={formData.age} onChange={handleInputChange} required min="1" max="120" />
                  </label>

                  <label>
                    Gender *
                    <select name="gender" value={formData.gender} onChange={handleInputChange}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </label>

                  <label>
                    Weight (kg)
                    <input name="weight" type="number" step="0.1" value={formData.weight} onChange={handleInputChange} />
                  </label>

                  <label>
                    Contact Number *
                    <input name="contactNo" value={formData.contactNo} onChange={handleInputChange} required pattern="[0-9]{10}" />
                  </label>

                  <label>
                    Location
                    <input name="location" value={formData.location} onChange={handleInputChange} placeholder="City, State" />
                  </label>

                  <label>
                    Visit Date *
                    <input name="visitDate" type="date" value={formData.visitDate} onChange={handleInputChange} required />
                  </label>
                </div>

                <label className="full-width">
                  Symptoms
                  <textarea name="symptoms" value={formData.symptoms} onChange={handleInputChange} rows="3" placeholder="Patient's symptoms..." />
                </label>

                <label className="full-width">
                  Additional Notes
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3" placeholder="Any additional notes..." />
                </label>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="submit-btn">Create Patient</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>✏️ Edit Patient</h2>
                <button className="close-modal" onClick={() => setShowEditModal(false)}>✕</button>
              </div>

              <form onSubmit={handleEditSubmit} className="patient-form">
                <div className="form-grid">
                  <label>
                    Patient Name *
                    <input name="patientName" value={formData.patientName} onChange={handleInputChange} required />
                  </label>

                  <label>
                    Age *
                    <input name="age" type="number" value={formData.age} onChange={handleInputChange} required min="1" max="120" />
                  </label>

                  <label>
                    Gender *
                    <select name="gender" value={formData.gender} onChange={handleInputChange}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </label>

                  <label>
                    Weight (kg)
                    <input name="weight" type="number" step="0.1" value={formData.weight} onChange={handleInputChange} />
                  </label>

                  <label>
                    Contact Number *
                    <input name="contactNo" value={formData.contactNo} onChange={handleInputChange} required pattern="[0-9]{10}" />
                  </label>

                  <label>
                    Location
                    <input name="location" value={formData.location} onChange={handleInputChange} placeholder="City, State" />
                  </label>

                  <label>
                    Visit Date *
                    <input name="visitDate" type="date" value={formData.visitDate} onChange={handleInputChange} required />
                  </label>
                </div>

                <label className="full-width">
                  Symptoms
                  <textarea name="symptoms" value={formData.symptoms} onChange={handleInputChange} rows="3" placeholder="Patient's symptoms..." />
                </label>

                <label className="full-width">
                  Additional Notes
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3" placeholder="Any additional notes..." />
                </label>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="submit-btn">Update Patient</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Prescription History Modal */}
        {showHistoryModal && selectedPatientForHistory && (
          <PrescriptionHistoryModal
            patientId={selectedPatientForHistory.id}
            patientName={selectedPatientForHistory.patientName}
            onClose={() => {
              setShowHistoryModal(false);
              setSelectedPatientForHistory(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Patients;