// ================= SINGLE FIELD VALIDATION =================
export const validateField = (name, value) => {
  switch (name) {
    case "firstName":
      if (!value) return "First name is required";
      if (!/^[A-Z][a-zA-Z]{2,}$/.test(value))
        return "First name must start with capital letter (min 3 chars)";
      return "";

    case "lastName":
      if (!value) return "Last name is required";
      if (!/^[A-Z][a-zA-Z]{2,}$/.test(value))
        return "Last name must start with capital letter (min 3 chars)";
      return "";

    case "username":
      if (!value) return "Username is required";
      if (value.length < 4) return "Username must be at least 4 characters";
      return "";

    case "password":
      if (!value) return "";
      if (
        !/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}/.test(value)
      )
        return "Password must be 8+ chars with uppercase, lowercase, number & special char";
      return "";

    case "email":
      if (!value) return "Email is required";
      if (!/^\S+@\S+\.\S+$/.test(value)) return "Invalid email format";
      return "";

    case "mobile":
      if (!value) return "Mobile number is required";
      if (!/^[6-9]\d{9}$/.test(value))
        return "Mobile must be 10 digits (start with 6-9)";
      return "";

    case "role":
      if (!value) return "Role is required";
      return "";

    default:
      return "";
  }
};

// ================= FULL FORM VALIDATION =================
