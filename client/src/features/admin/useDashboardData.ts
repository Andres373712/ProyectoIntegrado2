"use client";

import { useState, useEffect } from "react";
import apiClient from "@/shared/lib/apiClient";

interface DashboardData {
  eventosCalendario: { title: string; date: string }[];
  totalClientas: number;
  totalTalleresActivos: number;
}

const DATA_VACIA: DashboardData = {
  eventosCalendario: [],
  totalClientas: 0,
  totalTalleresActivos: 0,
};

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>(DATA_VACIA);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    apiClient
      .get<DashboardData>("/api/dashboard-data")
      .then((response) => {
        setData(response.data);
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error al cargar datos del dashboard:", error);
        setCargando(false);
      });
  }, []);

  return { data, cargando };
}
