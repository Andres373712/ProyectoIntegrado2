import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  // Estados para los filtros
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tallerSeleccionado, setTallerSeleccionado] = useState(""); // Nuevo estado para el taller

  // Estado para la lista de talleres (para el dropdown)
  const [listaTalleres, setListaTalleres] = useState([]);

  const token = localStorage.getItem("tmm_token");
  const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  // Función para cargar clientas (ahora con filtro de taller)
  const fetchClientes = useCallback(
    async (busqueda = "", inicio = "", fin = "", tallerId = "") => {
      setCargando(true);
      try {
        const params = new URLSearchParams();
        if (busqueda) params.append("buscar", busqueda);
        if (inicio) params.append("fechaInicio", inicio);
        if (fin) params.append("fechaFin", fin);
        if (tallerId) params.append("tallerId", tallerId); // Añadir el nuevo filtro

        const queryString = params.toString();
        const url = `http://localhost:5000/api/clientes${queryString ? `?${queryString}` : ""}`;

        const response = await axios.get(url, authHeaders);
        setClientes(response.data);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      } finally {
        setCargando(false);
      }
    },
    [authHeaders],
  );

  // Cargar clientas Y la lista de talleres al inicio
  useEffect(() => {
    fetchClientes(); // Carga inicial de clientas

    // Cargar la lista de talleres para el dropdown
    axios
      .get("http://localhost:5000/api/talleres/todos", authHeaders)
      .then((response) => {
        setListaTalleres(response.data);
      })
      .catch((error) =>
        console.error("Error al cargar lista de talleres:", error),
      );
  }, [fetchClientes, authHeaders]); // fetchClientes ya incluye token como dependencia

  // Manejadores para los inputs
  const handleBusquedaChange = (e) => setTerminoBusqueda(e.target.value);
  const handleFechaInicioChange = (e) => setFechaInicio(e.target.value);
  const handleFechaFinChange = (e) => setFechaFin(e.target.value);
  const handleTallerChange = (e) => setTallerSeleccionado(e.target.value); // Nuevo manejador

  // Manejador para el envío del formulario de búsqueda
  const handleBuscarSubmit = (e) => {
    e.preventDefault();
    fetchClientes(terminoBusqueda, fechaInicio, fechaFin, tallerSeleccionado); // Incluir taller
  };

  // Manejador para limpiar todos los filtros
  const limpiarFiltros = () => {
    setTerminoBusqueda("");
    setFechaInicio("");
    setFechaFin("");
    setTallerSeleccionado(""); // Limpiar también el taller
    fetchClientes("", "", "", ""); // Volver a cargar sin filtros
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        {" "}
        {/* Ampliado un poco el ancho */}
        <h1 className="mb-6 text-3xl font-bold text-tmm-dark">
          Gestión de Clientas
        </h1>
        {/* --- Formulario de Filtros --- */}
        <form
          onSubmit={handleBuscarSubmit}
          className="mb-6 flex flex-wrap items-end gap-4 rounded-lg bg-white p-4 shadow-md"
        >
          {/* Input de Texto */}
          <div className="min-w-[150px] flex-grow">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre/Email..."
              value={terminoBusqueda}
              onChange={handleBusquedaChange}
              className="w-full rounded border p-2"
            />
          </div>
          {/* Input de Fecha Inicio */}
          <div className="min-w-[140px]">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Desde
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={handleFechaInicioChange}
              className="w-full rounded border p-2"
            />
          </div>
          {/* Input de Fecha Fin */}
          <div className="min-w-[140px]">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Hasta
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={handleFechaFinChange}
              className="w-full rounded border p-2"
            />
          </div>
          {/* NUEVO Dropdown de Taller */}
          <div className="min-w-[200px] flex-grow">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Inscritas en Taller
            </label>
            <select
              value={tallerSeleccionado}
              onChange={handleTallerChange}
              className="w-full rounded border bg-white p-2"
            >
              <option value="">-- Todos los talleres --</option>
              {listaTalleres.map((taller) => (
                <option key={taller.id} value={taller.id}>
                  {taller.nombre} (
                  {new Date(taller.fecha).toLocaleDateString("es-CL")})
                </option>
              ))}
            </select>
          </div>
          {/* Botones */}
          <button
            type="submit"
            className="h-[42px] self-end rounded-lg bg-tmm-pink px-4 py-2 text-white hover:opacity-90"
          >
            {" "}
            Filtrar{" "}
          </button>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="h-[42px] self-end rounded-lg bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
            title="Limpiar filtros"
          >
            {" "}
            Limpiar{" "}
          </button>
        </form>
        {/* --- Lista de Clientas --- */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          {/* ... (El resto del código de la lista es igual que antes) ... */}
          {cargando ? (
            <p className="text-center text-gray-500">Cargando clientas...</p>
          ) : (
            <div className="space-y-4">
              {clientes.length > 0 ? (
                clientes.map((clienta) => (
                  <div
                    key={clienta.id}
                    className="flex flex-col justify-between rounded-lg border p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <h3 className="text-lg font-bold">{clienta.nombre}</h3>
                      <p className="text-sm text-gray-600">
                        {clienta.email || "(Sin email)"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Tel: {clienta.telefono || "-"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Registrada:{" "}
                        {new Date(clienta.fecha_registro).toLocaleDateString(
                          "es-CL",
                        )}
                      </p>
                    </div>
                    <div className="mt-2 text-left sm:mt-0 sm:text-right">
                      {/* Nota: total_inscripciones podría no ser preciso si filtramos por taller */}
                      {/* Podríamos quitarlo o mostrar solo si no hay filtro de taller */}
                      <p className="font-bold">
                        {clienta.total_inscripciones}{" "}
                        {clienta.total_inscripciones === 1
                          ? "taller"
                          : "talleres"}
                      </p>
                      <Link
                        to={`/admin/cliente/${clienta.id}`}
                        className="text-sm font-bold text-blue-500 hover:underline"
                      >
                        Ver Trazabilidad
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">
                  {terminoBusqueda ||
                  fechaInicio ||
                  fechaFin ||
                  tallerSeleccionado
                    ? "No se encontraron clientas con esos filtros."
                    : "Aún no hay clientas registradas."}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminClientes;
