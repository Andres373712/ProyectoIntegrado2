"use client";

import { Input } from "@/components/ui/input";

interface InputPrecioProps extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> {
  value: string | number;
  onChange: (valor: string) => void;
}

function InputPrecio({ value, onChange, ...props }: InputPrecioProps) {
  // Formatear el valor para mostrar (agregar puntos)
  const formatearPrecio = (valor: string | number) => {
    if (!valor) return "";
    // Remover todo excepto números
    const soloNumeros = valor.toString().replace(/\D/g, "");
    // Agregar puntos como separador de miles
    return soloNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Manejar cambios en el input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorInput = e.target.value;
    // Permitir solo números y puntos
    const valorLimpio = valorInput.replace(/[^\d.]/g, "");
    // Remover puntos para obtener el número puro
    const valorNumerico = valorLimpio.replace(/\./g, "");

    // Llamar al onChange del padre con el valor numérico puro
    onChange(valorNumerico);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-muted-foreground">
        $
      </span>
      <Input
        {...props}
        type="text"
        value={formatearPrecio(value)}
        onChange={handleChange}
        placeholder="20.000"
        className="pl-7"
      />
    </div>
  );
}

export default InputPrecio;
