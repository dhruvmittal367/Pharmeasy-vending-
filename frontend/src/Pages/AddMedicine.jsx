import React, { useState } from "react";
import Swal from "sweetalert2";

export default function AddMedicine() {

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.medicineName || !form.quantity || !form.price || !form.expiryDate) {
      Swal.fire("Error", "Please fill all required fields", "error");
      return;
    }

    console.log("Medicine Payload:", form);

    Swal.fire("Success", "Medicine added successfully", "success");
  };

  return (
    <div className="medicine-form-card">
      <h2>Add New Medicine</h2>

      <form onSubmit={handleSubmit}>

        <div className="form-row">
          <input name="medicineName" placeholder="Medicine Name *" onChange={handleChange} />
          <input name="genericName" placeholder="Generic Name" onChange={handleChange} />
          <input name="manufacturer" placeholder="Manufacturer" onChange={handleChange} />
        </div>

        <div className="form-row">
          <input name="quantity" type="number" placeholder="Quantity *" onChange={handleChange} />
          <input name="price" type="number" step="0.01" placeholder="Price ($) *" onChange={handleChange} />

          <select name="category" onChange={handleChange}>
            <option>Tablet</option>
            <option>Syrup</option>
            <option>Injection</option>
            <option>Capsule</option>
          </select>
        </div>

        <div className="form-row">
          <select name="dosageForm" onChange={handleChange}>
            <option>Tablet</option>
            <option>Syrup</option>
            <option>Injection</option>
          </select>

          <input name="expiryDate" type="date" onChange={handleChange} />
          <input name="batchNumber" placeholder="Batch Number *" onChange={handleChange} />
        </div>

        <div className="form-row">
          <input name="strength" placeholder="Strength (e.g. 500mg)" onChange={handleChange} />

          <select name="storageCondition" onChange={handleChange}>
            <option>Room Temperature</option>
            <option>Refrigerated</option>
            <option>Cool & Dry</option>
          </select>
        </div>

        <div className="checkbox-row">
          <input
            type="checkbox"
            name="prescriptionRequired"
            onChange={handleChange}
          />
          <label>Prescription Required</label>
        </div>

        <textarea
          name="description"
          placeholder="Medicine description, usage, side effects..."
          onChange={handleChange}
        />

        <div className="form-actions">
          <button type="submit" className="btn-primary">Add Medicine</button>
          <button type="reset" className="btn-secondary">Clear Form</button>
        </div>

      </form>
    </div>
  );
}
