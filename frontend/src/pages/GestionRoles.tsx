import Navbar from '../components/Navbar';
import { useGestionRoles } from '../hooks/useGestionRoles';

export default function GestionRoles() {
  const {
    navigate,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    filteredUsers,
    handleRoleChange
  } = useGestionRoles();

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
      {/* Texture overlay */}
      <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />

        <main className="flex-grow pt-32 pb-20 relative z-10 px-4 md:px-8 max-w-[1200px] w-full mx-auto">
          {/* Header */}
          <div className="mb-12">
            <button
              onClick={() => navigate('/perfil')}
              className="flex items-center gap-2 text-outline hover:text-primary font-label text-[10px] uppercase tracking-widest mb-10 transition-colors group w-fit"
            >
              <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Volver
            </button>
            
            <div className="flex flex-col gap-2 border-b border-outline-variant/20 pb-8 relative">
              <span className="font-label text-primary text-[10px] uppercase tracking-[0.3em] block">
                Panel de Administración
              </span>
              <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-wide leading-none flex items-center gap-4">
                Gestión de Roles
                <span className="material-symbols-outlined text-primary text-4xl mb-1">manage_accounts</span>
              </h1>
            </div>
          </div>

          {/* Filters */}
          <div className="glass-panel p-6 md:p-8 mb-12 flex flex-col md:flex-row gap-6 relative overflow-hidden">
            <div className="flex-1 relative space-y-2 z-10">
              <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                Buscar Usuario
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-[20px] pointer-events-none">search</span>
                <input
                  type="text"
                  placeholder="Nombre o apellido..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/30 text-on-surface font-body pl-12 pr-4 py-3 focus:outline-none focus:border-primary transition-colors placeholder:text-outline-variant/50 rounded-sm"
                />
              </div>
            </div>
            
            <div className="w-full md:w-[280px] relative space-y-2 z-10">
              <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                Filtrar por Rol
              </label>
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/30 text-on-surface font-label text-sm uppercase pl-4 pr-10 py-3 focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer rounded-sm"
                >
                  <option value="ALL">Todos</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="TRABAJADOR">Trabajador</option>
                  <option value="USER">Cliente</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none text-[20px]">filter_list</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel overflow-hidden relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 opacity-70">
                <span className="material-symbols-outlined text-primary text-5xl animate-spin mb-6">refresh</span>
                <p className="font-label text-xs uppercase tracking-widest text-outline">Cargando Usuarios...</p>
              </div>
            ) : error ? (
              <div className="bg-error/10 border-b border-error/30 p-8 flex flex-col items-center justify-center py-20">
                  <span className="material-symbols-outlined text-error text-6xl mb-4">error</span>
                  <span className="font-headline text-xl uppercase tracking-widest text-error mb-2">¡Error!</span>
                  <p className="font-body text-sm text-error/80">{error}</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center opacity-70">
                  <span className="material-symbols-outlined text-outline-variant text-5xl mb-4">group_off</span>
                  <p className="font-label text-xs uppercase tracking-widest text-outline">No se encontraron usuarios.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-outline-variant/30 bg-surface-container/50">
                      <th className="px-6 py-5 text-xs text-primary font-label uppercase tracking-[0.2em] whitespace-nowrap">Usuario</th>
                      <th className="px-6 py-5 text-xs text-primary font-label uppercase tracking-[0.2em] whitespace-nowrap">Email</th>
                      <th className="px-6 py-5 text-xs text-primary font-label uppercase tracking-[0.2em] whitespace-nowrap">DNI</th>
                      <th className="px-6 py-5 text-xs text-primary font-label uppercase tracking-[0.2em] text-right whitespace-nowrap">Rol de Sistema</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-outline-variant/20">
                    {filteredUsers.map(u => {
                      const currentRole = u.roles.includes('ROLE_ADMIN') 
                        ? 'ROLE_ADMIN' 
                        : u.roles.includes('ROLE_TRABAJADOR') 
                          ? 'ROLE_TRABAJADOR' 
                          : 'ROLE_USER';

                      // Determinar color de select basado en rol
                      let selectStyle = "border-outline-variant/30 text-on-surface hover:border-primary/50";
                      if (currentRole === 'ROLE_ADMIN') {
                          selectStyle = "border-primary text-primary bg-primary/5";
                      } else if (currentRole === 'ROLE_TRABAJADOR') {
                          selectStyle = "border-secondary-container/50 text-secondary-container bg-secondary-container/5";
                      }

                      return (
                        <tr key={u.id} className="hover:bg-surface-container/40 transition-colors group">
                          <td className="px-6 py-5">
                            <span className="font-headline font-bold text-base text-on-surface uppercase tracking-wide">
                                {u.nombre} {u.apellidos}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-on-surface-variant font-body text-sm">
                            {u.email}
                          </td>
                          <td className="px-6 py-5 text-on-surface-variant font-body text-sm">
                            {u.dni || <span className="text-outline text-xs uppercase tracking-wider font-label opacity-70">No Especificado</span>}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="relative inline-block w-40">
                                <select
                                  value={currentRole}
                                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                  className={`w-full appearance-none bg-surface-container shrink-0 border px-4 py-2 font-label text-[10px] uppercase tracking-widest focus:outline-none transition-colors cursor-pointer rounded-sm pr-8 ${selectStyle}`}
                                >
                                  <option value="ROLE_USER">Cliente</option>
                                  <option value="ROLE_TRABAJADOR">Trabajador</option>
                                  <option value="ROLE_ADMIN">Administrador</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none opacity-50">expand_more</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
