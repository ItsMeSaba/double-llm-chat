import type { FormData } from "../Login";

export function validateForm(
  formData: FormData,
  setErrors: (errors: string[]) => void,
  isLogin: boolean
) {
  const newErrors: string[] = [];

  if (!formData.email) {
    newErrors.push("Email is required");
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.push("Please enter a valid email");
  }

  if (!formData.password) {
    newErrors.push("Password is required");
  } else if (formData.password.length < 6) {
    newErrors.push("Password must be at least 6 characters");
  }

  if (!isLogin && formData.password !== formData.confirmPassword) {
    newErrors.push("Passwords do not match");
  }

  setErrors(newErrors);
  return newErrors.length === 0;
}
