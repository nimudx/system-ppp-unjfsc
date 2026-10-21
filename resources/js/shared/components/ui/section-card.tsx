import * as React from "react";
import { cn } from "@/shared/lib/utils";

/**
 * SectionCard - Componente contenedor premium para secciones del dashboard.
 */
function SectionCardRoot({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-card text-card-foreground",
        className
      )}
      {...props}
    />
  )
}

/**
 * SectionCard.Header - Cabecera con soporte para título y subtítulo.
 */
function SectionCardHeader({
  className,
  title,
  description,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  title?: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <div
      className={cn("flex flex-col h-15 gap-1 border-b px-4 py-3 bg-card", className)}
      {...props}
    >
      {title && (
        <h3 className="text-sm font-semibold leading-none tracking-tight text-foreground">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </div>
  )
}

/**
 * SectionCard.Body - El cuerpo principal del contenedor.
 */
function SectionCardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-3 py-2", className)}
      {...props}
    />
  )
}

/**
 * SectionCard.Footer - Pie de página opcional (ej: para controles de previsualización).
 */
function SectionCardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-t bg-muted/20 px-4 py-3 transition-colors",
        className
      )}
      {...props}
    />
  )
}

// Asignación de componentes para uso con notación de punto
const SectionCard = Object.assign(SectionCardRoot, {
  Header: SectionCardHeader,
  Body: SectionCardBody,
  Footer: SectionCardFooter,
})

export { SectionCard, SectionCardHeader, SectionCardBody, SectionCardFooter }
