import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Footer from "../Footer";
import "@testing-library/jest-dom";

describe("Footer", () => {
  test("renders footer with correct headings and links", () => {
    render(
      <Router>
        <Footer />
      </Router>
    );

    // Check for headings
    expect(screen.getByText("TMM Bienestar")).toBeInTheDocument();
    expect(screen.getByText("Enlaces Rápidos")).toBeInTheDocument();
    expect(screen.getByText("Síguenos")).toBeInTheDocument();

    // Check for links
    expect(screen.getByText("Inicio")).toHaveAttribute("href", "/");
    expect(screen.getByText("Nosotros")).toHaveAttribute("href", "/quienes-somos");
    expect(screen.getByText("Catálogo")).toHaveAttribute("href", "/catalogo");
    expect(screen.getByText("Contacto")).toHaveAttribute("href", "/contacto");
    expect(screen.getByText("Términos y Condiciones")).toHaveAttribute(
      "href",
      "/terminos-y-condiciones"
    );

    // Check for social media links
    expect(screen.getByRole("link", { name: /facebook/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /instagram/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /twitter/i })).toBeInTheDocument();

    // Check for copyright notice
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} TMM Bienestar. Todos los derechos reservados.`)
    ).toBeInTheDocument();
  });
});
