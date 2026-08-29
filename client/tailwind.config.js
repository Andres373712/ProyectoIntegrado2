/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"], // Requerido por shadcn
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "", // Requerido por shadcn
  theme: {
    container: {
      // Requerido por shadcn
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // --- Marca y estados semánticos (rediseño Fase 0 + Fase 1) ---
        // Antes #E4007C se repetía hardcodeado en varios componentes y los
        // estados usaban clases sueltas (bg-green-100, bg-amber-100...); la
        // paleta legacy tmm-* (usada en 3 archivos) ya fue migrada a estos
        // tokens y se retiró de aquí.
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },

        // --- Categorías del panel de admin (Fase 0 del rediseño) ---
        // Reemplazan el arcoíris ad-hoc (bg-indigo-600, bg-green-600,
        // bg-purple-600, bg-orange-600, bg-blue-600, bg-pink-600) de las
        // ActionCard de /admin por una familia de tonos emparentados entre
        // sí. El mapeo categoría → token se aplica en la Fase 1.
        "admin-a": { DEFAULT: "hsl(var(--admin-a))", foreground: "hsl(var(--admin-foreground))" },
        "admin-b": { DEFAULT: "hsl(var(--admin-b))", foreground: "hsl(var(--admin-foreground))" },
        "admin-c": { DEFAULT: "hsl(var(--admin-c))", foreground: "hsl(var(--admin-foreground))" },
        "admin-d": { DEFAULT: "hsl(var(--admin-d))", foreground: "hsl(var(--admin-foreground))" },
        "admin-e": { DEFAULT: "hsl(var(--admin-e))", foreground: "hsl(var(--admin-foreground))" },
        "admin-f": { DEFAULT: "hsl(var(--admin-f))", foreground: "hsl(var(--admin-foreground))" },

        // --- Colores Base de Shadcn (para que 'border-border' exista) ---
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        // Requerido por shadcn
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        // Requerido por shadcn
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        // Requerido por shadcn
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        // --- Nuestras Fuentes Personalizadas ("Cálido Elevado") ---
        sans: ["Karla", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["Domine", "Georgia", "Times New Roman", "serif"],
        display: ["Domine", "Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")], // Requerido por shadcn
};
