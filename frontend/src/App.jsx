import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AskPage from './pages/AskPage';
import FatwasPage from './pages/FatwasPage';
import FatwaDetail from './pages/FatwaDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans text-secondary bg-slate-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/ask" element={<AskPage />} />
          <Route path="/fatwas" element={<FatwasPage />} />
          <Route path="/fatwa/:id" element={<FatwaDetail />} />
          <Route path="/masalas" element={<FatwasPage />} />
          <Route path="/masala/:id" element={<FatwaDetail />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
