import { useQuery } from '@tanstack/react-query';

const fetchDashboardMetrics = async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const [resAudit, resMaq, resIns, resMant, resRep, resTurno] = await Promise.all([
        fetch(`${apiUrl}/auditorias/summary`, { headers }),
        fetch(`${apiUrl}/maquinarias/summary`, { headers }),
        fetch(`${apiUrl}/api/insumos/dashboard-summary`, { headers }),
        fetch(`${apiUrl}/api/mantenimientos/dashboard`, { headers }),
        fetch(`${apiUrl}/reportes/summary`, { headers }),
        fetch(`${apiUrl}/api/turnos/actual`, { headers })
    ]);

    if (!resAudit.ok || !resMaq.ok || !resIns.ok || !resMant.ok || !resRep.ok || !resTurno.ok) {
        throw new Error('Error fetching dashboard data');
    }

    return {
        auditorias: await resAudit.json(),
        maquinarias: await resMaq.json(),
        insumos: await resIns.json(),
        mantenimientos: await resMant.json(),
        reportes: await resRep.json(),
        turno: await resTurno.json()
    };
};

export const useDashboardMetrics = (user) => {
    return useQuery({
        queryKey: ['dashboardMetrics'],
        queryFn: fetchDashboardMetrics,
        enabled: !!user, // Only run if user is logged in
        staleTime: 1000 * 60 * 5, // Data remains fresh for 5 minutes
        refetchOnWindowFocus: false,
    });
};
