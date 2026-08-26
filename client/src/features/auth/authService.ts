import apiClient from "@/shared/lib/apiClient";

export interface RegistroClienteData {
  nombre: string;
  email: string;
  telefono: string;
  password: string;
  aceptaTerminos: boolean;
}

export const authService = {
  loginAdmin: (email: string, password: string) =>
    apiClient.post<{ message: string; token: string }>("/api/login", { email, password }),
  loginCliente: (email: string, password: string) =>
    apiClient.post<{ message: string; token: string }>("/api/auth/login-cliente", { email, password }),
  registerCliente: (datos: RegistroClienteData) =>
    apiClient.post("/api/auth/register-cliente", datos),
  forgotPassword: (email: string) =>
    apiClient.post("/api/auth/forgot-password", { email }),
  resetPassword: (token: string, newPassword: string) =>
    apiClient.post("/api/auth/reset-password", { token, newPassword }),
};
