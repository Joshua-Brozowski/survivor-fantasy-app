import React, { useState, useEffect } from 'react';
import { Users, Trophy, Flame, Mail, User, LogOut, Settings, ChevronRight, Crown, Target, FileText, Zap } from 'lucide-react';
import { storage } from './db.js';

// Survivor 48 Cast
const SURVIVOR_48_CAST = [
  { id: 1, name: "Alyssa Bellman", tribe: "Manu", image: "https://static.wikia.nocookie.net/survivor/images/thumb/e/e5/S48_Alyssa_Bellman.jpg/250px-S48_Alyssa_Bellman.jpg" },
  { id: 2, name: "Brooklyn Rivera", tribe: "Manu", image: "https://static.wikia.nocookie.net/survivor/images/thumb/0/04/S48_Brooklyn_Rivera.jpg/250px-S48_Brooklyn_Rivera.jpg" },
  { id: 3, name: "Christine Bernier", tribe: "Manu", image: "https://static.wikia.nocookie.net/survivor/images/thumb/a/ab/S48_Christine_Bernier.jpg/250px-S48_Christine_Bernier.jpg" },
  { id: 4, name: "David Kinne", tribe: "Manu", image: "https://static.wikia.nocookie.net/survivor/images/thumb/5/58/S48_David_Kinne.jpg/250px-S48_David_Kinne.jpg" },
  { id: 5, name: "Kamilla Salah-Ud-Din", tribe: "Manu", image: "https://static.wikia.nocookie.net/survivor/images/thumb/f/f3/S48_Kamilla_Salah-Ud-Din.jpg/250px-S48_Kamilla_Salah-Ud-Din.jpg" },
  { id: 6, name: "Mitch McKenzie", tribe: "Manu", image: "https://static.wikia.nocookie.net/survivor/images/thumb/6/60/S48_Mitch_McKenzie.jpg/250px-S48_Mitch_McKenzie.jpg" },
  { id: 7, name: "Aysha Camarena", tribe: "Loto", image: "https://static.wikia.nocookie.net/survivor/images/thumb/b/b9/S48_Aysha_Camarena.jpg/250px-S48_Aysha_Camarena.jpg" },
  { id: 8, name: "Jerome Mojica", tribe: "Loto", image: "https://static.wikia.nocookie.net/survivor/images/thumb/a/a1/S48_Jerome_Mojica.jpg/250px-S48_Jerome_Mojica.jpg" },
  { id: 9, name: "Joe Hunter", tribe: "Loto", image: "https://static.wikia.nocookie.net/survivor/images/thumb/e/e8/S48_Joe_Hunter.jpg/250px-S48_Joe_Hunter.jpg" },
  { id: 10, name: "Mary Bill", tribe: "Loto", image: "https://static.wikia.nocookie.net/survivor/images/thumb/1/1f/S48_Mary_Bill.jpg/250px-S48_Mary_Bill.jpg" },
  { id: 11, name: "Shauhin Davari", tribe: "Loto", image: "https://static.wikia.nocookie.net/survivor/images/thumb/2/2c/S48_Shauhin_Davari.jpg/250px-S48_Shauhin_Davari.jpg" },
  { id: 12, name: "Tabitha Davis", tribe: "Loto", image: "https://static.wikia.nocookie.net/survivor/images/thumb/d/d0/S48_Tabitha_Davis.jpg/250px-S48_Tabitha_Davis.jpg" },
  { id: 13, name: "Hannah Rose", tribe: "Moana", image: "https://static.wikia.nocookie.net/survivor/images/thumb/b/bf/S48_Hannah_Rose.jpg/250px-S48_Hannah_Rose.jpg" },
  { id: 14, name: "Kendra McQuarrie", tribe: "Moana", image: "https://static.wikia.nocookie.net/survivor/images/thumb/7/73/S48_Kendra_McQuarrie.jpg/250px-S48_Kendra_McQuarrie.jpg" },
  { id: 15, name: "Kishori Senanayake", tribe: "Moana", image: "https://static.wikia.nocookie.net/survivor/images/thumb/5/5e/S48_Kishori_Senanayake.jpg/250px-S48_Kishori_Senanayake.jpg" },
  { id: 16, name: "Marco Zecchinato", tribe: "Moana", image: "https://static.wikia.nocookie.net/survivor/images/thumb/0/0f/S48_Marco_Zecchinato.jpg/250px-S48_Marco_Zecchinato.jpg" },
  { id: 17, name: "Silas Hearndon", tribe: "Moana", image: "https://static.wikia.nocookie.net/survivor/images/thumb/a/ad/S48_Silas_Hearndon.jpg/250px-S48_Silas_Hearndon.jpg" },
  { id: 18, name: "Steven Lim", tribe: "Moana", image: "https://static.wikia.nocookie.net/survivor/images/thumb/c/c8/S48_Steven_Lim.jpg/250px-S48_Steven_Lim.jpg" }
];

