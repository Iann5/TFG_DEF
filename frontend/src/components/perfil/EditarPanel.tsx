import type { UserData } from '../../types/perfil';

type ModalType = 'email' | 'telefono' | 'password';

interface Props {
    userData: UserData | null;
    onCambiar: (campo: ModalType) => void;
    onLogout: () => void;
    onEliminar: () => void;
}

export default function EditarPanel({ userData, onCambiar, onLogout, onEliminar }: Props) {
    return (
        <div className="bg-slate-700/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-3xl font-bold text-white mb-1">Editar</h2>
            <hr className="border-white/40 mb-2" />

            {/* Teléfono */}
            <div className="flex items-center gap-3 bg-slate-600/50 rounded-lg px-4 py-3 border border-white/10">
                <span className="text-white/80 text-sm flex-1 truncate">
                    {userData?.telefono ? `+34 ${userData.telefono.slice(0, 6)}....` : 'Sin teléfono'}
                </span>
                <button
                    onClick={() => onCambiar('telefono')}
                    className="bg-slate-500 hover:bg-slate-400 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition shrink-0"
                >
                    Cambiar Teléfono
                </button>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 bg-slate-600/50 rounded-lg px-4 py-3 border border-white/10">
                <span className="text-white/80 text-sm flex-1 truncate">
                    {userData?.email ?? 'Sin email'}
                </span>
                <button
                    onClick={() => onCambiar('email')}
                    className="bg-slate-500 hover:bg-slate-400 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition shrink-0"
                >
                    Cambiar Email
                </button>
            </div>

            {/* Contraseña */}
            <div className="flex items-center gap-3 bg-slate-600/50 rounded-lg px-4 py-3 border border-white/10">
                <span className="text-white/80 text-sm flex-1">••••••••••••••</span>
                <button
                    onClick={() => onCambiar('password')}
                    className="bg-slate-500 hover:bg-slate-400 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition shrink-0"
                >
                    Cambiar Contraseña
                </button>
            </div>

            <div className="flex-1" />

            {/* Cerrar sesión */}
            <button
                onClick={onLogout}
                className="w-full bg-blue-800 hover:bg-blue-900 border-2 border-blue-500 text-white font-bold py-3.5 rounded-xl transition text-base"
            >
                Cerrar Sesión
            </button>

            {/* Eliminar cuenta */}
            <button
                onClick={onEliminar}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition text-base"
            >
                Eliminar Cuenta
            </button>
        </div>
    );
}
