import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Equipo from './pages/Equipo';
import Estilo from './pages/Estilo';
import Merchandising from './pages/Merchandising';
import OfertasYPacks from './pages/OfertasYPacks';
import ReservarCita from './pages/ReservarCita';
import Proyectos from './pages/Proyectos';
import Informacion from './pages/Informacion';
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
import GestionRoles from './pages/GestionRoles';
import Agenda from './pages/Agenda';
import VistaDia from './pages/VistaDia';
import ListaTrabajadoresAgenda from './pages/ListaTrabajadoresAgenda';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import PoliticasPrivacidad from './pages/PoliticasPrivacidad';
import Reembolso from './pages/Reembolso';
import Buscar from './pages/Buscar';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ─── Rutas públicas (accesibles por todos) ─── */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path='/equipo' element={<Equipo />} />
        <Route path='/estilos' element={<Estilo />} />
        <Route path='/merchandising' element={<Merchandising />} />
        <Route path='/ofertasYpacks' element={<OfertasYPacks />} />
        <Route path='/proyecto' element={<Proyectos />} />
        <Route path='/proyecto/:id' element={<DetalleProyecto />} />
        <Route path='/merchandising/:id' element={<DetalleProducto />} />
        <Route path='/informacion' element={<Informacion />} />
        <Route path='/plantillasDemandadas' element={<PlantillasDemandadas />} />
        <Route path='/ProyectosMasGustados' element={<ProyectosMasGustados />} />
        <Route path='/carrito' element={<Carrito />} />
        <Route path="/merchandising/pack/:id" element={<DetallePack />} />
        <Route path="/privacidad" element={<PoliticasPrivacidad />} />
        <Route path="/reembolso" element={<Reembolso />} />
        <Route path="/buscar" element={<Buscar />} />

        {/* ─── Rutas para todos los usuarios autenticados ─── */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_TRABAJADOR', 'ROLE_ADMIN']} />}>
          <Route path='/perfil' element={<Perfil />} />
          <Route path='/cita' element={<ReservarCita />} />
          <Route path='/checkout' element={<Checkout />} />
        </Route>

        {/* ─── Rutas para Trabajador y Admin ─── */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_TRABAJADOR', 'ROLE_ADMIN']} />}>
          <Route path='/crearEstilo' element={<FormularioEstilo />} />
          <Route path='/editarEstilo/:id' element={<FormularioEstilo />} />
          <Route path='/addTatuaje' element={<AddTatuaje />} />
          <Route path='/editarProyecto/:id' element={<AddTatuaje />} />
          <Route path='/addProducto' element={<AddProducto />} />
          <Route path='/editarProducto/:id' element={<AddProducto />} />
          <Route path='/crearPack' element={<CrearPack />} />
          <Route path='/editarPack/:id' element={<CrearPack />} />
          <Route path='/agenda' element={<Agenda />} />
          <Route path='/agenda/:trabajadorId' element={<Agenda />} />
          <Route path='/agenda/dia/:fecha' element={<VistaDia />} />
          <Route path='/agenda/:trabajadorId/dia/:fecha' element={<VistaDia />} />
        </Route>

        {/* ─── Rutas solo para Admin ─── */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path='/admin/agenda' element={<ListaTrabajadoresAgenda />} />
          <Route path='/historial' element={<Historial />} />
          <Route path='/gestionRoles' element={<GestionRoles />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
