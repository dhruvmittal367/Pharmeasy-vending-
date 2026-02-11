import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "../../css/DoctorDashboard.css";
import DoctorSidebar from "./DoctorSidebar";

function DoctorDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingPrescriptions: 0,
    totalRevenue: 0
  });

  // Recent data
  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);

  // Doctor info
  const [doctorInfo, setDoctorInfo] = useState({
    name: "Dr. [Name]",
    specialization: "General Physician",
    experience: "10+ years"
  });

  useEffect(() => {
    fetchDashboardData();

    // Get doctor info from localStorage
    const doctor = JSON.parse(localStorage.getItem("user") || "{}");
    if (doctor.name) {
      setDoctorInfo({
        name: `Dr. ${doctor.name}`,
        specialization: doctor.specialization || "General Physician",
        experience: doctor.experience || "10+ years"
      });
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats (adjust API endpoints as per your backend)
      const [patientsRes, appointmentsRes, prescriptionsRes] = await Promise.all([
        api.get("/api/patients").catch(() => ({ data: { data: [] } })),
        api.get("/api/appointments").catch(() => ({ data: { data: [] } })),
        api.get("/api/prescriptions").catch(() => ({ data: { data: [] } }))
      ]);

      const patients = patientsRes.data.data || [];
      const appointments = appointmentsRes.data.data || [];
      const prescriptions = prescriptionsRes.data.data || [];

      // Calculate stats
      setStats({
        totalPatients: patients.length,
        todayAppointments: appointments.filter(apt => isToday(apt.date)).length,
        pendingPrescriptions: prescriptions.filter(p => p.status === "pending").length,
        totalRevenue: prescriptions.reduce((sum, p) => sum + (p.totalAmount || 0), 0)
      });

      // Recent data
      setRecentPatients(patients.slice(0, 5));
      setUpcomingAppointments(appointments.slice(0, 5));
      setRecentPrescriptions(prescriptions.slice(0, 5));

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date().toDateString();
    const date = new Date(dateString).toDateString();
    return today === date;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Quick Actions
  const quickActions = [
    {
      title: "Add Prescription",
      icon: "💊",
      color: "#4CAF50",
      action: () => navigate("/doctor/medicines")
    },
    {
      title: "View Patients",
      icon: "👥",
      color: "#2196F3",
      action: () => navigate("/doctor/patients")
    },
    {
      title: "Appointments",
      icon: "📅",
      color: "#FF9800",
      action: () => navigate("/doctor/appointments")
    },
    {
      title: "Reports",
      icon: "📊",
      color: "#9C27B0",
      action: () => navigate("/doctor/reports")
    }
  ];

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

        {/* Dashboard Header */}
        <div className="dashboard-header2">
          <div className="welcome-section">
            <h1>Welcome back, {doctorInfo.name}! 👋</h1>
            <p className="welcome-subtitle">Here's what's happening with your patients today</p>
          </div>
          <div className="header-info">
            <div className="date-display">
              <span className="date-icon">📅</span>
              <span>{new Date().toLocaleDateString("en-US", {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card stat-blue">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>{stats.totalPatients}</h3>
                  <p>Total Patients</p>
                </div>
                <div className="stat-trend">
                  <span className="trend-up">↑ 12%</span>
                </div>
              </div>

              <div className="stat-card stat-green">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <h3>{stats.todayAppointments}</h3>
                  <p>Today's Appointments</p>
                </div>
                <div className="stat-trend">
                  <span className="trend-up">↑ 8%</span>
                </div>
              </div>

              <div className="stat-card stat-orange">
                <div className="stat-icon">📝</div>
                <div className="stat-content">
                  <h3>{stats.pendingPrescriptions}</h3>
                  <p>Pending Prescriptions</p>
                </div>
                <div className="stat-trend">
                  <span className="trend-down">↓ 3%</span>
                </div>
              </div>

              <div className="stat-card stat-purple">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
                  <p>Total Revenue</p>
                </div>
                <div className="stat-trend">
                  <span className="trend-up">↑ 15%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
              <h2 className="section-title">⚡ Quick Actions</h2>
              <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className="quick-action-card"
                    onClick={action.action}
                    style={{ borderLeftColor: action.color }}
                  >
                    <div className="action-icon" style={{ background: action.color + '20' }}>
                      <span style={{ fontSize: '2rem' }}>{action.icon}</span>
                    </div>
                    <h3>{action.title}</h3>
                    <p>Click to proceed →</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-content-grid">
              {/* Upcoming Appointments */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>📅 Upcoming Appointments</h2>
                  <button
                    className="view-all-btn"
                    onClick={() => navigate("/doctor/appointments")}
                  >
                    View All →
                  </button>
                </div>
                <div className="card-content">
                  {upcomingAppointments.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-icon">📅</span>
                      <p>No upcoming appointments</p>
                    </div>
                  ) : (
                    <div className="appointments-list">
                      {upcomingAppointments.map((apt, index) => (
                        <div key={index} className="appointment-item">
                          <div className="apt-time">
                            <span className="time-badge">{apt.time || "10:00 AM"}</span>
                          </div>
                          <div className="apt-details">
                            <h4>{apt.patientName || "Patient Name"}</h4>
                            <p>{apt.reason || "General Checkup"}</p>
                          </div>
                          <div className="apt-status">
                            <span className="status-badge status-upcoming">Upcoming</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Patients */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>👥 Recent Patients</h2>
                  <button
                    className="view-all-btn"
                    onClick={() => navigate("/doctor/patients")}
                  >
                    View All →
                  </button>
                </div>
                <div className="card-content">
                  {recentPatients.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-icon">👥</span>
                      <p>No recent patients</p>
                    </div>
                  ) : (
                    <div className="patients-list">
                      {recentPatients.map((patient, index) => (
                        <div key={index} className="patient-item">
                          <div className="patient-avatar">
                            <span>{patient.name?.charAt(0) || "P"}</span>
                          </div>
                          <div className="patient-details">
                            <h4>{patient.name || "Patient Name"}</h4>
                            <p>{patient.age || "N/A"} years • {patient.gender || "N/A"}</p>
                          </div>
                          <div className="patient-action">
                            <button
                              className="btn-small"
                              onClick={() => {
                                localStorage.setItem("selectedPatient", JSON.stringify(patient));
                                navigate("/doctor/medicines");
                              }}
                            >
                              Add Rx
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Prescriptions */}
              <div className="dashboard-card dashboard-card-full">
                <div className="card-header">
                  <h2>💊 Recent Prescriptions</h2>
                  <button
                    className="view-all-btn"
                    onClick={() => navigate("/doctor/prescriptions")}
                  >
                    View All →
                  </button>
                </div>
                <div className="card-content">
                  {recentPrescriptions.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-icon">💊</span>
                      <p>No recent prescriptions</p>
                    </div>
                  ) : (
                    <div className="prescriptions-table-wrapper">
                      <table className="prescriptions-table">
                        <thead>
                          <tr>
                            <th>Patient Name</th>
                            <th>Date</th>
                            <th>Medicines</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentPrescriptions.map((prescription, index) => (
                            <tr key={index}>
                              <td>
                                <div className="table-patient">
                                  <strong>{prescription.patient?.name || "N/A"}</strong>
                                </div>
                              </td>
                              <td>{prescription.date ? new Date(prescription.date).toLocaleDateString() : "N/A"}</td>
                              <td>{prescription.medicines?.length || 0} items</td>
                              <td>₹{prescription.totalAmount || 0}</td>
                              <td>
                                <span className={`status-badge status-${prescription.status || "pending"}`}>
                                  {prescription.status || "Pending"}
                                </span>
                              </td>
                              <td>
                                <button className="btn-icon" title="View Details">👁️</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="activity-summary">
              <div className="activity-card">
                <h3>📊 This Week's Summary</h3>
                <div className="activity-stats">
                  <div className="activity-item">
                    <span className="activity-label">Patients Treated</span>
                    <span className="activity-value">42</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-label">Prescriptions Written</span>
                    <span className="activity-value">38</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-label">Appointments Completed</span>
                    <span className="activity-value">40</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-label">Average Rating</span>
                    <span className="activity-value">4.8 ⭐</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;