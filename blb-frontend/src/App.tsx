import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import ManageStore from './pages/admin/ManageStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Missions from './pages/Missions';
import Store from './pages/Store';
import PendingMissions from './pages/admin/PendingMissions';
import CreateMission from './pages/admin/CreateMission';
import Profile from './pages/Profile';
import ManageUsers from './pages/admin/ManageUsers';
import Transactions from './pages/admin/Transactions';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
        <Route
          path="/missoes"
          element={isAuthenticated ? <Missions /> : <Navigate to="/login" />}
        />
        <Route
          path="/loja"
          element={isAuthenticated ? <Store /> : <Navigate to="/login" />}
        />
        {/* Rotas Exclusivas da Diretoria */}
        <Route
          path="/admin/validar"
          element={isAuthenticated && user?.role === 'admin' ? <PendingMissions /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/admin/nova-missao"
          element={isAuthenticated && user?.role === 'admin' ? <CreateMission /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/admin/loja"
          element={isAuthenticated && user?.role === 'admin' ? <ManageStore /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/admin/loja/compras"
          element={isAuthenticated && user?.role === 'admin' ? <Transactions /> : <Navigate to="/dashboard" />}
        />
        <Route path="/perfil" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />


        <Route path="/admin/usuarios" element={isAuthenticated && user?.role === 'admin' ? <ManageUsers /> : <Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;