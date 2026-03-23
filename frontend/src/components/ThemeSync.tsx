import { useEffect } from "react";
import { useAppSelector } from "../hooks";

export function ThemeSync() {
  const darkMode = useAppSelector((s) => s.auth.user?.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", Boolean(darkMode));
  }, [darkMode]);

  return null;
}
