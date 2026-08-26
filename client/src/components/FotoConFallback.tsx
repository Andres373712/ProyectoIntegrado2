"use client";

import Image, { type StaticImageData } from "next/image";

/**
 * Isla cliente mínima: next/image necesita un Client Component para poder
 * pasarle un onError (ver docs de next/image), así que se aísla solo esta
 * parte en vez de forzar toda la página a ser "use client".
 */
export default function FotoConFallback({
  src,
  alt,
  className,
  sizes = "100vw",
}: {
  src: StaticImageData;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
        (target.parentNode as HTMLElement).style.backgroundColor = "#e5e7eb";
      }}
    />
  );
}
