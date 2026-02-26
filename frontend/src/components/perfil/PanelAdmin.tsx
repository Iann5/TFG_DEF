import { useNavigate } from 'react-router-dom';

const ADMIN_BUTTONS = [
    { label: 'Historial', route: '/historial', color: 'bg-orange-300 hover:bg-orange-400 text-gray-900' },
    { label: 'Gestión Roles', route: '/gestionRoles', color: 'bg-orange-300 hover:bg-orange-400 text-gray-900' },
    { label: 'Agenda', route: '/agenda', color: 'bg-orange-300 hover:bg-orange-400 text-gray-900' },
];

export default function PanelAdmin() {
    const navigate = useNavigate();

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-1">Administración</h2>
            <hr className="border-white/40 mb-4" />
            <div className="space-y-3">
                {ADMIN_BUTTONS.map(btn => (
                    <button
                        key={btn.route}
                        onClick={() => navigate(btn.route)}
                        className={`w-full font-bold py-3.5 rounded-lg transition text-sm ${btn.color}`}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
