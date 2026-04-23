import { Outlet, useLocation, useParams, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Logo } from "@/components/Logo";

function Breadcrumb() {
  const location = useLocation();
  const { orgId, eventId } = useParams();

  const crumbs: { label: string; path: string }[] = [];

  if (location.pathname === '/dashboard') {
    crumbs.push({ label: 'Accueil', path: '/dashboard' });
  } else if (location.pathname.includes('/my-events')) {
    crumbs.push({ label: 'Accueil', path: '/dashboard' });
    crumbs.push({ label: 'Mes billets', path: '#' });
  } else if (location.pathname.includes('/organizations')) {
    crumbs.push({ label: 'Accueil', path: '/dashboard' });
    crumbs.push({ label: 'Organisations', path: '#' });
  } else if (orgId && eventId) {
    crumbs.push({ label: 'Accueil', path: '/dashboard' });
    crumbs.push({ label: 'Événements', path: `/dashboard/org/${orgId}/events` });
    crumbs.push({ label: 'Modifier', path: '#' });
  } else if (orgId) {
    crumbs.push({ label: 'Accueil', path: '/dashboard' });
    crumbs.push({ label: 'Mon organisation', path: `/dashboard/org/${orgId}` });
    if (location.pathname.includes('/fiche')) {
      crumbs.push({ label: 'Ma fiche', path: '#' });
    } else if (location.pathname.includes('/events')) {
      crumbs.push({ label: 'Événements', path: '#' });
    } else if (location.pathname.includes('/tickets')) {
      crumbs.push({ label: 'Billets', path: '#' });
    } else if (location.pathname.includes('/settings')) {
      crumbs.push({ label: 'Paramètres', path: '#' });
    } else if (location.pathname.includes('/qr-validator')) {
      crumbs.push({ label: 'Scanner QR', path: '#' });
    }
  }

  if (crumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 px-6 py-2 border-b border-gray-100 bg-white">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-gray-300">/</span>}
          {i === crumbs.length - 1 ? (
            <span className="text-gray-900 font-medium">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-orange-500 transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-gray-50/50">
        {/* Header with SidebarTrigger */}
        <header className="h-16 flex items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <Logo size="sm" />
          </div>
        </header>

        <Breadcrumb />

        {/* Main content area */}
        <div className="flex flex-1 w-full">
          <DashboardSidebar />
          <main className="flex-1 p-3 sm:p-6 overflow-x-hidden min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
