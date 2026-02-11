import React, { useState } from "react";
import { Plus, Package, AlertTriangle, Clock, Search, Filter, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../css/Medicine.css";
import { useEffect } from "react";
import api from "../api";


export default function MedicineDashboard() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    medicineName: "",
    genericName: "",
    manufacturer: "",
    quantity: "",
    price: "",
    category: "Tablet",
    dosageForm: "Tablet",
    expiryDate: "",
    batchNumber: "",
    strength: "",
    storageCondition: "Room Temperature",
    prescriptionRequired: false,
    description: ""
  });
   const [medicines, setMedicines] = useState([]);
   /* const [loading, setLoading] = useState(false); */

   const [searchTerm, setSearchTerm] = useState("");
   const [filterType, setFilterType] = useState("");

  const [showForm, setShowForm] = useState(false);

  const loadMedicines = async () => {
    try {
      const res = await api.get("/api/admin/medicines");

      console.log("GET API RESPONSE:", res.data);

      // 🔥 THIS IS THE KEY
      if (Array.isArray(res.data.data)) {
        setMedicines(res.data.data);
      } else {
        setMedicines([]); // safety
      }

    } catch (e) {
      console.error("GET medicines failed", e);
      setMedicines([]);
    }
  };

    useEffect(() => {
      console.log("🔥 MedicineDashboard mounted – fetching medicines");
      loadMedicines();
    }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post("/api/admin/medicines", form);

      console.log("API RESPONSE:", res.data);

      if (res.data.success && res.data.data) {
        // 🔥 ADD medicine directly to frontend list
        setMedicines(prev => [...prev, res.data.data]);

        alert("Medicine added successfully ✅");
        setShowForm(false);

        setForm({
          medicineName: "",
          genericName: "",
          manufacturer: "",
          quantity: "",
          price: "",
          category: "Tablet",
          dosageForm: "Tablet",
          expiryDate: "",
          batchNumber: "",
          strength: "",
          storageCondition: "Room Temperature",
          prescriptionRequired: false,
          description: ""
        });
      }
    } catch (err) {
      console.error("Add medicine failed:", err);
      alert("Add medicine failed ❌");
    }
  };



  const handleLogout = () => {
    // Clear any stored tokens or user data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    // Redirect to login page
    navigate("/");
  };


  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;

    // YYYY-MM-DD string comparison (safe)
    const todayStr = new Date().toISOString().split("T")[0];
    return expiryDate < todayStr;
  };

// 1️⃣ Total Medicines
const totalMedicines = medicines.length;

// 2️⃣ Inventory Value (price × quantity)
const inventoryValue = medicines.reduce((sum, med) => {
  return sum + (Number(med.price) * Number(med.quantity));
}, 0);

// 3️⃣ Low Stock (threshold = 10)
const LOW_STOCK_THRESHOLD = 10;
const lowStockCount = medicines.filter(
  med => Number(med.quantity) <= LOW_STOCK_THRESHOLD
).length;


// 4️⃣ Expiring Soon (within next 30 days)
const EXPIRY_DAYS = 30;
const today = new Date();

const expiringSoonCount = medicines.filter(med => {
  if (!med.expiryDate) return false;

   if (isExpired(med.expiryDate)) return false;

  const expiryDate = new Date(med.expiryDate);
  const diffDays = (expiryDate - today) / (1000 * 60 * 60 * 24);

  return diffDays > 0 && diffDays <= EXPIRY_DAYS;
}).length;

