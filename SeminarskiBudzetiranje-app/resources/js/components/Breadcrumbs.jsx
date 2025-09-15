import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { hasRole } from './ProtectedRoute';

const Breadcrumbs = () => {
    const location = useLocation();
    const isAdmin = hasRole('admin');

    // Definisanje breadcrumb mapiranja
    const breadcrumbMap = {
        '/': { label: 'Home', icon: '🏠' },
        '/login': { label: 'Login', icon: '🔐' },
        '/transactions': { label: 'Transactions', icon: '💰' },
        '/market-data': { label: 'Market Data', icon: '📈' },
        '/admin': { label: 'Admin', icon: '👑' },
        '/admin/dashboard': { label: 'Dashboard', icon: '📊' },
        '/admin/users': { label: 'Manage Users', icon: '👥' },
    };

    // Kreiraj breadcrumb putanje
    const createBreadcrumbs = () => {
        const pathnames = location.pathname.split('/').filter(x => x);
        const breadcrumbs = [];

        // Uvek dodaj Home kao prvi
        breadcrumbs.push({
            path: '/',
            label: breadcrumbMap['/'].label,
            icon: breadcrumbMap['/'].icon,
            current: location.pathname === '/'
        });

        // Ako nismo na home stranici, dodaj ostale segmente
        if (location.pathname !== '/') {
            let currentPath = '';
            
            pathnames.forEach((segment, index) => {
                currentPath += `/${segment}`;
                const isLast = index === pathnames.length - 1;
                
                // Specijalni slučajevi za admin rute
                if (segment === 'admin' && pathnames.length === 1) {
                    // Samo /admin - redirect na dashboard
                    breadcrumbs.push({
                        path: '/admin/dashboard',
                        label: breadcrumbMap['/admin'].label,
                        icon: breadcrumbMap['/admin'].icon,
                        current: false
                    });
                } else if (currentPath === '/admin/dashboard') {
                    breadcrumbs.push({
                        path: currentPath,
                        label: breadcrumbMap[currentPath].label,
                        icon: breadcrumbMap[currentPath].icon,
                        current: isLast
                    });
                } else if (currentPath === '/admin/users') {
                    // Dodaj Admin segment ako nije već dodat
                    if (!breadcrumbs.some(b => b.path.includes('/admin'))) {
                        breadcrumbs.push({
                            path: '/admin/dashboard',
                            label: breadcrumbMap['/admin'].label,
                            icon: breadcrumbMap['/admin'].icon,
                            current: false
                        });
                    }
                    breadcrumbs.push({
                        path: currentPath,
                        label: breadcrumbMap[currentPath].label,
                        icon: breadcrumbMap[currentPath].icon,
                        current: isLast
                    });
                } else if (breadcrumbMap[currentPath]) {
                    breadcrumbs.push({
                        path: currentPath,
                        label: breadcrumbMap[currentPath].label,
                        icon: breadcrumbMap[currentPath].icon,
                        current: isLast
                    });
                }
            });
        }

        return breadcrumbs;
    };

    const breadcrumbs = createBreadcrumbs();

    // Ne prikazuj breadcrumbs na login stranici
    if (location.pathname === '/login') {
        return null;
    }

    return (
        <nav 
            style={{ 
                backgroundColor: '#f8f9fa',
                padding: '12px 20px',
                borderBottom: '1px solid #e9ecef',
                fontSize: '14px'
            }}
            aria-label="Breadcrumb"
        >
            <ol style={{
                display: 'flex',
                alignItems: 'center',
                margin: 0,
                padding: 0,
                listStyle: 'none',
                flexWrap: 'wrap',
                gap: '5px'
            }}>
                {breadcrumbs.map((crumb, index) => (
                    <li key={crumb.path} style={{ display: 'flex', alignItems: 'center' }}>
                        {index > 0 && (
                            <span style={{ 
                                margin: '0 8px', 
                                color: '#6c757d',
                                fontSize: '12px'
                            }}>
                                ›
                            </span>
                        )}
                        
                        {crumb.current ? (
                            <span style={{
                                color: '#495057',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '4px'
                            }}>
                                <span>{crumb.icon}</span>
                                {crumb.label}
                            </span>
                        ) : (
                            <Link
                                to={crumb.path}
                                style={{
                                    textDecoration: 'none',
                                    color: '#007bff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#e7f3ff';
                                    e.target.style.textDecoration = 'underline';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.textDecoration = 'none';
                                }}
                            >
                                <span>{crumb.icon}</span>
                                {crumb.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
            
            {/* Dodatne informacije za admin */}
            {isAdmin && (location.pathname.includes('/admin') || location.pathname.includes('/transactions')) && (
                <div style={{ 
                    marginTop: '8px', 
                    fontSize: '12px', 
                    color: '#856404',
                    backgroundColor: '#fff3cd',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #ffeaa7',
                    display: 'inline-block'
                }}>
                    👑 Administrator privileges active
                </div>
            )}
        </nav>
    );
};

export default Breadcrumbs;