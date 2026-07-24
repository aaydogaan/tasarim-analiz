import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

type Props = {
    authYukleniyor: boolean;
    kullanici: any;
    kullaniciProfile: any;
    children: React.ReactNode;
};

export default function AdminProtectedRoute({ authYukleniyor, kullanici, kullaniciProfile, children }: Props) {
    const location = useLocation();

    if (authYukleniyor || (kullanici !== null && kullaniciProfile === null)) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-primary)]">
                <Loader2 className="w-8 h-8 text-[#FF5500] animate-spin" />
            </div>
        );
    }

    if (!kullanici || !kullaniciProfile?.is_admin) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
