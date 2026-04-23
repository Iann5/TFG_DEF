import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserPhotoKey } from '../utils/authUtils';
import api from '../services/api';
import type { UserData } from '../types/perfil';

import Navbar from '../components/Navbar';
import FotoPerfil from '../components/perfil/FotoPerfil';
import EditarPanel from '../components/perfil/EditarPanel';
import PanelUsuario from '../components/perfil/PanelUsuario';
import PanelTrabajador from '../components/perfil/PanelTrabajador';
import PanelAdmin from '../components/perfil/PanelAdmin';
import PanelPedidos from '../components/perfil/PanelPedidos';
import ModalCambio from '../components/perfil/ModalCambio';

type ModalType = 'email' | 'telefono' | 'password' | null;

export default function Perfil() {
    const navigate = useNavigate();
    const { hasRole, isLoggedIn, refreshAuth } = useAuth();

    const [userData, setUserData] = useState<UserData | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalType>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [loading, setLoading] = useState(true);

    const isAdmin = hasRole('ROLE_ADMIN');
    const isTrabajador = hasRole('ROLE_TRABAJADOR');

    // Cargar datos del usuario
    useEffect(() => {
        if (!isLoggedIn) { navigate('/login'); return; }

        api.get('/me')
            .then(res => {
                setUserData(res.data);
                const localKey = getUserPhotoKey();
                setPhoto(res.data.foto_perfil || (localKey ? localStorage.getItem(localKey) : null));
            })
            .catch(() => {
                const localKey = getUserPhotoKey();
                setPhoto(localKey ? localStorage.getItem(localKey) : null);
            })
            .finally(() => setLoading(false));
    }, [isLoggedIn, navigate]);

    // Cerrar sesión
    const handleLogout = () => {
        const photoKey = getUserPhotoKey();
        if (photoKey) localStorage.removeItem(photoKey);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        window.dispatchEvent(new Event('storage'));
        refreshAuth();
        navigate('/');
    };

    // Cambiar campo del usuario
    const handleCambiarCampo = async (campo: string, valor: string) => {
        if (!userData?.id || !valor.trim()) return;
        try {
            await api.patch(`/users/${userData.id}`, { [campo]: valor }, {
                headers: { 'Content-Type': 'application/merge-patch+json' },
            });
            setUserData(prev => prev ? { ...prev, [campo]: valor } : prev);
        } catch {/* silencioso */ }
        setModal(null);
    };

    // Eliminar cuenta
    const handleEliminarCuenta = async () => {
        if (!userData?.id) return;
        try { await api.delete(`/users/${userData.id}`); } catch {/* silencioso */ }
        handleLogout();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <span className="material-symbols-outlined animate-spin text-primary text-5xl">refresh</span>
                <span className="font-label text-sm tracking-widest uppercase text-primary animate-pulse">Cargando Perfil...</span>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-[100dvh] bg-background bg-halftone relative flex flex-col pt-20">
                {/* Elemento de diseño de fondo */}
                <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col flex-1 px-6 py-10 max-w-6xl mx-auto w-full">

                    {/* Botón volver */}
                    <button onClick={() => navigate('/')} className="self-start text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 mb-8 font-label text-xs uppercase tracking-[0.2em]">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Volver al inicio
                    </button>

                    {/* Título de Cabecera */}
                    <div className="mb-12 border-l-4 border-primary pl-6">
                        <h1 className="text-4xl md:text-5xl font-headline font-black text-on-surface uppercase tracking-tight">
                            Panel <span className="text-primary italic">Personal</span>
                        </h1>
                        <p className="text-outline text-sm font-label tracking-widest uppercase mt-2">
                            {userData?.nombre} {userData?.apellidos}
                        </p>
                    </div>

                    {/* Foto */}
                    <div className="mb-10">
                        <FotoPerfil photo={photo} userId={userData?.id ?? null} onPhotoChange={setPhoto} />
                    </div>

                    {/* Contenido: dos columnas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                        {/* Panel izquierdo según rol */}
                        <div className="bg-surface-container/60 backdrop-blur-xl border border-outline-variant/30 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8">
                            {isAdmin && <PanelAdmin />}
                            {!isAdmin && isTrabajador && (
                                <PanelTrabajador
                                    estilosIniciales={userData?.estilos ?? []}
                                    descripcionInicial={userData?.descripcion ?? ''}
                                    tarifasIniciales={userData?.tarifas ?? []}
                                    trabajadorId={userData?.trabajadorId}
                                />
                            )}
                            {!isAdmin && !isTrabajador && <PanelUsuario userId={userData?.id ?? null} />}
                        </div>

                        {/* Panel derecho: editar (igual para todos) */}
                        <div className="bg-surface-container/60 backdrop-blur-xl border border-outline-variant/30 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8">
                            <EditarPanel
                                userData={userData}
                                onCambiar={campo => setModal(campo as ModalType)}
                                onLogout={handleLogout}
                                onEliminar={() => setConfirmDelete(true)}
                            />
                        </div>
                    </div>

                    {/* Panel Inferior: Pedidos (visible para todos los roles) */}
                    <div className="mt-8 bg-surface-container/60 backdrop-blur-xl border border-outline-variant/30 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8">
                        <PanelPedidos userId={userData?.id ?? null} />
                    </div>
                </div>

                {/* Modales de cambio de campo */}
                {modal === 'email' && <ModalCambio titulo="CAMBIAR EMAIL" tipo="email" placeholder="NUEVO@EMAIL.COM" onConfirm={v => handleCambiarCampo('email', v)} onClose={() => setModal(null)} />}
                {modal === 'telefono' && <ModalCambio titulo="CAMBIAR TELÉFONO" tipo="tel" placeholder="6XX XXX XXX" onConfirm={v => handleCambiarCampo('telefono', v)} onClose={() => setModal(null)} />}
                {modal === 'password' && <ModalCambio titulo="CAMBIAR CONTRASEÑA" tipo="password" placeholder="NUEVA CONTRASEÑA" onConfirm={v => handleCambiarCampo('password', v)} onClose={() => setModal(null)} />}

                {/* Modal confirmar eliminar cuenta */}
                {confirmDelete && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                        <div className="bg-surface-container-highest border border-error/50 shadow-2xl rounded-md p-10 w-full max-w-sm text-center">
                            <h3 className="text-error text-2xl font-headline font-black uppercase tracking-tight mb-4">¿Eliminar Cuenta?</h3>
                            <p className="text-on-surface-variant font-body text-sm mb-8 leading-relaxed">
                                Esta acción es <strong className="text-on-surface">irreversible</strong>. Todos tus datos, reservas y configuraciones desaparecerán para siempre.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button onClick={handleEliminarCuenta} className="w-full bg-error/10 hover:bg-error text-error hover:text-on-error border border-error/30 font-label tracking-widest text-xs uppercase py-3 transition-all rounded-sm flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">delete_forever</span>
                                    Sí, eliminar definitivamente
                                </button>
                                <button onClick={() => setConfirmDelete(false)} className="w-full bg-surface-container hover:bg-surface-container-low text-on-surface font-label tracking-widest text-xs uppercase py-3 transition-all border border-outline-variant/30 rounded-sm">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
