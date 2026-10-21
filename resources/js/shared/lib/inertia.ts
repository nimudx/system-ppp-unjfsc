/**
 * Traduce el nombre de página que envía Laravel (`Inertia::render`) a su
 * archivo dentro de `modules/`. El primer segmento es el módulo y el resto
 * la ruta dentro de su carpeta `pages/`:
 *
 *   'identity/auth/login'  ->  ./modules/identity/pages/auth/login.tsx
 *   'dashboard/dashboard'  ->  ./modules/dashboard/pages/dashboard.tsx
 */
export function modulePagePath(name: string): string {
    const [module, ...page] = name.split('/');

    return `./modules/${module}/pages/${page.join('/')}.tsx`;
}