const filteredMedicines = medicines.filter((med) => {
  // 🔍 SEARCH
  const matchesSearch =
    med.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.genericName?.toLowerCase().includes(searchTerm.toLowerCase());

  let matchesFilter = true;

  // 🔥 KEY FIX: "" OR "ALL" → show everything
  if (filterType === "" || filterType === "ALL") {
    matchesFilter = true;
  }
  else if (filterType === "LOW_STOCK") {
    matchesFilter = Number(med.quantity) <= 10;
  }
  else if (filterType === "EXPIRING") {
      if (!med.expiryDate) return false;

    /* const today = new Date(); */
    const expiry = new Date(med.expiryDate);
    const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
    matchesFilter = diffDays > 0 && diffDays <= 30;
  }

 else if (filterType === "EXPIRED") {
    matchesFilter = isExpired(med.expiryDate);
  }

 else if (filterType !== "ALL") {
   matchesFilter =
     med.category?.toLowerCase() === filterType.toLowerCase();
 }
  return matchesSearch && matchesFilter;
});

  return (
    <div className="medicine-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="header-title">Pharmacy Inventory</h1>
            <p className="header-subtitle">Manage medicines and stock levels</p>
          </div>
          <div className="header-actions">
            <button onClick={() => setShowForm(!showForm)} className="btn-add-medicine">
              <Plus size={20} />
              Add Medicine
            </button>
            <button onClick={handleLogout} className="btn-logout">
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Total Medicines</p>
                {/* <h3 className="stat-value">0</h3> */}
                <h3 className="stat-value">{totalMedicines}</h3>
              </div>
              <div className="stat-icon stat-icon-blue">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Inventory Value</p>
                {/* <h3 className="stat-value">₹0.00</h3> */}
                 <h3 className="stat-value">₹{inventoryValue.toFixed(2)}</h3>
              </div>

              {/* Green Icon */}
              <div className="stat-icon stat-icon-green">
                <span style={{ fontSize: "22px", fontWeight: "bold" }}>₹</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Low Stock</p>
                <h3 className="stat-value">{lowStockCount}</h3>
                {/* <h3 className={`stat-value ${lowStockCount > 0 ? "danger" : ""}`}>
                  {lowStockCount}
                </h3> */}
              </div>
              <div className="stat-icon stat-icon-orange">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Expiring Soon</p>
                <h3 className="stat-value">{expiringSoonCount}</h3>
              </div>
              <div className="stat-icon stat-icon-red">
                <Clock size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Add Medicine Form */}
        {showForm && (
          <div className="form-card">
            <div className="form-header">
              <h2 className="form-title">Add New Medicine</h2>
              <p className="form-subtitle">Fill in the details to add medicine to inventory</p>
            </div>

            <div className="form-content">
              {/* Basic Information */}
              <div className="form-section">
                <h3 className="section-title">Basic Information</h3>
                <div className="input-grid">
                  <div className="input-group">
                    <label className="input-label">
                      Medicine Name <span className="required">*</span>
                    </label>
                    <input
                      name="medicineName"
                      value={form.medicineName}
                      onChange={handleChange}
                      placeholder="e.g., Paracetamol"
                      className="input-field"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Generic Name</label>
                    <input
                      name="genericName"
                      value={form.genericName}
                      onChange={handleChange}
                      placeholder="e.g., Acetaminophen"
                      className="input-field"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Manufacturer</label>
                    <input
                      name="manufacturer"
                      value={form.manufacturer}
                      onChange={handleChange}
                      placeholder="e.g., GSK Pharmaceuticals"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory Details */}
              <div className="form-section">
                <h3 className="section-title">Inventory Details</h3>
                <div className="input-grid">
                  <div className="input-group">
                    <label className="input-label">
                      Quantity <span className="required">*</span>
                    </label>
                    <input
                      name="quantity"
                      type="number"
                      value={form.quantity}
                      onChange={handleChange}
                      placeholder="0"
                      className="input-field"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">
                      Price (₹) <span className="required">*</span>
                    </label>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="input-field"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Category</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option>Tablet</option>
                      <option>Syrup</option>
                      <option>Injection</option>
                      <option>Capsule</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Specifications */}
              <div className="form-section">
                <h3 className="section-title">Product Specifications</h3>
                <div className="input-grid">
                  <div className="input-group">
                    <label className="input-label">Dosage Form</label>
                    <select
                      name="dosageForm"
                      value={form.dosageForm}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option>Tablet</option>
                      <option>Syrup</option>
                      <option>Injection</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">
                      Expiry Date <span className="required">*</span>
                    </label>
                    <input
                      name="expiryDate"
                      type="date"
                      value={form.expiryDate}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">
                      Batch Number <span className="required">*</span>
                    </label>
                    <input
                      name="batchNumber"
                      value={form.batchNumber}
                      onChange={handleChange}
                      placeholder="e.g., BN-2024-001"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Storage & Additional Info */}
              <div className="form-section">
                <h3 className="section-title">Storage & Additional Info</h3>
                <div className="input-grid input-grid-2">
                  <div className="input-group">
                    <label className="input-label">Strength</label>
                    <input
                      name="strength"
                      value={form.strength}
                      onChange={handleChange}
                      placeholder="e.g., 500mg"
                      className="input-field"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Storage Condition</label>
                    <select
                      name="storageCondition"
                      value={form.storageCondition}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option>Room Temperature</option>
                      <option>Refrigerated</option>
                      <option>Cool & Dry</option>
                    </select>
                  </div>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    name="prescriptionRequired"
                    checked={form.prescriptionRequired}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  <label className="checkbox-label">Prescription Required</label>
                </div>

                <div className="input-group">
                  <label className="input-label">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Medicine description, usage, side effects..."
                    rows="4"
                    className="textarea-field"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button onClick={handleSubmit} className="btn-submit">
                  Add Medicine
                </button>
                <button onClick={() => setShowForm(false)} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Medicine List Section */}
        <div className="medicine-list-card">
          <div className="list-header">
            <h2 className="list-title">Medicine Inventory</h2>
            <div className="list-actions">
              <div className="search-box">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search medicines..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* <button className="btn-filter">
                <Filter size={18} />
                Filter
              </button> */}
              <select
                className="btn-filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
              <option value="" disabled>
                  Filter
                </option>
                <option value="ALL">All</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="EXPIRING">Expiring Soon</option>
                <option value="TABLET">Tablet</option>
                <option value="CAPSULE">Capsule</option>
                <option value="SYRUP">Syrup</option>
                <option value="INJECTION">Injection</option>
                <option value="EXPIRED">Expired</option>

              </select>

            </div>
          </div>
          {medicines.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Package size={48} />
              </div>
              <p className="empty-title">No medicines added yet</p>
              <p className="empty-subtitle">
                Click "Add Medicine" to start managing your inventory
              </p>
            </div>
          ) : (
            <table className="medicine-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((m) => (
                  <tr key={m.id}>
                    <td>{m.medicineName}</td>
                    <td>{m.category}</td>
                    <td>{m.quantity}</td>
                    <td>{m.price}</td>
                     <td>{m.expiryDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}