const INITIAL_PLAYERS = [
  { id: 1, name: "Joshua", phone: "1234567890", isAdmin: true },
  { id: 2, name: "Charlie", phone: "1234567891", isAdmin: false },
  { id: 3, name: "Emma", phone: "1234567892", isAdmin: false },
  { id: 4, name: "Tyler", phone: "1234567893", isAdmin: false },
  { id: 5, name: "Brayden", phone: "1234567894", isAdmin: false },
  { id: 6, name: "Dakota", phone: "1234567895", isAdmin: false },
  { id: 7, name: "Patia", phone: "1234567896", isAdmin: false },
  { id: 8, name: "Kaleigh", phone: "1234567897", isAdmin: false },
  { id: 9, name: "Sarah", phone: "1234567898", isAdmin: false }
];

export default function SurvivorFantasyApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginView, setLoginView] = useState('login');
  const [loginForm, setLoginForm] = useState({ name: '', password: '' });
  const [recoveryForm, setRecoveryForm] = useState({ phone: '', code: '' });
  const [showRecoveryCode, setShowRecoveryCode] = useState(false);
  
  // Game state
  const [players, setPlayers] = useState([]);
  const [contestants, setContestants] = useState([]);
  const [picks, setPicks] = useState([]);
  const [gamePhase, setGamePhase] = useState('instinct-picks');
  const [currentView, setCurrentView] = useState('dashboard');
  const [questionnaires, setQuestionnaires] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [qotWVotes, setQotWVotes] = useState([]);
  const [latePenalties, setLatePenalties] = useState({});
  const [pickScores, setPickScores] = useState([]);
  const [advantages, setAdvantages] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Load data from storage
  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      const playersData = await storage.get('players');
      const contestantsData = await storage.get('contestants');
      const picksData = await storage.get('picks');
      const gamePhaseData = await storage.get('gamePhase');
      const questionnairesData = await storage.get('questionnaires');
      const submissionsData = await storage.get('submissions');
      const qotWVotesData = await storage.get('qotWVotes');
      const latePenaltiesData = await storage.get('latePenalties');
      const pickScoresData = await storage.get('pickScores');
      const advantagesData = await storage.get('advantages');
      const episodesData = await storage.get('episodes');
      const notificationsData = await storage.get('notifications');

      setPlayers(playersData ? JSON.parse(playersData.value) : INITIAL_PLAYERS);
      setContestants(contestantsData ? JSON.parse(contestantsData.value) : SURVIVOR_48_CAST);
      setPicks(picksData ? JSON.parse(picksData.value) : []);
      setGamePhase(gamePhaseData ? gamePhaseData.value : 'instinct-picks');
      setQuestionnaires(questionnairesData ? JSON.parse(questionnairesData.value) : []);
      setSubmissions(submissionsData ? JSON.parse(submissionsData.value) : []);
      setQotWVotes(qotWVotesData ? JSON.parse(qotWVotesData.value) : []);
      setLatePenalties(latePenaltiesData ? JSON.parse(latePenaltiesData.value) : {});
      setPickScores(pickScoresData ? JSON.parse(pickScoresData.value) : []);
      setAdvantages(advantagesData ? JSON.parse(advantagesData.value) : []);
      setEpisodes(episodesData ? JSON.parse(episodesData.value) : []);
      setNotifications(notificationsData ? JSON.parse(notificationsData.value) : []);
    } catch (error) {
      // First time setup
      setPlayers(INITIAL_PLAYERS);
      setContestants(SURVIVOR_48_CAST);
      setPicks([]);
      setGamePhase('instinct-picks');
      
      await storage.set('players', JSON.stringify(INITIAL_PLAYERS));
      await storage.set('contestants', JSON.stringify(SURVIVOR_48_CAST));
      await storage.set('picks', JSON.stringify([]));
      await storage.set('gamePhase', 'instinct-picks');
      await storage.set('questionnaires', JSON.stringify([]));
      await storage.set('submissions', JSON.stringify([]));
      await storage.set('qotWVotes', JSON.stringify([]));
      await storage.set('latePenalties', JSON.stringify({}));
      await storage.set('pickScores', JSON.stringify([]));
      await storage.set('advantages', JSON.stringify([]));
      await storage.set('episodes', JSON.stringify([]));
      await storage.set('notifications', JSON.stringify([]));
    }
  };

  const handleLogin = async () => {
    if (!loginForm.name || !loginForm.password) {
      alert('Please enter both name and password');
      return;
    }

    const player = players.find(p => 
      p.name.toLowerCase() === loginForm.name.toLowerCase()
    );
    
    if (player) {
      try {
        const storedPassword = await storage.get(`password_${player.id}`);
        
        if (!storedPassword) {
          await storage.set(`password_${player.id}`, loginForm.password);
          setCurrentUser(player);
        } else if (storedPassword.value === loginForm.password) {
          setCurrentUser(player);
        } else {
          alert('Incorrect password');
        }
      } catch (error) {
        await storage.set(`password_${player.id}`, loginForm.password);
        setCurrentUser(player);
      }
    } else {
      alert('Player not found');
    }
  };

  const handleForgotPassword = async () => {
    const player = players.find(p => p.phone === recoveryForm.phone);
    if (player) {
      const code = Math.floor(100 + Math.random() * 900).toString();
      await storage.set(`recovery_${player.id}`, code);
      setShowRecoveryCode(true);
      alert(`Recovery code sent: ${code} (In production, this would be SMS)`);
    } else {
      alert('Phone number not found');
    }
  };

  const handleRecoveryLogin = async () => {
    const player = players.find(p => p.phone === recoveryForm.phone);
    if (player) {
      const storedCode = await storage.get(`recovery_${player.id}`);
      if (storedCode && storedCode.value === recoveryForm.code) {
        setCurrentUser(player);
        await storage.delete(`recovery_${player.id}`);
      } else {
        alert('Invalid recovery code');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ name: '', password: '' });
    setRecoveryForm({ phone: '', code: '' });
    setShowRecoveryCode(false);
  };

  const submitInstinctPick = async (contestantId) => {
    const newPick = {
      id: Date.now(),
      playerId: currentUser.id,
      contestantId,
      type: 'instinct',
      timestamp: Date.now()
    };
    
    const updatedPicks = [...picks.filter(p => !(p.playerId === currentUser.id && p.type === 'instinct')), newPick];
    setPicks(updatedPicks);
    await storage.set('picks', JSON.stringify(updatedPicks));
    alert('Instinct pick submitted!');
  };

  const submitFinalPick = async (contestantId) => {
    const newPick = {
      id: Date.now(),
      playerId: currentUser.id,
      contestantId,
      type: 'final',
      timestamp: Date.now()
    };
    
    const updatedPicks = [...picks.filter(p => !(p.playerId === currentUser.id && p.type === 'final')), newPick];
    setPicks(updatedPicks);
    await storage.set('picks', JSON.stringify(updatedPicks));
    alert('Final pick submitted!');
  };

  const getInstinctPicksStatus = () => {
    const instinctPicks = picks.filter(p => p.type === 'instinct');
    const playersWithPicks = new Set(instinctPicks.map(p => p.playerId));
    return {
      total: players.length,
      submitted: playersWithPicks.size,
      allSubmitted: playersWithPicks.size === players.length
    };
  };

  const getActiveContestants = () => {
    return contestants.filter(c => !c.eliminated);
  };

  const calculateTotalPoints = (playerId) => {
    let total = 0;

    const playerPickScores = pickScores.filter(ps => {
      const pick = picks.find(p => p.id === ps.pickId);
      return pick && pick.playerId === playerId;
    });
    total += playerPickScores.reduce((sum, ps) => sum + ps.points, 0);

    const playerSubmissions = submissions.filter(s => s.playerId === playerId && s.score !== undefined);
    total += playerSubmissions.reduce((sum, s) => sum + s.score, 0);

    const qotwWins = questionnaires.filter(q => {
      if (!q.qotwWinner) return false;
      const winners = Array.isArray(q.qotwWinner) ? q.qotwWinner : [q.qotwWinner];
      return winners.includes(playerId);
    });
    total += qotwWins.length * 5;

    return total;
  };

  const addNotification = async (notification) => {
    const newNotif = {
      id: Date.now(),
      ...notification,
      createdAt: new Date().toISOString(),
      read: false
    };
    const updated = [...notifications, newNotif];
    setNotifications(updated);
    await storage.set('notifications', JSON.stringify(updated));
  };

  // Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 flex items-center justify-center p-4">
        <div className="bg-black/60 backdrop-blur-sm p-8 rounded-lg shadow-2xl max-w-md w-full border-2 border-amber-600">
          <div className="flex items-center justify-center mb-6">
            <Flame className="w-12 h-12 text-orange-500 mr-3" />
            <h1 className="text-3xl font-bold text-amber-400">Survivor Fantasy</h1>
          </div>
          
          {loginView === 'login' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-amber-200 mb-2">Player Name</label>
                <input
                  type="text"
                  value={loginForm.name}
                  onChange={(e) => setLoginForm({...loginForm, name: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-amber-200 mb-2">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                  placeholder="Enter password"
                />
              </div>
              <button
                onClick={handleLogin}
                type="button"
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded font-semibold hover:from-amber-500 hover:to-orange-500 transition"
              >
                Enter the Game
              </button>
              <button
                onClick={() => setLoginView('forgot')}
                type="button"
                className="w-full text-amber-300 text-sm hover:text-amber-200 transition"
              >
                Forgot Password?
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-amber-200 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={recoveryForm.phone}
                  onChange={(e) => setRecoveryForm({...recoveryForm, phone: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                  placeholder="1234567890"
                />
              </div>
              {showRecoveryCode && (
                <div>
                  <label className="block text-amber-200 mb-2">Recovery Code</label>
                  <input
                    type="text"
                    value={recoveryForm.code}
                    onChange={(e) => setRecoveryForm({...recoveryForm, code: e.target.value})}
                    className="w-full px-4 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                    placeholder="Enter 3-digit code"
                  />
                </div>
              )}
              {!showRecoveryCode ? (
                <button
                  onClick={handleForgotPassword}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded font-semibold hover:from-amber-500 hover:to-orange-500 transition"
                >
                  Send Recovery Code
                </button>
              ) : (
                <button
                  onClick={handleRecoveryLogin}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded font-semibold hover:from-amber-500 hover:to-orange-500 transition"
                >
                  Login with Code
                </button>
              )}
              <button
                onClick={() => {
                  setLoginView('login');
                  setShowRecoveryCode(false);
                  setRecoveryForm({ phone: '', code: '' });
                }}
                className="w-full text-amber-300 text-sm hover:text-amber-200 transition"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main App
  const myInstinctPick = picks.find(p => p.playerId === currentUser.id && p.type === 'instinct');
  const myFinalPick = picks.find(p => p.playerId === currentUser.id && p.type === 'final');
  const pickStatus = getInstinctPicksStatus();
  const myTotalPoints = calculateTotalPoints(currentUser.id);
  const myAdvantages = advantages.filter(a => a.playerId === currentUser.id && !a.used && (!a.expiresEpisode || a.expiresEpisode > episodes.length));
  const unreadNotifications = notifications.filter(n => !n.read && (n.targetPlayerId === currentUser.id || !n.targetPlayerId));

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-red-900">
      {/* Header - continuing in next message due to length */}
      <header className="bg-black/60 backdrop-blur-sm border-b-2 border-amber-600">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-amber-400">Survivor Fantasy</h1>
              <p className="text-amber-200 text-sm">Season 48</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-amber-200 text-sm">Welcome back,</p>
              <p className="text-white font-semibold">{currentUser.name}</p>
              <p className="text-amber-400 text-sm font-semibold">{myTotalPoints} points</p>
            </div>
            {unreadNotifications.length > 0 && (
              <div className="relative">
                <Mail className="w-6 h-6 text-amber-300" />
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications.length}
                </span>
              </div>
            )}
            {currentUser.isAdmin && (
              <Crown className="w-6 h-6 text-yellow-400" title="Admin (Jeff)" />
            )}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <LogOut className="w-5 h-5 text-amber-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-black/40 backdrop-blur-sm border-b border-amber-600/50">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto">
            {['dashboard', 'picks', 'leaderboard', 'questionnaire', 'advantages'].map(view => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
                  currentView === view
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-amber-200 hover:text-amber-300'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
            {currentUser.isAdmin && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
                  currentView === 'admin'
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-yellow-300 hover:text-yellow-200'
                }`}
              >
                Jeff's Controls
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <p className="text-white text-center">
          View components will be rendered here based on currentView state
        </p>
        <p className="text-amber-300 text-center mt-2">
          Current View: {currentView}
        </p>
      </main>

      {/* Footer */}
      <footer className="bg-black/60 backdrop-blur-sm border-t-2 border-amber-600 mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-amber-300">
            The tribe has spoken. May the odds be ever in your favor.
          </p>
          <p className="text-amber-500 text-sm mt-2">
            Survivor Fantasy Game • Season 48
          </p>
        </div>
      </footer>
    </div>
  );
}