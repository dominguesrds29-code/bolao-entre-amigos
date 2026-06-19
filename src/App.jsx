import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { Home } from './pages/Home'
import { Palpites } from './pages/Palpites'
import { Tabelas } from './pages/Tabelas'
import { Ranking } from './pages/Ranking'
import { Login } from './pages/Login'
import { Admin } from './pages/Admin'
import { BetProvider, useBets } from './context/BetContext'

function ProtectedRoute({ children }) {
  const { user } = useBets();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppContent() {
  const { user } = useBets();
  
  return (
    <div className="app-container">
      {user && <Header />}
      
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/palpites" element={<ProtectedRoute><Palpites /></ProtectedRoute>} />
          <Route path="/tabelas" element={<ProtectedRoute><Tabelas /></ProtectedRoute>} />
          <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        </Routes>
      </main>
      
      {user && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <BetProvider>
      <Router>
        <AppContent />
      </Router>
    </BetProvider>
  )
}

export default App
