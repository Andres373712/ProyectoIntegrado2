import axios from "axios";

// 1. Obtener la URL base de la API desde las variables de entorno
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// 2. Crear una instancia de Axios pre-configurada
//
// OJO: no fijar acá un Content-Type por defecto. Axios ya elige el
// Content-Type correcto según el tipo de "data" de cada request (JSON para
// un objeto plano, "multipart/form-data; boundary=..." para un FormData) —
// pero solo si no hay ya un Content-Type explícito puesto de antemano. Con
// "application/json" fijo acá, axios trataba TODO como JSON, incluido el
// FormData que usan las subidas de imagen de talleres y productos:
// serializaba el FormData con JSON.stringify (un File no tiene propiedades
// propias, así que quedaba en "{}") y lo mandaba como si fuera JSON. El
// backend igual respondía 200 (los campos de texto sobrevivían solos), así
// que el fallo era silencioso: se creaba el taller pero la imagen nunca
// salía del navegador.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
