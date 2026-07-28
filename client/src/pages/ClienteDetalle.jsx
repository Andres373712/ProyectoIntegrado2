import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ClienteDetalle() {
  // Estado para los datos (ahora editables)
  const [clienta, setClienta] = useState({
    nombre: "",
    email: "",
    telefono: "",
    intereses: "",
    fecha_registro: "",
  });
  // Estados para historial y notas
  const [historial, setHistorial] = useState([]);
  const [notas, setNotas] = useState([]);
  const [nuevaNota, setNuevaNota] = useState("");
  // Estados de control
  const [cargando, setCargando] = useState(true);
  const [mensajeNota, setMensajeNota] = useState("");
  const [mensajeCliente, setMensajeCliente] = useState("");

  const { id } = useParams();

  const token = localStorage.getItem("tmm_token");
  const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  // --- Carga de Datos ---
  const fetchNotas = useCallback(() => {
    axios
      .get(`http://localhost:5000/api/cliente/${id}/notas`, authHeaders)
      .then((res) => setNotas(res.data))
      .catch((err) => console.error("Error cargando notas:", err));
  }, [id, authHeaders]); // Añadimos token a las dependencias

  useEffect(() => {
    setCargando(true); // Indicar que estamos cargando
    Promise.all([
      axios.get(`http://localhost:5000/api/cliente/${id}`, authHeaders),
      axios.get(
        `http://localhost:5000/api/cliente/${id}/historial`,
        authHeaders,
      ),
      axios.get(`http://localhost:5000/api/cliente/${id}/notas`, authHeaders),
    ])
      .then(([resClienta, resHistorial, resNotas]) => {
        setClienta(
          resClienta.data || {
            nombre: "",
            email: "",
            telefono: "",
            intereses: "",
            fecha_registro: "",
          },
        ); // Asegurar que clienta no sea null
        setHistorial(resHistorial.data);
        setNotas(resNotas.data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al cargar datos de la clienta:", err);
        setMensajeCliente("Error al cargar los datos. Intenta recargar."); // Mensaje de error
        setCargando(false);
      });
  }, [id, authHeaders]); // fetchNotas ya no es necesaria aquí si la lógica está dentro

  // --- Guardar Nota ---
  const handleGuardarNota = (e) => {
    e.preventDefault();
    if (!nuevaNota) return;
    setMensajeNota("Guardando nota...");

    axios
      .post(
        `http://localhost:5000/api/cliente/${id}/notas`,
        { nota: nuevaNota },
        authHeaders,
      )
      .then(() => {
        setMensajeNota("Nota guardada.");
        setNuevaNota("");
        fetchNotas(); // Recargar notas
        setTimeout(() => setMensajeNota(""), 3000);
      })
      .catch((err) => {
        setMensajeNota("Error al guardar nota.");
        console.error("Error guardando nota:", err);
      });
  };

  // --- Editar Datos Cliente ---
  const handleClientaChange = (e) => {
    const { name, value } = e.target;
    setClienta((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardarCliente = (e) => {
    e.preventDefault();
    setMensajeCliente("Guardando...");

    const datosActualizados = {
      nombre: clienta.nombre,
      email: clienta.email,
      telefono: clienta.telefono,
      intereses: clienta.intereses,
    };

    axios
      .put(
        `http://localhost:5000/api/cliente/${id}`,
        datosActualizados,
        authHeaders,
      )
      .then(() => {
        setMensajeCliente("¡Datos guardados!");
        setTimeout(() => setMensajeCliente(""), 3000);
      })
      .catch((err) => {
        setMensajeCliente(err.response?.data?.message || "Error al guardar.");
        console.error("Error guardando cliente:", err);
      });
  };

  if (cargando)
    return <p className="p-10 text-center">Cargando perfil de la clienta...</p>;
  // Aseguramos que clienta tenga datos antes de renderizar
  if (!clienta || !clienta.email)
    return (
      <p className="p-10 text-center">
        Clienta no encontrada o error al cargar.
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        {/* --- Cabecera con Info Editable de la Clienta --- */}
        <form
          onSubmit={handleGuardarCliente}
          className="mb-8 rounded-lg bg-white p-8 shadow-md"
        >
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre Completo
              </label>
              <input
                type="text"
                name="nombre"
                value={clienta.nombre || ""}
                onChange={handleClientaChange}
                className="mt-1 w-full rounded border p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={clienta.email || ""}
                onChange={handleClientaChange}
                className="mt-1 w-full rounded border p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Teléfono (WhatsApp)
              </label>
              <input
                type="tel"
                name="telefono"
                value={clienta.telefono || ""}
                onChange={handleClientaChange}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Intereses (separados por coma)
              </label>
              <input
                type="text"
                name="intereses"
                value={clienta.intereses || ""}
                onChange={handleClientaChange}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Clienta desde:{" "}
            {clienta.fecha_registro
              ? new Date(clienta.fecha_registro).toLocaleDateString("es-CL")
              : "N/A"}
          </div>
          <div className="mt-6 flex items-center justify-end gap-4">
            {mensajeCliente && (
              <span className="text-sm">{mensajeCliente}</span>
            )}
            <button
              type="submit"
              className="rounded-lg bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600"
            >
              {" "}
              Guardar Cambios{" "}
            </button>
          </div>
        </form>

        {/* --- Columnas de Historial y Notas --- */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Columna 1: Historial de Talleres */}
          <div className="rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-tmm-dark">
              Historial de Trazabilidad
            </h2>
            <div className="max-h-96 space-y-4 overflow-y-auto">
              {historial.length > 0 ? (
                historial.map((taller, index) => (
                  <div
                    key={index}
                    className="rounded border-l-4 border-tmm-pink bg-gray-50 p-4"
                  >
                    <h3 className="text-lg font-bold">{taller.nombre}</h3>
                    <p className="text-sm text-gray-600">
                      Fecha taller:{" "}
                      {taller.fecha
                        ? new Date(taller.fecha).toLocaleDateString("es-CL")
                        : "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Inscripción:{" "}
                      {taller.fecha_inscripcion
                        ? new Date(taller.fecha_inscripcion).toLocaleDateString(
                            "es-CL",
                          )
                        : "N/A"}
                    </p>
                  </div>
                ))
              ) : (
                <p>Esta clienta aún no se ha inscrito a ningún taller.</p>
              )}
            </div>
          </div>

          {/* Columna 2: Notas de Fidelización */}
          <div className="rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-tmm-dark">
              Notas de Fidelización
            </h2>
            <form onSubmit={handleGuardarNota} className="mb-6">
              <label className="mb-2 block font-bold text-gray-700">
                Añadir nota personal:
              </label>
              <textarea
                value={nuevaNota}
                onChange={(e) => setNuevaNota(e.target.value)}
                className="w-full rounded border p-2"
                rows="3"
                placeholder="Ej: Le encantó la resina..."
              ></textarea>
              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-tmm-pink py-2 font-bold text-white hover:opacity-90"
              >
                Guardar Nota
              </button>
              {mensajeNota && (
                <p className="mt-2 text-center text-sm">{mensajeNota}</p>
              )}
            </form>

            <div className="max-h-60 space-y-4 overflow-y-auto">
              {notas.length > 0 ? (
                notas.map((nota) => (
                  <div key={nota.id} className="rounded bg-yellow-100 p-4">
                    <p className="text-gray-800">{nota.nota}</p>
                    <p className="mt-2 text-right text-xs text-gray-500">
                      {new Date(nota.fecha).toLocaleString("es-CL")}
                    </p>
                  </div>
                ))
              ) : (
                <p>Aún no hay notas para esta clienta.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClienteDetalle;
