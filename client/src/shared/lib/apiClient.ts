import axios from "axios";

// 1. Obtener la URL base de la API desde las variables de entorno
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// 2. Crear una instancia de Axios pre-configurada
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Función para obtener la URL completa de una imagen en el servidor.
 * @param {string} imageUrl - La ruta relativa de la imagen (ej. /uploads/imagen.jpg)
 * @returns {string} La URL completa de la imagen.
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return "/placeholder.png"; // O una imagen por defecto
  }
  // Asegurarse de que no se duplique la barra
  return `${API_BASE_URL.replace(/\/$/, "")}/${imageUrl.replace(/^\//, "")}`;
};

// 3. Interceptor para añadir el token de autenticación a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("tmm_token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
