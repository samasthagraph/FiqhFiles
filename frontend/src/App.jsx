import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AskPage from './pages/AskPage';
import FatwasPage from './pages/FatwasPage';
import FatwaDetail from './pages/FatwaDetail';

const FatwaRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/masala/${id}`} replace />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans text-secondary bg-slate-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/ask" element={<AskPage />} />
          <Route path="/fatwas" element={<Navigate to="/masalas" replace />} />
          <Route path="/fatwa/:id" element={<FatwaRedirect />} />
          <Route path="/masalas" element={<FatwasPage />} />
          <Route path="/masala" element={<FatwasPage />} />
          <Route path="/masala/:id" element={<FatwaDetail />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
