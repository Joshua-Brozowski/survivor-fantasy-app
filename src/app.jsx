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

        {currentView === 'admin' && currentUser.isAdmin && (
          <AdminPanel 
            currentUser={currentUser}
            players={players}
            setPlayers={setPlayers}
            contestants={contestants}
            setContestants={setContestants}
            questionnaires={questionnaires}
            setQuestionnaires={setQuestionnaires}
            submissions={submissions}
            setSubmissions={setSubmissions}
            pickStatus={pickStatus}
            gamePhase={gamePhase}
            setGamePhase={setGamePhase}
            picks={picks}
            pickScores={pickScores}
            setPickScores={setPickScores}
            advantages={advantages}
            setAdvantages={setAdvantages}
            episodes={episodes}
            setEpisodes={setEpisodes}
            qotWVotes={qotWVotes}
            addNotification={addNotification}
            storage={storage}
          />
        )}

        {/* Other views placeholder */}
        {!['leaderboard', 'picks', 'questionnaire', 'admin'].includes(currentView) && (
          <div className="bg-black/60 backdrop-blur-sm p-8 rounded-lg border-2 border-amber-600 text-center">
            <h2 className="text-3xl font-bold text-amber-400 mb-4">🎉 Your App is Live!</h2>
            <p className="text-white text-lg mb-2">Current View: <span className="text-amber-300">{currentView}</span></p>
            <p className="text-amber-200 mb-4">This view is coming next!</p>
            <p className="text-white">✅ Database Connected</p>
            <p className="text-white">✅ Authentication Working</p>
            <p className="text-white">✅ Deployed on Vercel</p>
            <p className="text-white">✅ Leaderboard Complete!</p>
            <p className="text-white">✅ Picks Interface Complete!</p>
            <p className="text-white">✅ Questionnaire Complete!</p>
            <p className="text-white">✅ Admin Panel Complete!</p>
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

// Admin Panel Component  
function AdminPanel({ currentUser, players, setPlayers, contestants, setContestants, questionnaires, setQuestionnaires, submissions, setSubmissions, pickStatus, gamePhase, setGamePhase, picks, pickScores, setPickScores, advantages, setAdvantages, episodes, setEpisodes, qotWVotes, addNotification, storage }) {
  const [adminView, setAdminView] = useState('main');
  const [newQ, setNewQ] = useState({
    title: '',
    episodeNumber: episodes.length + 1,
    questions: [],
    qotw: { id: 'qotw', text: '', anonymous: false }
  });
  const [scoringQ, setScoringQ] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState({});

  const createQuestionnaire = async () => {
    if (!newQ.title || newQ.questions.length === 0 || !newQ.qotw.text) {
      alert('Please fill in all fields!');
      return;
    }

    const updatedQuestionnaires = questionnaires.map(q => ({
      ...q,
      status: q.status === 'active' ? 'archived' : q.status
    }));

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + ((3 - deadline.getDay() + 7) % 7));
    deadline.setHours(19, 59, 0, 0);

    const lockedAt = new Date(deadline);
    lockedAt.setHours(21, 0, 0, 0);

    const questionnaire = {
      id: Date.now(),
      ...newQ,
      deadline: deadline.toISOString(),
      lockedAt: lockedAt.toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      scoresReleased: false,
      correctAnswers: {}
    };

    const updated = [...updatedQuestionnaires, questionnaire];
    setQuestionnaires(updated);
    await storage.set('questionnaires', JSON.stringify(updated));

    await addNotification({
      type: 'new_questionnaire',
      message: `New questionnaire "${newQ.title}" is now available!`,
      targetPlayerId: null
    });

    alert('Questionnaire created and sent to all players!');
    setAdminView('main');
    setNewQ({ title: '', episodeNumber: episodes.length + 1, questions: [], qotw: { id: 'qotw', text: '', anonymous: false } });
  };

  const addQuestion = (type) => {
    const question = {
      id: `q${Date.now()}`,
      type,
      text: '',
      required: type === 'tribe-immunity' || type === 'individual-immunity' || type === 'vote-out',
      options: type === 'multiple-choice' ? ['', '', '', ''] : []
    };
    setNewQ({...newQ, questions: [...newQ.questions, question]});
  };

  const calculateScores = (questionnaire, correctAns) => {
    const scores = {};
    const qSubmissions = submissions.filter(s => s.questionnaireId === questionnaire.id);

    qSubmissions.forEach(sub => {
      let score = 0;

      questionnaire.questions.forEach(q => {
        const answer = sub.answers[q.id];
        const correct = correctAns[q.id];

        if (answer === correct) {
          score += 2;
        } else if (answer && !q.required) {
          score -= 1;
        }
      });

      if (sub.penalty) {
        score -= sub.penalty;
      }

      scores[sub.playerId] = score;
    });

    return scores;
  };

  const releaseScores = async () => {
    const scores = calculateScores(scoringQ, correctAnswers);

    const qotwVotesForThis = qotWVotes.filter(v => v.questionnaireId === scoringQ.id);
    const voteCounts = {};
    qotwVotesForThis.forEach(v => {
      voteCounts[v.answerId] = (voteCounts[v.answerId] || 0) + 1;
    });
    
    const maxVotes = Math.max(...Object.values(voteCounts), 0);
    const winners = Object.keys(voteCounts).filter(k => voteCounts[k] === maxVotes);
    const winnerPlayerIds = winners.map(answerId => parseInt(answerId.split('-')[0]));

    const updatedSubmissions = submissions.map(s => {
      if (s.questionnaireId === scoringQ.id) {
        return { ...s, score: scores[s.playerId] || 0 };
      }
      return s;
    });

    const updatedQuestionnaires = questionnaires.map(q => {
      if (q.id === scoringQ.id) {
        return { ...q, scoresReleased: true, correctAnswers, qotwWinner: winnerPlayerIds };
      }
      return q;
    });

    await storage.set('submissions', JSON.stringify(updatedSubmissions));
    await storage.set('questionnaires', JSON.stringify(updatedQuestionnaires));
    setSubmissions(updatedSubmissions);
    setQuestionnaires(updatedQuestionnaires);

    await addNotification({
      type: 'scores_released',
      message: `Scores for ${scoringQ.title} have been released!`,
      targetPlayerId: null
    });

    alert('Scores released to all players!');
    setAdminView('main');
  };

  const eliminateContestant = async (contestantId) => {
    if (!window.confirm('Mark this contestant as eliminated?')) return;
    
    const updated = contestants.map(c => 
      c.id === contestantId ? { ...c, eliminated: true } : c
    );
    setContestants(updated);
    await storage.set('contestants', JSON.stringify(updated));
    alert('Contestant marked as eliminated');
  };

  const advancePhase = async () => {
    const phases = ['instinct-picks', 'early-season', 'final-picks', 'mid-season', 'finale'];
    const currentIndex = phases.indexOf(gamePhase);
    if (currentIndex < phases.length - 1) {
      const newPhase = phases[currentIndex + 1];
      setGamePhase(newPhase);
      await storage.set('gamePhase', newPhase);

      if (newPhase === 'final-picks') {
        await addNotification({
          type: 'final_picks_open',
          message: 'Final Picks are now open! Submit your pick before the deadline.',
          targetPlayerId: null
        });
      }

      alert(`Game phase advanced to: ${newPhase}`);
    }
  };

  if (adminView === 'create-questionnaire') {
    return (
      <div className="space-y-6">
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-yellow-600">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">Create Weekly Questionnaire</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-yellow-300 mb-2">Title</label>
              <input
                type="text"
                value={newQ.title}
                onChange={(e) => setNewQ({...newQ, title: e.target.value})}
                placeholder="Episode 1 Questionnaire"
                className="w-full px-4 py-2 rounded bg-black/50 text-white border border-yellow-600 focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-yellow-300 mb-2">Episode Number</label>
              <input
                type="number"
                value={newQ.episodeNumber}
                onChange={(e) => setNewQ({...newQ, episodeNumber: parseInt(e.target.value)})}
                className="w-full px-4 py-2 rounded bg-black/50 text-white border border-yellow-600 focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-yellow-300 mb-2">Questions</label>
              <div className="space-y-3">
                {newQ.questions.map((q, idx) => (
                  <div key={q.id} className="bg-yellow-900/20 p-4 rounded border border-yellow-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-yellow-300 font-semibold">
                        Question {idx + 1} ({q.type}) {q.required && '(Required)'}
                      </span>
                      <button
                        onClick={() => setNewQ({...newQ, questions: newQ.questions.filter((_, i) => i !== idx)})}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) => {
                        const updated = [...newQ.questions];
                        updated[idx].text = e.target.value;
                        setNewQ({...newQ, questions: updated});
                      }}
                      placeholder="Enter question text..."
                      className="w-full px-4 py-2 rounded bg-black/50 text-white border border-yellow-600 focus:outline-none focus:border-yellow-400 mb-2"
                    />
                    {q.type === 'multiple-choice' && (
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => (
                          <input
                            key={optIdx}
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...newQ.questions];
                              updated[idx].options[optIdx] = e.target.value;
                              setNewQ({...newQ, questions: updated});
                            }}
                            placeholder={`Option ${optIdx + 1}`}
                            className="w-full px-4 py-2 rounded bg-black/50 text-white border border-yellow-600 focus:outline-none focus:border-yellow-400"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => addQuestion('tribe-immunity')} className="px-3 py-2 bg-yellow-700 text-white rounded text-sm hover:bg-yellow-600">
                  + Tribe Immunity
                </button>
                <button onClick={() => addQuestion('individual-immunity')} className="px-3 py-2 bg-yellow-700 text-white rounded text-sm hover:bg-yellow-600">
                  + Individual Immunity
                </button>
                <button onClick={() => addQuestion('vote-out')} className="px-3 py-2 bg-yellow-700 text-white rounded text-sm hover:bg-yellow-600">
                  + Vote Out
                </button>
                <button onClick={() => addQuestion('multiple-choice')} className="px-3 py-2 bg-yellow-700 text-white rounded text-sm hover:bg-yellow-600">
                  + Multiple Choice
                </button>
                <button onClick={() => addQuestion('true-false')} className="px-3 py-2 bg-yellow-700 text-white rounded text-sm hover:bg-yellow-600">
                  + True/False
                </button>
              </div>
            </div>

            <div>
              <label className="block text-purple-300 mb-2 font-semibold">⭐ Question of the Week</label>
              <input
                type="text"
                value={newQ.qotw.text}
                onChange={(e) => setNewQ({...newQ, qotw: {...newQ.qotw, text: e.target.value}})}
                placeholder="Enter Question of the Week..."
                className="w-full px-4 py-2 rounded bg-black/50 text-white border border-purple-600 focus:outline-none focus:border-purple-400 mb-2"
              />
              <label className="flex items-center gap-2 text-purple-300">
                <input
                  type="checkbox"
                  checked={newQ.qotw.anonymous}
                  onChange={(e) => setNewQ({...newQ, qotw: {...newQ.qotw, anonymous: e.target.checked}})}
                  className="w-4 h-4"
                />
                Make answers anonymous during voting
              </label>
            </div>

            <div className="flex gap-4">
              <button
                onClick={createQuestionnaire}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-500 hover:to-emerald-500 transition"
              >
                Create & Send Questionnaire
              </button>
              <button
                onClick={() => setAdminView('main')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (adminView === 'score-questionnaire') {
    const qSubmissions = submissions.filter(s => s.questionnaireId === scoringQ.id);

    return (
      <div className="space-y-6">
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-yellow-600">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">Score: {scoringQ.title}</h2>

          <div className="bg-yellow-900/30 border border-yellow-600 p-4 rounded-lg mb-6">
            <p className="text-yellow-300 font-semibold">Submissions: {qSubmissions.length} / {players.length}</p>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="text-yellow-300 font-semibold text-lg">Set Correct Answers:</h3>
            
            {scoringQ.questions.map((q, idx) => (
              <div key={q.id} className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 p-4 rounded-lg border border-amber-600">
                <p className="text-white font-semibold mb-3">
                  {idx + 1}. {q.text} {q.required && <span className="text-green-400">(Required)</span>}
                </p>

                {(q.type === 'tribe-immunity' || q.type === 'individual-immunity' || q.type === 'vote-out') && (
                  <input
                    type="text"
                    value={correctAnswers[q.id] || ''}
                    onChange={(e) => setCorrectAnswers({...correctAnswers, [q.id]: e.target.value})}
                    placeholder="Enter correct answer..."
                    className="w-full px-4 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                  />
                )}

                {q.type === 'multiple-choice' && (
                  <select
                    value={correctAnswers[q.id] || ''}
                    onChange={(e) => setCorrectAnswers({...correctAnswers, [q.id]: e.target.value})}
                    className="w-full px-4 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                  >
                    <option value="">Select correct answer...</option>
                    {q.options.map((opt, optIdx) => (
                      <option key={optIdx} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {q.type === 'true-false' && (
                  <select
                    value={correctAnswers[q.id] || ''}
                    onChange={(e) => setCorrectAnswers({...correctAnswers, [q.id]: e.target.value})}
                    className="w-full px-4 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                  >
                    <option value="">Select correct answer...</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                )}

                <div className="mt-3">
                  <p className="text-amber-300 text-sm mb-2">Player Responses:</p>
                  <div className="bg-black/30 p-3 rounded max-h-40 overflow-y-auto">
                    {qSubmissions.map(sub => {
                      const player = players.find(p => p.id === sub.playerId);
                      const answer = sub.answers[q.id];
                      return (
                        <div key={sub.playerId} className="text-white text-sm mb-1">
                          <span className="text-amber-400">{player?.name}:</span> {answer || '(no answer)'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-green-900/30 border border-green-600 p-4 rounded-lg mb-6">
            <h3 className="text-green-300 font-semibold mb-3">Score Preview</h3>
            <div className="space-y-2">
              {Object.entries(calculateScores(scoringQ, correctAnswers)).map(([playerId, score]) => {
                const player = players.find(p => p.id === parseInt(playerId));
                const sub = qSubmissions.find(s => s.playerId === parseInt(playerId));
                return (
                  <div key={playerId} className="flex items-center justify-between text-white">
                    <span>{player?.name}</span>
                    <div className="text-right">
                      <span className="font-bold text-green-400">{score} points</span>
                      {sub?.penalty > 0 && (
                        <span className="text-red-400 text-sm ml-2">(Late: -{sub.penalty})</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={releaseScores}
              className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-500 hover:to-emerald-500 transition text-lg"
            >
              Release Scores to Players
            </button>
            <button
              onClick={() => {
                setAdminView('main');
                setScoringQ(null);
                setCorrectAnswers({});
              }}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (adminView === 'manage-cast') {
    return (
      <div className="space-y-6">
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-yellow-600">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">Manage Cast</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contestants.map(contestant => (
              <div
                key={contestant.id}
                className={`p-4 rounded-lg border-2 ${
                  contestant.eliminated ? 'bg-red-900/20 border-red-600' : 'bg-gradient-to-br from-amber-900/40 to-orange-900/40 border-amber-600'
                }`}
              >
                <img 
                  src={contestant.image} 
                  alt={contestant.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h3 className="text-white font-bold">{contestant.name}</h3>
                <p className="text-amber-300 text-sm mb-2">{contestant.tribe}</p>
                {contestant.eliminated ? (
                  <p className="text-red-400 text-sm font-semibold">❌ Eliminated</p>
                ) : (
                  <button
                    onClick={() => eliminateContestant(contestant.id)}
                    className="w-full py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-500 transition text-sm"
                  >
                    Mark as Eliminated
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => setAdminView('main')}
            className="mt-6 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition"
          >
            Back to Controls
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-yellow-600">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
          <Crown className="w-6 h-6" />
          Jeff's Control Panel
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <button 
            onClick={() => setAdminView('create-questionnaire')}
            className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-yellow-500 hover:to-amber-500 transition text-left"
          >
            <div className="flex items-center justify-between">
              <span>Create Questionnaire</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
          
          <button 
            onClick={() => setAdminView('manage-cast')}
            className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-yellow-500 hover:to-amber-500 transition text-left"
          >
            <div className="flex items-center justify-between">
              <span>Manage Cast</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
          
          <button 
            onClick={advancePhase}
            className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-yellow-500 hover:to-amber-500 transition text-left"
          >
            <div className="flex items-center justify-between">
              <span>Advance Game Phase</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        {questionnaires.length > 0 && (
          <div className="mt-6">
            <h3 className="text-yellow-300 font-semibold mb-3">Questionnaires</h3>
            <div className="space-y-3">
              {questionnaires.map(q => {
                const qSubmissions = submissions.filter(s => s.questionnaireId === q.id);
                return (
                  <div key={q.id} className="bg-yellow-900/20 border border-yellow-600 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{q.title}</p>
                        <p className="text-yellow-300 text-sm">
                          Episode {q.episodeNumber} • {qSubmissions.length}/{players.length} submitted
                        </p>
                        {q.scoresReleased && (
                          <span className="text-green-400 text-sm">✓ Scores Released</span>
                        )}
                      </div>
                      {!q.scoresReleased && (
                        <button
                          onClick={() => {
                            setScoringQ(q);
                            setCorrectAnswers(q.correctAnswers || {});
                            setAdminView('score-questionnaire');
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-500 transition"
                        >
                          Score Questionnaire
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
          <h3 className="text-yellow-300 font-semibold mb-2">Game Status</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-yellow-200 text-sm">Current Phase</p>
              <p className="text-white font-bold capitalize">{gamePhase.replace('-', ' ')}</p>
            </div>
            <div>
              <p className="text-yellow-200 text-sm">Instinct Picks</p>
              <p className="text-white font-bold">{pickStatus.submitted}/{pickStatus.total} submitted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
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