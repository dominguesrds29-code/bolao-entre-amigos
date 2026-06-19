import { createContext, useContext, useState, useEffect } from 'react';
import { calculateScore } from '../data/matches';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const BetContext = createContext();

export function BetProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('user');
  
  const [bets, setBets] = useState({});
  const [realResults, setRealResults] = useState({});

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user document to get role
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setRole(userSnap.data().role || 'user');
        } else {
          await setDoc(userRef, {
            email: currentUser.email,
            name: currentUser.displayName,
            role: 'user'
          });
          setRole('user');
        }

        // Fetch user's bets
        const betsRef = doc(db, 'bets', currentUser.uid);
        const betsSnap = await getDoc(betsRef);
        if (betsSnap.exists()) {
          setBets(betsSnap.data().matches || {});
        } else {
          setBets({});
        }
      } else {
        setRole('user');
        setBets({});
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to real results continuously
  useEffect(() => {
    const resultsRef = doc(db, 'system', 'real_results');
    const unsubscribeResults = onSnapshot(resultsRef, (docSnap) => {
      if (docSnap.exists()) {
        setRealResults(docSnap.data().matches || {});
      } else {
        setRealResults({});
      }
    });
    return () => unsubscribeResults();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const saveBet = async (matchId, homeScore, awayScore) => {
    if (!user) return;
    
    const updatedBets = {
      ...bets,
      [matchId]: { home: homeScore, away: awayScore }
    };
    
    setBets(updatedBets);
    
    const betsRef = doc(db, 'bets', user.uid);
    await setDoc(betsRef, { matches: updatedBets }, { merge: true });
  };

  const getBet = (matchId) => {
    return bets[matchId] || { home: '', away: '' };
  };

  const getScore = (matchId) => {
    const bet = bets[matchId];
    const real = realResults[matchId];
    if (!bet || !real || bet.home === '' || bet.away === '') return null; 
    
    return calculateScore(bet.home, bet.away, real.home, real.away);
  };

  const totalScore = Object.keys(bets).reduce((acc, matchId) => {
    return acc + (getScore(matchId) || 0);
  }, 0);

  return (
    <BetContext.Provider value={{ 
      user, loading, role, loginWithGoogle, logout,
      bets, saveBet, getBet, getScore, totalScore, realResults 
    }}>
      {!loading && children}
    </BetContext.Provider>
  );
}

export function useBets() {
  return useContext(BetContext);
}
