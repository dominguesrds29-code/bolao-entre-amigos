import { useBets } from '../context/BetContext';

export function Header() {
  const { user, logout } = useBets();
  
  return (
    <header className="header">
      <h1 className="logo">Copa<span>2026</span> Bolão</h1>
      <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {user && (
          <>
            <img 
              src={user.photoURL || 'https://via.placeholder.com/32'} 
              alt="Avatar" 
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{user.displayName?.split(' ')[0] || 'Usuário'}</span>
              <button 
                onClick={logout}
                style={{ background: 'transparent', border: 'none', color: 'var(--wc-red)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
              >Sair</button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
