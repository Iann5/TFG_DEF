import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Equipo from './pages/Equipo';
import Estilo from './pages/Estilo';
import Merchandising from './pages/Merchandising';
import OfertasYPacks from './pages/OfertasYPacks';
import PedirCita from './pages/PedirCita';
import Proyectos from './pages/Proyectos';
import Informacion from './pages/Informacion';
//import CrearEstilo from './pages/Estilos/FormularioEstilo';
//import EditarEstilo from './pages/Estilos/FormularioEstilo';
import AddTatuaje from './pages/AddTatuaje';
import AddProducto from './pages/AddProducto';
import CrearPack from './pages/CrearPack';
import Historial from './pages/Historial';
import Perfil from './pages/Perfil';
import PlantillasDemandadas from './pages/PlantillasDemandadas';
import ProyectosMasGustados from './pages/ProyectosMasGustados';
import FormularioEstilo from './pages/FormularioEstilo';
import DetalleProyecto from './pages/DetalleProyecto';
import DetalleProducto from './pages/DetalleProducto';
import DetallePack from './pages/DetallePack';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ─── Rutas públicas (accesibles por todos) ─── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path='/equipo' element={<Equipo />} />
          <Route path='/estilos' element={<Estilo />} />
          <Route path='/merchandising' element={<Merchandising />} />
          <Route path='/ofertasYpacks' element={<OfertasYPacks />} />
          <Route path='/cita' element={<PedirCita />} />
          <Route path='/proyecto' element={<Proyectos />} />
          <Route path='/proyecto/:id' element={<DetalleProyecto />} />
          <Route path='/merchandising/:id' element={<DetalleProducto />} />
          <Route path='/informacion' element={<Informacion />} />
          <Route path='/plantillasDemandadas' element={<PlantillasDemandadas />} />
          <Route path='/ProyectosMasGustados' element={<ProyectosMasGustados />} />
          <Route path="/merchandising/pack/:id" element={<DetallePack />} />

          {/* ─── Rutas para todos los usuarios autenticados ─── */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_TRABAJADOR', 'ROLE_ADMIN']} />}>
            <Route path='/perfil' element={<Perfil />} />
          </Route>

          {/* ─── Rutas para Trabajador y Admin ─── */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_TRABAJADOR', 'ROLE_ADMIN']} />}>
            <Route path='/crearEstilo' element={<FormularioEstilo />} />
            <Route path='/editarEstilo/:id' element={<FormularioEstilo />} />
            <Route path='/addTatuaje' element={<AddTatuaje />} />
            <Route path='/addProducto' element={<AddProducto />} />
            <Route path='/crearPack' element={<CrearPack />} />
          </Route>

          {/* ─── Rutas solo para Admin ─── */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route path='/historial' element={<Historial />} />
            <Route path='/gestionRoles' element={<div className="p-8 text-white">Gestión de Roles (Admin)</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
