import { BrowserRouter, Routes, Route } from "react-router-dom";
import DoctorDashboard from "./Pages/Doctor/DoctorDashboard";
import DoctorMedicine from "./Pages/Doctor/DoctorMedicine";
import DoctorPrescriptions from "./Pages/Doctor/DoctorPrescriptions";
import Patients from "./Pages/Doctor/Patients";
import Login from "./Pages/Login.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Users from "./Pages/Users.jsx";
import ForgotPassword from "./Pages/ForgotPassword.jsx";
import ResetPassword from "./Pages/ResetPassword.jsx";
import ResetPasswordMobile from "./Pages/ResetPasswordMobile";
import VerifyOtp from "./Pages/VerifyOtp";
import MedicineDashboard from "./Pages/MedicineDashboard.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/Doctor/medicine" element={<DoctorMedicine />} />
        <Route path="/Doctor/patients" element={<Patients />} />
        <Route path="/Doctor/prescriptions" element={<DoctorPrescriptions />} />
        <Route path="/users" element={<Users/>}/>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password-mobile" element={<ResetPasswordMobile />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/medicine" element={<MedicineDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
