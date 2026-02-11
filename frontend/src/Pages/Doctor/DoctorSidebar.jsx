import { useNavigate} from "react-router-dom";
import "../../css/DoctorLayout.css";

function DoctorSidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="sidebar-content">
        <h2>🩺 Doctor</h2>

{/*         <p onClick={() => navigate("/doctor/medicine")}>Dashboard</p> */}
        <p onClick={() => navigate("/doctor/patients")}>Patients</p>
        <p onClick={() => navigate("/doctor/prescriptions")}>Prescriptions</p>
        <p>Reports</p>

        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

export default DoctorSidebar;