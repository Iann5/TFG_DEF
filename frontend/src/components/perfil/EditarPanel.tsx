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
        <div className="flex flex-col gap-5 h-full">
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">manage_accounts</span>
                Ajustes de Cuenta
            </h2>
            <div className="w-full h-px bg-outline-variant/30 mb-2"></div>

            {/* Teléfono */}
            <div className="flex items-center gap-4 bg-surface-container-highest/50 rounded-sm px-5 py-4 border border-outline-variant/20 hover:border-primary/50 transition-colors group">
                <div className="flex-1 min-w-0">
                    <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#8c909f] mb-1">Teléfono</p>
                    <p className="text-on-surface text-sm font-body truncate">
                        {userData?.telefono ? `+34 ${userData.telefono.slice(0, 6)}•••` : 'No especificado'}
                    </p>
                </div>
                <button
                    onClick={() => onCambiar('telefono')}
                    className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
                    title="Cambiar Teléfono"
                >
                    <span className="material-symbols-outlined text-sm">edit</span>
                </button>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 bg-surface-container-highest/50 rounded-sm px-5 py-4 border border-outline-variant/20 hover:border-primary/50 transition-colors group">
                <div className="flex-1 min-w-0">
                    <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#8c909f] mb-1">Correo Electrónico</p>
                    <p className="text-on-surface text-sm font-body truncate">
                        {userData?.email ?? 'No especificado'}
                    </p>
                </div>
                <button
                    onClick={() => onCambiar('email')}
                    className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
                    title="Cambiar Email"
                >
                    <span className="material-symbols-outlined text-sm">edit</span>
                </button>
            </div>

            {/* Contraseña */}
            <div className="flex items-center gap-4 bg-surface-container-highest/50 rounded-sm px-5 py-4 border border-outline-variant/20 hover:border-primary/50 transition-colors group">
                <div className="flex-1 min-w-0">
                    <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#8c909f] mb-1">Contraseña</p>
                    <p className="text-on-surface text-sm font-body tracking-[0.3em]">
                        ••••••••
                    </p>
                </div>
                <button
                    onClick={() => onCambiar('password')}
                    className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
                    title="Cambiar Contraseña"
                >
                    <span className="material-symbols-outlined text-sm">edit</span>
                </button>
            </div>

            <div className="flex-1" />

            {/* Cerrar sesión */}
            <button
                onClick={onLogout}
                className="w-full mt-4 bg-surface-container hover:bg-surface-container-low text-on-surface border border-outline-variant/30 font-label tracking-widest text-xs uppercase py-3.5 rounded-sm transition-all flex items-center justify-center gap-2 hover:border-on-surface"
            >
                <span className="material-symbols-outlined text-sm">logout</span>
                Cerrar Sesión
            </button>

            {/* Eliminar cuenta */}
            <button
                onClick={onEliminar}
                className="w-full bg-error/10 hover:bg-error text-error hover:text-on-error border border-error/30 font-label tracking-widest text-xs uppercase py-3.5 rounded-sm transition-all flex items-center justify-center gap-2 mt-2"
            >
                Eliminar Cuenta Definitivamente
            </button>
        </div>
    );
}
