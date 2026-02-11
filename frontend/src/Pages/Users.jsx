import { useEffect, useState } from "react";
import api from "../api";
import "../css/Users.css";
import Swal from "sweetalert2";
import { validateField } from "../utils/validation";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsUser, setDetailsUser] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    email: "",
    mobile: "",
    location: "",
    licenseNumber: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});


  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let data = users;

    if (form.firstName) {
      data = data.filter((user) =>
        user.firstName.toLowerCase().includes(form.firstName.toLowerCase())
      );
    }

    if (form.lastName) {
      data = data.filter((user) =>
        user.lastName.toLowerCase().includes(form.lastName.toLowerCase())
      );
    }

    if (form.username) {
      data = data.filter((user) =>
        user.username.toLowerCase().includes(form.username.toLowerCase())
      );
    }

    if (form.email) {
      data = data.filter((user) =>
        user.email.toLowerCase().includes(form.email.toLowerCase())
      );
    }

    if (form.mobile) {
      data = data.filter((user) => user.mobile.includes(form.mobile));
    }

    if (form.role) {
      data = data.filter((user) => user.role === form.role);
    }

    setFilteredUsers(data);
  }, [
    form.firstName,
    form.lastName,
    form.username,
    form.email,
    form.mobile,
    form.role,
    users,
  ]);

  const loadUsers = async () => {
    const res = await api.get("/api/admin/users");
    setUsers(res.data);
    setFilteredUsers(res.data);
  };

  // ================= CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  // ================= BLUR =================
  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      email: "",
      mobile: "",
      location: "",
      licenseNumber: "",
      role: "",
    });

    setErrors({});
    setTouched({});
    setIsEditing(false);
    setSelectedUser(null);
  };

  const isFormValid =
    Object.values(errors).every((e) => !e) &&
    form.firstName &&
    form.lastName &&
    form.username &&
    form.email &&
    form.mobile &&
    form.role;


  // ================= ADD =================
  const addUser = async () => {
    if (!isFormValid) {
      Swal.fire("Error", "Fix validation errors first", "error");
      return;
    }

     try {
        await api.post("/api/admin/users", form);

        Swal.fire("Success", "User added successfully", "success");
        resetForm();
        loadUsers();

      } catch (err) {
        // 🔴 Username already exists
        if (err.response?.status === 409) {
          setErrors((prev) => ({
            ...prev,
            username: "Username already exists"
          }));
          setTouched((prev) => ({
            ...prev,
            username: true
          }));
        } else {
          Swal.fire(
            "Error",
            err.response?.data?.message || "User creation failed",
            "error"
          );
        }
      }
    };

  // ================= EDIT =================
  const editUser = (user) => {
    setSelectedUser(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      password: "",
      email: user.email,
      mobile: user.mobile,
      location: user.location || "",
      licenseNumber: user.licenseNumber || "",
      role: user.role,
    });
    setErrors({});
    setTouched({});
    setIsEditing(true);
  };

  // ================= UPDATE =================
  const updateUser = async () => {
    if (!isFormValid) {
      Swal.fire("Error", "Fix validation errors first", "error");
      return;
    }

    try {
      await api.put(
        `/api/admin/users/${selectedUser.id}`,
        {
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          email: form.email,
          mobile: form.mobile,
          location: form.location,
          licenseNumber: form.licenseNumber,
          role: form.role,
          ...(form.password && { password: form.password })
        }
      );

      Swal.fire("Success", "User updated successfully", "success");
      resetForm();
      loadUsers();

    } catch (err) {
      // 🔴 Username conflict (someone else's username)
      if (err.response?.status === 409) {
        setErrors((prev) => ({
          ...prev,
          username: "Username already exists"
        }));
        setTouched((prev) => ({
          ...prev,
          username: true
        }));
      } else {
        Swal.fire(
          "Error",
          err.response?.data?.message || "User update failed",
          "error"
        );
      }
    }
  };

  // ================= DELETE =================
  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      await api.delete(`/api/admin/users/${id}`);
      Swal.fire("Deleted!", "User deleted", "success");
      loadUsers();
    }
  };

  // ================= TOGGLE =================
  const toggleUser = async (id) => {
    await api.put(`/api/admin/users/${id}/toggle-status`);
    loadUsers();
  };

  // ================= SHOW DETAILS =================
  const showDetails = (user) => {
    setDetailsUser(user);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setDetailsUser(null);
  };

  return (
    <div className="users-container">
      <h2>User Management</h2>

      <div className="user-form">
        {[
          ["firstName", "First Name"],
          ["lastName", "Last Name"],
          ["username", "Username"],
          ["password", "Password"],
          ["email", "Email"],
          ["mobile", "Mobile No"],
          ["location", "Location"],
          ["licenseNumber", "License Number"],
        ].map(([name, label]) => (
          <div key={name}>
            <input
              name={name}
              type={name === "password" ? "password" : "text"}
              placeholder={label}
              value={form[name]}
              onChange={handleChange}
              onBlur={handleBlur}

              className={touched[name] && errors[name] ? "error" : ""}
            />
            {touched[name] && errors[name] && (
              <p className="error-text">{errors[name]}</p>
            )}
          </div>
        ))}
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <option value="">Select Role</option>
          <option value="PATIENT">Patient</option>
          <option value="DOCTOR">Doctor</option>
          <option value="ADMIN">Admin</option>
        </select>

        {isEditing ? (
          <>
            <button
              className="update-btn"
              onClick={updateUser}
              disabled={!isFormValid}
            >
              Update User
            </button>
            <button className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
          </>
        ) : (
          <button onClick={addUser} disabled={!isFormValid}>
            Add User
          </button>
        )}
      </div>

      {/* ================= TABLE (Location & License Number NAHI dikhega) ================= */}
      <table className="user-table">
        <thead>
          <tr>
            <th>First</th>
            <th>Last</th>
            <th>Username</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((user) => (
            <tr
              key={user.id}
              className={!user.active ? "disabled-row" : ""}
            >
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.mobile}</td>
              <td>{user.role}</td>
              <td>
                <button
                  className="details-btn"
                  onClick={() => showDetails(user)}
                >
                  Show Details
                </button>
                <button
                  className="disable-btn"
                  onClick={() => toggleUser(user.id)}
                >
                  {user.active ? "Disable" : "Enable"}
                </button>
                <button
                  className="edit-btn"
                  onClick={() => editUser(user)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  disabled={!user.active}
                  onClick={() => deleteUser(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= DETAILS MODAL (Location & License Number DIKHEGA) ================= */}
      {showDetailsModal && detailsUser && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="close-btn" onClick={closeDetailsModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">ID:</span>
                <span className="detail-value">{detailsUser.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">First Name:</span>
                <span className="detail-value">{detailsUser.firstName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Last Name:</span>
                <span className="detail-value">{detailsUser.lastName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Username:</span>
                <span className="detail-value">{detailsUser.username}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{detailsUser.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Mobile No:</span>
                <span className="detail-value">{detailsUser.mobile}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{detailsUser.location || "N/A"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">License Number:</span>
                <span className="detail-value">{detailsUser.licenseNumber || "N/A"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Role:</span>
                <span className="detail-value">{detailsUser.role}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`detail-value ${detailsUser.active ? 'active-status' : 'inactive-status'}`}>
                  {detailsUser.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-modal-btn" onClick={closeDetailsModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}