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
      console.error('Error loading data:', error);
      // First time setup - initialize with defaults
      setPlayers(INITIAL_PLAYERS);
      setContestants(SURVIVOR_48_CAST);
      setPicks([]);
      setGamePhase('instinct-picks');
      setQuestionnaires([]);
      setSubmissions([]);
      setQotWVotes([]);
      setLatePenalties({});
      setPickScores([]);
      setAdvantages([]);
      setEpisodes([]);
      setNotifications([]);
      
      // Save initial data
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
      {/* Header */}
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
        {currentView === 'picks' && (
          <div className="space-y-6">
            {/* Instinct Picks Section */}
            <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-600">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  Instinct Pick
                </h2>
                {myInstinctPick && (
                  <span className="text-green-400 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Pick Submitted
                  </span>
                )}
              </div>

              <p className="text-amber-200 mb-6">
                Choose ONE contestant based purely on instinct before Episode 1 airs. This pick earns bonus points for each episode survived (+1) and making the merge (+5).
              </p>

              {gamePhase === 'instinct-picks' ? (
                <>
                  {myInstinctPick ? (
                    <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 p-6 rounded-lg border-2 border-green-600">
                      <p className="text-green-300 font-semibold mb-3">Your Instinct Pick:</p>
                      <div className="flex items-center gap-4">
                        <img 
                          src={contestants.find(c => c.id === myInstinctPick.contestantId)?.image} 
                          alt=""
                          className="w-24 h-24 rounded-lg object-cover border-4 border-green-500"
                        />
                        <div>
                          <p className="text-white font-bold text-2xl">
                            {contestants.find(c => c.id === myInstinctPick.contestantId)?.name}
                          </p>
                          <p className="text-green-300 text-lg">
                            {contestants.find(c => c.id === myInstinctPick.contestantId)?.tribe} Tribe
                          </p>
                          <p className="text-green-400 text-sm mt-2">
                            ✓ Locked in and ready for the season!
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
                        <p className="text-yellow-200 text-sm">
                          ⏰ Pick must be submitted before Episode 1. Choose wisely - this pick cannot be changed!
                        </p>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {contestants.map(contestant => (
                          <div
                            key={contestant.id}
                            onClick={() => {
                              if (window.confirm(`Select ${contestant.name} as your Instinct Pick? This cannot be changed!`)) {
                                submitInstinctPick(contestant.id);
                              }
                            }}
                            className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 p-4 rounded-lg border-2 border-amber-600 hover:border-amber-400 cursor-pointer transition transform hover:scale-105"
                          >
                            <img 
                              src={contestant.image} 
                              alt={contestant.name}
                              className="w-full h-40 object-cover rounded-lg mb-3"
                            />
                            <h3 className="text-white font-bold text-lg">{contestant.name}</h3>
                            <p className="text-amber-300 text-sm mb-2">{contestant.tribe} Tribe</p>
                            <button className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded font-semibold hover:from-amber-500 hover:to-orange-500 transition">
                              Select as Instinct Pick
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="bg-gray-900/40 p-6 rounded-lg border border-gray-600">
                  {myInstinctPick ? (
                    <div className="flex items-center gap-4">
                      <img 
                        src={contestants.find(c => c.id === myInstinctPick.contestantId)?.image} 
                        alt=""
                        className="w-20 h-20 rounded-lg object-cover border-2 border-amber-500"
                      />
                      <div>
                        <p className="text-gray-400 text-sm">Your Instinct Pick</p>
                        <p className="text-white font-bold text-xl">
                          {contestants.find(c => c.id === myInstinctPick.contestantId)?.name}
                        </p>
                        <p className="text-amber-400">
                          {contestants.find(c => c.id === myInstinctPick.contestantId)?.eliminated 
                            ? '❌ Eliminated' 
                            : '✓ Still in the game'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400">Instinct picks are now closed. You did not submit a pick.</p>
                  )}
                </div>
              )}
            </div>

            {/* Final Picks Section */}
            <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-purple-600">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                  <Crown className="w-6 h-6" />
                  Final Pick (Post-Merge)
                </h2>
                {myFinalPick && (
                  <span className="text-green-400 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Pick Submitted
                  </span>
                )}
              </div>

              {gamePhase === 'instinct-picks' || gamePhase === 'early-season' ? (
                <div className="bg-gray-900/40 p-8 rounded-lg border border-gray-600 text-center">
                  <Crown className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Final picks will open after the merge</p>
                  <p className="text-gray-500 text-sm mt-2">Jeff will announce when it's time to make your final pick</p>
                </div>
              ) : (
                <>
                  <p className="text-purple-200 mb-6">
                    Choose ONE contestant after the merge. This pick earns the same points as your instinct pick (except no episode survival bonuses).
                  </p>

                  {myFinalPick ? (
                    <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-6 rounded-lg border-2 border-purple-600">
                      <p className="text-purple-300 font-semibold mb-3">Your Final Pick:</p>
                      <div className="flex items-center gap-4">
                        <img 
                          src={contestants.find(c => c.id === myFinalPick.contestantId)?.image} 
                          alt=""
                          className="w-24 h-24 rounded-lg object-cover border-4 border-purple-500"
                        />
                        <div>
                          <p className="text-white font-bold text-2xl">
                            {contestants.find(c => c.id === myFinalPick.contestantId)?.name}
                          </p>
                          <p className="text-purple-300 text-lg">
                            {contestants.find(c => c.id === myFinalPick.contestantId)?.tribe} Tribe
                          </p>
                          <p className="text-purple-400 text-sm mt-2">
                            ✓ Locked in for the rest of the season!
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 p-3 bg-purple-900/30 border border-purple-600 rounded-lg">
                        <p className="text-purple-200 text-sm">
                          ⏰ Choose from the remaining contestants. This pick cannot be changed once submitted!
                        </p>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {contestants.filter(c => !c.eliminated).map(contestant => (
                          <div
                            key={contestant.id}
                            onClick={() => {
                              if (window.confirm(`Select ${contestant.name} as your Final Pick? This cannot be changed!`)) {
                                submitFinalPick(contestant.id);
                              }
                            }}
                            className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-4 rounded-lg border-2 border-purple-600 hover:border-purple-400 cursor-pointer transition transform hover:scale-105"
                          >
                            <img 
                              src={contestant.image} 
                              alt={contestant.name}
                              className="w-full h-40 object-cover rounded-lg mb-3"
                            />
                            <h3 className="text-white font-bold text-lg">{contestant.name}</h3>
                            <p className="text-purple-300 text-sm mb-2">{contestant.tribe} Tribe</p>
                            <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-semibold hover:from-purple-500 hover:to-pink-500 transition">
                              Select as Final Pick
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Pick Status Summary */}
            <div className="bg-black/60 backdrop-blur-sm p-4 rounded-lg border border-amber-600">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-amber-300 text-sm mb-2">Instinct Picks Submitted</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-amber-600 to-orange-600 h-2 rounded-full transition-all"
                        style={{ width: `${(pickStatus.submitted / pickStatus.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold">{pickStatus.submitted}/{pickStatus.total}</span>
                  </div>
                </div>
                <div>
                  <p className="text-purple-300 text-sm mb-2">Game Phase</p>
                  <p className="text-white font-bold capitalize">
                    {gamePhase.replace('-', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'leaderboard' && (
          <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-600">
            <h2 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Leaderboard - Season 48
            </h2>
            
            <div className="space-y-3">
              {[...players]
                .sort((a, b) => calculateTotalPoints(b.id) - calculateTotalPoints(a.id))
                .map((player, index) => {
                  const points = calculateTotalPoints(player.id);
                  const isCurrentUser = player.id === currentUser.id;
                  
                  return (
                    <div
                      key={player.id}
                      className={`bg-gradient-to-r from-amber-900/40 to-orange-900/40 p-4 rounded-lg border-2 transition ${
                        isCurrentUser 
                          ? 'border-yellow-400 shadow-lg shadow-yellow-400/30' 
                          : 'border-amber-600'
                      } flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank Badge */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50' :
                          index === 1 ? 'bg-gray-400 text-black shadow-lg shadow-gray-400/50' :
                          index === 2 ? 'bg-amber-700 text-white shadow-lg shadow-amber-700/50' :
                          'bg-amber-600/50 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        
                        {/* Player Initial Circle */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center border-2 border-amber-400">
                          <span className="text-white font-bold text-xl" style={{ fontFamily: 'Impact, fantasy' }}>
                            {player.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        {/* Player Info */}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-bold text-lg">{player.name}</p>
                            {player.isAdmin && (
                              <Crown className="w-4 h-4 text-yellow-400" title="Game Master" />
                            )}
                            {isCurrentUser && (
                              <span className="text-xs bg-amber-600 text-white px-2 py-1 rounded">YOU</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-amber-300">{points} points</span>
                            {index === 0 && points > 0 && (
                              <span className="text-yellow-400 flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                Leading
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Points Display */}
                      <div className="text-right">
                        <div className="text-3xl font-bold text-amber-400">
                          {points}
                        </div>
                        <div className="text-xs text-amber-300">
                          total points
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {/* Stats Summary */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-yellow-900/60 to-amber-900/60 p-4 rounded-lg border border-yellow-600">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <p className="text-yellow-300 font-semibold">Leader</p>
                </div>
                <p className="text-white text-xl font-bold">
                  {[...players].sort((a, b) => calculateTotalPoints(b.id) - calculateTotalPoints(a.id))[0]?.name}
                </p>
                <p className="text-yellow-400 text-sm">
                  {calculateTotalPoints([...players].sort((a, b) => calculateTotalPoints(b.id) - calculateTotalPoints(a.id))[0]?.id)} pts
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 p-4 rounded-lg border border-purple-600">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  <p className="text-purple-300 font-semibold">Your Rank</p>
                </div>
                <p className="text-white text-xl font-bold">
                  #{[...players]
                    .sort((a, b) => calculateTotalPoints(b.id) - calculateTotalPoints(a.id))
                    .findIndex(p => p.id === currentUser.id) + 1}
                </p>
                <p className="text-purple-400 text-sm">
                  of {players.length} players
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 p-4 rounded-lg border border-blue-600">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <p className="text-blue-300 font-semibold">Average Score</p>
                </div>
                <p className="text-white text-xl font-bold">
                  {Math.round(players.reduce((sum, p) => sum + calculateTotalPoints(p.id), 0) / players.length)}
                </p>
                <p className="text-blue-400 text-sm">
                  points per player
                </p>
              </div>
            </div>
          </div>
        )}

        {currentView === 'questionnaire' && (
          <QuestionnaireView 
            currentUser={currentUser}
            questionnaires={questionnaires}
            submissions={submissions}
            setSubmissions={setSubmissions}
            contestants={contestants}
            latePenalties={latePenalties}
            setLatePenalties={setLatePenalties}
            qotWVotes={qotWVotes}
            setQotWVotes={setQotWVotes}
            players={players}
            storage={storage}
          />
        )}

        {/* Other views placeholder */}
        {currentView !== 'leaderboard' && currentView !== 'picks' && currentView !== 'questionnaire' && (
          <div className="bg-black/60 backdrop-blur-sm p-8 rounded-lg border-2 border-amber-600 text-center">
            <h2 className="text-3xl font-bold text-amber-400 mb-4">🎉 Your App is Live!</h2>
            <p className="text-white text-lg mb-2">Current View: <span className="text-amber-300">{currentView}</span></p>
            <p className="text-amber-200 mb-4">This view is coming next!</p>
            <p className="text-white">✅ Database Connected</p>
            <p className="text-white">✅ Authentication Working</p>
            <p className="text-white">✅ Deployed on Vercel</p>
            <p className="text-white">✅ Leaderboard Complete!</p>
            <p className="text-white">✅ Picks Interface Complete!</p>
          </div>
        )}
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

// Questionnaire View Component
function QuestionnaireView({ currentUser, questionnaires, submissions, setSubmissions, contestants, latePenalties, setLatePenalties, qotWVotes, setQotWVotes, players, storage }) {
  const activeQ = questionnaires.find(q => q.status === 'active');
  const mySubmission = activeQ ? submissions.find(s => s.questionnaireId === activeQ.id && s.playerId === currentUser.id) : null;
  const [answers, setAnswers] = useState({});
  const [votingFor, setVotingFor] = useState(null);
  const [viewingArchived, setViewingArchived] = useState(null);

  const isOpen = activeQ && new Date() < new Date(activeQ.deadline) && new Date() < new Date(activeQ.lockedAt);
  const isLocked = activeQ && new Date() >= new Date(activeQ.lockedAt);
  const isLate = activeQ && new Date() > new Date(activeQ.deadline) && new Date() < new Date(activeQ.lockedAt);

  const archivedQuestionnaires = questionnaires.filter(q => q.status === 'archived' && q.scoresReleased);

  const handleSubmit = async () => {
    if (!activeQ) return;

    const requiredQuestions = activeQ.questions.filter(q => q.required);
    const allRequiredAnswered = requiredQuestions.every(q => answers[q.id]);

    if (!allRequiredAnswered) {
      alert('Please answer all required questions!');
      return;
    }

    if (!answers[activeQ.qotw.id]) {
      alert('Please answer the Question of the Week!');
      return;
    }

    const penalty = isLate ? (latePenalties[currentUser.id] || 0) + 1 : 0;

    const newSubmission = {
      id: Date.now(),
      questionnaireId: activeQ.id,
      playerId: currentUser.id,
      answers,
      submittedAt: new Date().toISOString(),
      penalty
    };

    const updatedSubmissions = [...submissions.filter(s => !(s.questionnaireId === activeQ.id && s.playerId === currentUser.id)), newSubmission];
    setSubmissions(updatedSubmissions);
    await storage.set('submissions', JSON.stringify(updatedSubmissions));

    if (penalty > 0) {
      const updatedPenalties = { ...latePenalties, [currentUser.id]: penalty };
      setLatePenalties(updatedPenalties);
      await storage.set('latePenalties', JSON.stringify(updatedPenalties));
    }

    alert(isLate ? `Submitted! Late penalty applied: -${penalty} points` : 'Submitted successfully!');
    setAnswers({});
  };

  const handleVote = async (qotWAnswerId) => {
    if (!activeQ) return;

    const newVote = {
      questionnaireId: activeQ.id,
      voterId: currentUser.id,
      answerId: qotWAnswerId
    };

    const updatedVotes = [...qotWVotes.filter(v => !(v.questionnaireId === activeQ.id && v.voterId === currentUser.id)), newVote];
    setQotWVotes(updatedVotes);
    await storage.set('qotWVotes', JSON.stringify(updatedVotes));
    alert('Vote submitted!');
    setVotingFor(null);
  };

  if (!activeQ && archivedQuestionnaires.length === 0) {
    return (
      <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-600">
        <h2 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Weekly Questionnaire
        </h2>
        <p className="text-amber-200">No questionnaire available yet. Check back before the next episode!</p>
      </div>
    );
  }

  const allQotWSubmitted = activeQ ? players.every(p => {
    const sub = submissions.find(s => s.questionnaireId === activeQ.id && s.playerId === p.id);
    return sub && sub.answers[activeQ.qotw.id];
  }) : false;

  const qotwQuestion = activeQ?.qotw;
  const myVote = activeQ ? qotWVotes.find(v => v.questionnaireId === activeQ.id && v.voterId === currentUser.id) : null;

  if (votingFor === 'qotw' && allQotWSubmitted && activeQ) {
    const qotwAnswers = submissions
      .filter(s => s.questionnaireId === activeQ.id && s.answers[qotwQuestion.id])
      .map(s => ({
        playerId: s.playerId,
        playerName: players.find(p => p.id === s.playerId)?.name,
        answer: s.answers[qotwQuestion.id]
      }))
      .filter(a => a.playerId !== currentUser.id);

    return (
      <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-purple-600">
        <h2 className="text-2xl font-bold text-purple-400 mb-4">⭐ Question of the Week Voting</h2>
        <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-600 mb-6">
          <p className="text-purple-300 font-semibold mb-2">Question:</p>
          <p className="text-white text-lg">{qotwQuestion.text}</p>
        </div>

        <div className="space-y-4">
          {qotwAnswers.map((answer, idx) => (
            <div key={idx} className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-4 rounded-lg border border-purple-600">
              {!qotwQuestion.anonymous && (
                <p className="text-purple-400 font-semibold mb-2">{answer.playerName}</p>
              )}
              <p className="text-white mb-3">{answer.answer}</p>
              <button
                onClick={() => handleVote(`${answer.playerId}-${qotwQuestion.id}`)}
                disabled={myVote}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-semibold hover:from-purple-500 hover:to-pink-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {myVote ? '✓ Vote Submitted' : 'Vote for This Answer'}
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => setVotingFor(null)}
          className="mt-6 px-6 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-500 transition"
        >
          Back to Questionnaire
        </button>
      </div>
    );
  }

  if (viewingArchived) {
    const mySub = submissions.find(s => s.questionnaireId === viewingArchived.id && s.playerId === currentUser.id);
    
    return (
      <div className="space-y-6">
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-600">
          <button
            onClick={() => setViewingArchived(null)}
            className="mb-4 text-amber-300 hover:text-amber-200 flex items-center gap-2"
          >
            ← Back to Current Questionnaire
          </button>

          <h2 className="text-2xl font-bold text-amber-400 mb-4">{viewingArchived.title}</h2>
          
          <div className="bg-green-900/30 border border-green-600 p-4 rounded-lg mb-6">
            <p className="text-green-300 font-semibold text-lg">Your Score: {mySub?.score || 0} points</p>
            {mySub?.penalty > 0 && (
              <p className="text-red-300 text-sm mt-1">Late Penalty: -{mySub.penalty} points</p>
            )}
          </div>

          <div className="space-y-4">
            {viewingArchived.questions.map((q, idx) => {
              const myAnswer = mySub?.answers[q.id];
              const correctAnswer = viewingArchived.correctAnswers[q.id];
              const isCorrect = myAnswer === correctAnswer;
              
              return (
                <div key={q.id} className={`p-4 rounded-lg border-2 ${
                  isCorrect ? 'bg-green-900/20 border-green-600' : 'bg-red-900/20 border-red-600'
                }`}>
                  <p className="text-white font-semibold mb-2">
                    {idx + 1}. {q.text}
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="text-white">
                      <span className="text-amber-300">Your Answer:</span> {myAnswer || '(no answer)'}
                    </p>
                    <p className="text-white">
                      <span className="text-amber-300">Correct Answer:</span> {correctAnswer}
                    </p>
                    <p className={isCorrect ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                      {isCorrect ? '✓ Correct (+2)' : myAnswer ? (q.required ? '✗ Incorrect (0)' : '✗ Incorrect (-1)') : '(No answer: 0)'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeQ && (
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              {activeQ.title}
            </h2>
            <div className="text-right">
              <p className="text-amber-300 text-sm">Deadline:</p>
              <p className="text-white font-semibold">{new Date(activeQ.deadline).toLocaleString()}</p>
            </div>
          </div>

          {isLocked && (
            <div className="bg-red-900/40 border border-red-600 p-4 rounded-lg mb-4">
              <p className="text-red-200 font-semibold">⚠️ Questionnaire is locked!</p>
              <p className="text-red-300 text-sm mt-1">The episode has started. Too much information may already be available.</p>
            </div>
          )}

          {isLate && !isLocked && (
            <div className="bg-yellow-900/40 border border-yellow-600 p-4 rounded-lg mb-4">
              <p className="text-yellow-200 font-semibold">⚠️ Late Submission</p>
              <p className="text-yellow-300 text-sm mt-1">You will receive a -{(latePenalties[currentUser.id] || 0) + 1} point penalty for submitting after the deadline.</p>
            </div>
          )}

          {mySubmission && (
            <div className="bg-green-900/30 border border-green-600 p-4 rounded-lg mb-4">
              <p className="text-green-200 font-semibold">✓ You've submitted your answers!</p>
              {mySubmission.penalty > 0 && (
                <p className="text-green-300 text-sm mt-1">Late penalty applied: -{mySubmission.penalty} points</p>
              )}
              {activeQ.scoresReleased && (
                <div className="mt-3">
                  <p className="text-white font-semibold">Your Score: {mySubmission.score || 0} points</p>
                </div>
              )}
            </div>
          )}

          {!mySubmission && !isLocked && (
            <div className="space-y-6">
              {activeQ.questions.map((question, idx) => (
                <div key={question.id} className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 p-4 rounded-lg border border-amber-600">
                  <p className="text-white font-semibold mb-3">
                    {idx + 1}. {question.text} {question.required && <span className="text-red-400">*</span>}
                  </p>

                  {question.type === 'tribe-immunity' && (
                    <select
                      value={answers[question.id] || ''}
                      onChange={(e) => setAnswers({...answers, [question.id]: e.target.value})}
                      className="w-full px-4 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                    >
                      <option value="">Select a tribe...</option>
                      {Array.from(new Set(contestants.map(c => c.tribe))).map(tribe => (
                        <option key={tribe} value={tribe}>{tribe}</option>
                      ))}
                    </select>
                  )}

                  {question.type === 'individual-immunity' && (
                    <select
                      value={answers[question.id] || ''}
                      onChange={(e) => setAnswers({...answers, [question.id]: e.target.value})}
                      className="w-full px-4 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                    >
                      <option value="">Select a contestant...</option>
                      {contestants.filter(c => !c.eliminated).map(contestant => (
                        <option key={contestant.id} value={contestant.name}>{contestant.name}</option>
                      ))}
                    </select>
                  )}

                  {question.type === 'vote-out' && (
                    <select
                      value={answers[question.id] || ''}
                      onChange={(e) => setAnswers({...answers, [question.id]: e.target.value})}
                      className="w-full px-4 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                    >
                      <option value="">Select a contestant...</option>
                      {contestants.filter(c => !c.eliminated).map(contestant => (
                        <option key={contestant.id} value={contestant.name}>{contestant.name}</option>
                      ))}
                    </select>
                  )}

                  {question.type === 'multiple-choice' && (
                    <div className="space-y-2">
                      {question.options.map((option, optIdx) => (
                        <label key={optIdx} className="flex items-center gap-3 p-3 bg-black/30 rounded cursor-pointer hover:bg-black/50 transition">
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={(e) => setAnswers({...answers, [question.id]: e.target.value})}
                            className="w-4 h-4"
                          />
                          <span className="text-white">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'true-false' && (
                    <div className="flex gap-4">
                      <label className="flex items-center gap-3 p-3 bg-black/30 rounded cursor-pointer hover:bg-black/50 transition flex-1">
                        <input
                          type="radio"
                          name={question.id}
                          value="true"
                          checked={answers[question.id] === 'true'}
                          onChange={(e) => setAnswers({...answers, [question.id]: e.target.value})}
                          className="w-4 h-4"
                        />
                        <span className="text-white">True</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-black/30 rounded cursor-pointer hover:bg-black/50 transition flex-1">
                        <input
                          type="radio"
                          name={question.id}
                          value="false"
                          checked={answers[question.id] === 'false'}
                          onChange={(e) => setAnswers({...answers, [question.id]: e.target.value})}
                          className="w-4 h-4"
                        />
                        <span className="text-white">False</span>
                      </label>
                    </div>
                  )}
                </div>
              ))}

              <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-4 rounded-lg border-2 border-purple-600">
                <p className="text-purple-300 font-semibold mb-2">⭐ Question of the Week</p>
                <p className="text-white font-semibold mb-3">{qotwQuestion.text}</p>
                <textarea
                  value={answers[qotwQuestion.id] || ''}
                  onChange={(e) => setAnswers({...answers, [qotwQuestion.id]: e.target.value})}
                  placeholder="Enter your answer..."
                  rows={3}
                  className="w-full px-4 py-2 rounded bg-black/50 text-white border border-purple-600 focus:outline-none focus:border-purple-400"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-500 hover:to-orange-500 transition text-lg"
              >
                Submit Questionnaire
              </button>
            </div>
          )}

          {mySubmission && allQotWSubmitted && (
            <button
              onClick={() => setVotingFor('qotw')}
              className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-pink-500 transition"
            >
              {myVote ? '✓ Voted on Question of the Week' : 'Vote on Question of the Week'}
            </button>
          )}
        </div>
      )}

      {archivedQuestionnaires.length > 0 && !viewingArchived && (
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-600">
          <h3 className="text-xl font-bold text-amber-400 mb-4">Previous Questionnaires</h3>
          <div className="space-y-3">
            {archivedQuestionnaires.map(q => {
              const mySub = submissions.find(s => s.questionnaireId === q.id && s.playerId === currentUser.id);
              return (
                <button
                  key={q.id}
                  onClick={() => setViewingArchived(q)}
                  className="w-full bg-gradient-to-r from-amber-900/40 to-orange-900/40 p-4 rounded-lg border border-amber-600 text-left hover:border-amber-400 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{q.title}</p>
                      <p className="text-amber-300 text-sm">Episode {q.episodeNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">{mySub?.score || 0} points</p>
                      <ChevronRight className="w-5 h-5 text-amber-400 inline" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}