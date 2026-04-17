import { useNavigate } from 'react-router-dom';

const ADMIN_BUTTONS = [
    { label: 'Historial / Base de Datos', route: '/historial', icon: 'database' },
    { label: 'Gestión de Roles', route: '/gestionRoles', icon: 'admin_panel_settings' },
    { label: 'Agenda Global', route: '/admin/agenda', icon: 'event_note' },
];

export default function PanelAdmin() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-5 h-full">
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">shield_person</span>
                Administración
            </h2>
            <div className="w-full h-px bg-outline-variant/30 mb-2"></div>
            
            <div className="space-y-3">
                {ADMIN_BUTTONS.map(btn => (
                    <button
                        key={btn.route}
                        onClick={() => navigate(btn.route)}
                        className="w-full bg-surface-container-highest/50 hover:bg-surface-container border border-outline-variant/20 hover:border-primary text-on-surface font-label tracking-widest text-xs uppercase py-4 px-5 rounded-sm transition-all flex items-center justify-between group shadow-sm hover:shadow-[0_4px_15px_rgba(173,198,255,0.1)]"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#8c909f] group-hover:text-primary transition-colors text-lg">{btn.icon}</span>
                            <span>{btn.label}</span>
                        </div>
                        <span className="material-symbols-outlined text-outline group-hover:text-primary transition-all group-hover:translate-x-1 text-sm">arrow_forward</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
