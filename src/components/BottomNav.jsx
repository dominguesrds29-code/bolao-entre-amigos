import { NavLink } from 'react-router-dom'
import { useBets } from '../context/BetContext';

export function BottomNav() {
  const { role } = useBets();
  
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} end>
        <div className="icon">🏠</div>
        <span>Home</span>
      </NavLink>
      
      <NavLink to="/palpites" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
        <div className="icon">⚽</div>
        <span>Palpites</span>
      </NavLink>
      
      <NavLink to="/tabelas" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
        <div className="icon">📊</div>
        <span>Tabelas</span>
      </NavLink>
      
      <NavLink to="/ranking" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
        <div className="icon">🏆</div>
        <span>Ranking</span>
      </NavLink>
      
      {role === 'admin' && (
        <NavLink to="/admin" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <div className="icon">⚙️</div>
          <span>Admin</span>
        </NavLink>
      )}
    </nav>
  )
}
