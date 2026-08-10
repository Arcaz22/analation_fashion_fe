import { useEffect, useState } from "react";

import { RegisterForm } from "~/components/forms/RegisterForm";

const REGISTER_ACCESS_KEY = "match:register-admin-access";
const ADMIN_USERNAME =
  import.meta.env.VITE_REGISTER_ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD =
  import.meta.env.VITE_REGISTER_ADMIN_PASSWORD ?? "admin123";

export default function RegisterPage() {
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem(REGISTER_ACCESS_KEY) === "true") {
      setIsAllowed(true);
      return;
    }

    const adminName = window.prompt("Admin");
    if (adminName === null) return;
    const adminPassword = window.prompt("Password");
    if (adminPassword === null) return;
    if (
      adminName.trim() === ADMIN_USERNAME &&
      adminPassword === ADMIN_PASSWORD
    ) {
      window.sessionStorage.setItem(REGISTER_ACCESS_KEY, "true");
      setIsAllowed(true);
    }
  }, []);

  if (isAllowed) return <RegisterForm />;

  return null;
}
