import React, { useState, useEffect } from 'react';
import { Users, Trophy, Flame, Mail, User, LogOut, Settings, ChevronRight, ChevronLeft, Crown, Target, FileText, Zap, Gift, Bell, Check, X, Clock, Award, TrendingUp, Star, ChevronDown, ChevronUp, Home, AlertCircle, Edit3, Plus, Trash2, Upload, RefreshCw, Archive, Image, Eye, Key, Download, Database, RotateCcw } from 'lucide-react';
import { storage, auth, backup } from './db.js';

// Survivor 48 Cast
const SURVIVOR_48_CAST = [
  // CIVA Tribe (Green)
  { id: 1, name: "Kyle Fraser", tribe: "Civa", image: "/cast/Kyle Fraser.jpg" },
  { id: 2, name: "Cedrek McFadden", tribe: "Civa", image: "/cast/Cedrek McFadden.jpg" },
  { id: 3, name: "Charity Nelms", tribe: "Civa", image: "/cast/Charity Nelms.jpg" },
  { id: 4, name: "Chrissy Sarnowsky", tribe: "Civa", image: "/cast/Chrissy Sarnowsky.jpg" },
  { id: 5, name: "Kamilla Karthigesu", tribe: "Civa", image: "/cast/Kamilla Karthigesu.jpg" },
  { id: 6, name: "David Kinne", tribe: "Civa", image: "/cast/David Kinne.jpg" },
  // LAGI Tribe (Orange)
  { id: 7, name: "Thomas Krottinger", tribe: "Lagi", image: "/cast/Thomas Krottinger.jpg" },
  { id: 8, name: "Star Toomey", tribe: "Lagi", image: "/cast/Star Toomey.jpg" },
  { id: 9, name: "Shauhin Davari", tribe: "Lagi", image: "/cast/Shauhin Davari.jpg" },
  { id: 10, name: "Joe Hunter", tribe: "Lagi", image: "/cast/Joe Hunter.jpg" },
  { id: 11, name: "Bianca Roses", tribe: "Lagi", image: "/cast/Bianca Roses.jpg" },
  { id: 12, name: "Eva Erickson", tribe: "Lagi", image: "/cast/Eva Erickson.jpg" },
  // VULA Tribe (Blue)
  { id: 13, name: "Stephanie Burger", tribe: "Vula", image: "/cast/Stephanie Burger.jpg" },
  { id: 14, name: "Mary Zheng", tribe: "Vula", image: "/cast/Mary Zheng.jpg" },
  { id: 15, name: "Kevin Leung", tribe: "Vula", image: "/cast/Kevin Leung.jpg" },
  { id: 16, name: "Saiounia 'Sai' Hughley", tribe: "Vula", image: "/cast/Saiounia 'Sai' Hughley.jpg" },
  { id: 17, name: "Justin Pioppi", tribe: "Vula", image: "/cast/Justin Pioppi.jpg" },
  { id: 18, name: "Mitch Guerra", tribe: "Vula", image: "/cast/Mitch Guerra.jpg" }
];

// Contestant bios (placeholder data - update with real bios)
const CONTESTANT_BIOS = {
  // CIVA Tribe
  1: "Kyle Fraser is ready to outwit, outplay, and outlast on Survivor 48. Representing the Civa tribe, he's bringing his A-game to Fiji.",
  2: "Cedrek McFadden joins the Civa tribe with a strategic mindset and determination to go far in the game.",
  3: "Charity Nelms is competing on Civa tribe this season. She's ready to form alliances and make her mark on Survivor 48.",
  4: "Chrissy Sarnowsky brings her competitive spirit to the Civa tribe. She's not here to make friends - she's here to win.",
  5: "Kamilla Karthigesu represents Civa tribe on Survivor 48. Her social game and strategic thinking could take her far.",
  6: "David Kinne rounds out the Civa tribe. He's ready to prove he has what it takes to be the Sole Survivor.",
  // LAGI Tribe
  7: "Thomas Krottinger is competing on Lagi tribe this season. He's bringing physical strength and mental fortitude to the game.",
  8: "Star Toomey shines bright on the Lagi tribe. Her charisma and determination make her a player to watch.",
  9: "Shauhin Davari joins Lagi tribe ready to adapt and overcome any challenge thrown his way.",
  10: "Joe Hunter brings his survival skills to Lagi tribe. As a natural provider, he hopes to be an asset to his team.",
  11: "Bianca Roses represents Lagi tribe on Survivor 48. She's ready to bloom in the game and outlast the competition.",
  12: "Eva Erickson completes the Lagi tribe lineup. Her strategic mind and social awareness could be her ticket to the end.",
  // VULA Tribe
  13: "Stephanie Burger is competing on Vula tribe this season. She's hungry for the win and ready to fight for it.",
  14: "Mary Zheng brings her analytical skills to Vula tribe. She's playing the long game from day one.",
  15: "Kevin Leung represents Vula tribe on Survivor 48. His adaptability and calm demeanor could serve him well.",
  16: "Saiounia 'Sai' Hughley joins Vula tribe with a positive attitude and fierce competitive spirit.",
  17: "Justin Pioppi brings his determination to Vula tribe. He's ready to prove he deserves to be the Sole Survivor.",
  18: "Mitch Guerra rounds out the Vula tribe. His physical and social game make him a triple threat in the competition."
};

const INITIAL_PLAYERS = [
  { id: 1, name: "Joshua", isAdmin: true },
  { id: 2, name: "Charlie", isAdmin: false },
  { id: 3, name: "Emma", isAdmin: false },
  { id: 4, name: "Tyler", isAdmin: false },
  { id: 5, name: "Brayden", isAdmin: false },
  { id: 6, name: "Dakota", isAdmin: false },
  { id: 7, name: "Patia", isAdmin: false },
  { id: 8, name: "Kaleigh", isAdmin: false },
  { id: 9, name: "Sarah", isAdmin: false }
];

// Default password for all players
const DEFAULT_PASSWORD = 'password123';

// Security questions for password recovery
const SECURITY_QUESTIONS = [
  "What is your favorite Survivor season?",
  "Who is your all-time favorite Survivor player?",
  "What is the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?"
];

// Survivor-themed 5-letter words for Wordle challenge
const SURVIVOR_WORDS = [
  'TRIBE', 'MERGE', 'TORCH', 'SNUFF', 'VOTES', 'IDOLS', 'EXILE', 'FLAME',
  'FEAST', 'FINAL', 'BLIND', 'SPLIT', 'TRUST', 'BEACH', 'TWIST', 'FLINT',
  'SPEAR', 'BRAWN', 'BRAIN', 'BUFFS', 'QUEST', 'PRIZE', 'CHAOS', 'RIVAL',
  'ALPHA', 'LOYAL', 'POWER', 'SNAKE', 'STORM', 'SWAMP'
];

// Default Advantages Available for Purchase
// SCARCITY RULE: Only ONE of each advantage can exist in the game at a time
// Once purchased, no one else can buy it. Once PLAYED, it returns to the shop.
const DEFAULT_ADVANTAGES = [
  { id: 'extra-vote', name: 'Extra Vote', description: 'Cast an additional vote for another player\'s Question of the Week answer', cost: 15, type: 'qotw' },
  { id: 'vote-steal', name: 'Vote Steal', description: 'Steal a vote from another player (prevents them from voting) and auto-apply it to yourself', cost: 20, type: 'qotw' },
  { id: 'double-trouble', name: 'Double Trouble', description: 'Double ALL your points for the week (questionnaire, picks, QOTW) when scores are released', cost: 25, type: 'multiplier' },
  { id: 'immunity-idol', name: 'Immunity Idol', description: 'Negate all your negative points for the week when scores are released', cost: 30, type: 'protection' },
  { id: 'knowledge-is-power', name: 'Knowledge is Power', description: 'Steal another player\'s advantage (if they have none, the advantage is wasted)', cost: 35, type: 'steal' }
];

export default function SurvivorFantasyApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginView, setLoginView] = useState('login');
  const [loginForm, setLoginForm] = useState({ name: '', password: '', rememberMe: true });
  const [recoveryForm, setRecoveryForm] = useState({ name: '', securityAnswer: '', newPassword: '', confirmPassword: '' });
  const [recoveryStep, setRecoveryStep] = useState('name'); // 'name', 'answer', 'reset'
  const [recoveryPlayer, setRecoveryPlayer] = useState(null);
  
  // Game state
  const [players, setPlayers] = useState([]);
  const [contestants, setContestants] = useState([]);
  const [picks, setPicks] = useState([]);
  const [picksLocked, setPicksLocked] = useState({ instinct: false, final: false });
  const [gamePhase, setGamePhase] = useState('instinct-picks');
  const [currentView, setCurrentView] = useState('home');
  const [questionnaires, setQuestionnaires] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [qotWVotes, setQotWVotes] = useState([]);
  const [latePenalties, setLatePenalties] = useState({});
  const [pickScores, setPickScores] = useState([]);
  const [advantages, setAdvantages] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [playerAdvantages, setPlayerAdvantages] = useState([]);
  const [playerScores, setPlayerScores] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [securitySetup, setSecuritySetup] = useState({ question: '', answer: '' });
  const [passwordChange, setPasswordChange] = useState({ current: '', new: '', confirm: '' });
  const [hasSecurityQuestion, setHasSecurityQuestion] = useState(false);
  const [currentSeason, setCurrentSeason] = useState(48);
  const [seasonHistory, setSeasonHistory] = useState([]);
  const [castAccordionOpen, setCastAccordionOpen] = useState(false);
  
  // Wordle Challenge state
  const [challenges, setChallenges] = useState([]);
  const [challengeAttempts, setChallengeAttempts] = useState([]);

  // Backup snapshots state
  const [snapshots, setSnapshots] = useState([]);
  const [loadingBackup, setLoadingBackup] = useState(false);

  // Advantage play modal state
  const [advantageModal, setAdvantageModal] = useState({ show: false, advantage: null, step: 'confirm' });
  const [advantageTarget, setAdvantageTarget] = useState(null);

  // Banner notification tracking - IDs of banners currently visible on Home tab
  const [visibleBannerIds, setVisibleBannerIds] = useState([]);
  const [previousView, setPreviousView] = useState('home');

  // Check for remembered login on mount
  // Helper function to check if current user is a guest
  const isGuestMode = () => currentUser?.isGuest === true;

  // Helper function for guest-safe storage writes
  // Returns fake success for guests, actually saves for real users
  const guestSafeSet = async (key, value) => {
    if (isGuestMode()) {
      return { key, value }; // Fake success - don't actually save
    }
    return storage.set(key, value);
  };

  useEffect(() => {
    const remembered = localStorage.getItem('survivorFantasyUser');
    if (remembered) {
      try {
        const userData = JSON.parse(remembered);
        const player = INITIAL_PLAYERS.find(p => p.id === userData.id);
        if (player) {
          setCurrentUser(player);
        }
      } catch (e) {
        localStorage.removeItem('survivorFantasyUser');
      }
    }
  }, []);

  // Load data from storage
  useEffect(() => {
    loadGameData();
  }, []);

  // Wordle challenges are now fully admin-controlled (no auto-create or auto-end)

  // Check if current user has security question
  useEffect(() => {
    const checkSecurityQuestion = async () => {
      if (currentUser) {
        const securityData = await storage.get(`security_${currentUser.id}`);
        setHasSecurityQuestion(!!securityData);
      }
    };
    checkSecurityQuestion();
  }, [currentUser]);

  // Mark banner notifications as seen when leaving Home tab
  useEffect(() => {
    // Only run when view changes FROM 'home' to something else
    if (previousView === 'home' && currentView !== 'home' && visibleBannerIds.length > 0) {
      // Mark all visible banners as seen for this user
      visibleBannerIds.forEach(notifId => {
        markNotificationSeen(notifId);
      });
      setVisibleBannerIds([]);
    }
    setPreviousView(currentView);
  }, [currentView]);

  // Auto-mark banners as seen after 30 seconds on Home tab
  useEffect(() => {
    if (currentView === 'home' && visibleBannerIds.length > 0) {
      const timer = setTimeout(() => {
        visibleBannerIds.forEach(notifId => {
          markNotificationSeen(notifId);
        });
        setVisibleBannerIds([]);
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, [currentView, visibleBannerIds.join(',')]);

  const loadGameData = async () => {
    try {
      const playersData = await storage.get('players');
      const contestantsData = await storage.get('contestants');
      const picksData = await storage.get('picks');
      const picksLockedData = await storage.get('picksLocked');
      const gamePhaseData = await storage.get('gamePhase');
      const questionnairesData = await storage.get('questionnaires');
      const submissionsData = await storage.get('submissions');
      const qotWVotesData = await storage.get('qotWVotes');
      const latePenaltiesData = await storage.get('latePenalties');
      const pickScoresData = await storage.get('pickScores');
      const advantagesData = await storage.get('advantages');
      const episodesData = await storage.get('episodes');
      const notificationsData = await storage.get('notifications');
      const playerAdvantagesData = await storage.get('playerAdvantages');
      const playerScoresData = await storage.get('playerScores');
      const currentSeasonData = await storage.get('currentSeason');
      const seasonHistoryData = await storage.get('seasonHistory');
      const challengesData = await storage.get('challenges');
      const challengeAttemptsData = await storage.get('challengeAttempts');

      setPlayers(playersData ? JSON.parse(playersData.value) : INITIAL_PLAYERS);
      setContestants(contestantsData ? JSON.parse(contestantsData.value) : SURVIVOR_48_CAST);
      setCurrentSeason(currentSeasonData ? parseInt(currentSeasonData.value) : 48);
      setSeasonHistory(seasonHistoryData ? JSON.parse(seasonHistoryData.value) : []);
      setChallenges(challengesData ? JSON.parse(challengesData.value) : []);
      setChallengeAttempts(challengeAttemptsData ? JSON.parse(challengeAttemptsData.value) : []);
      setPicks(picksData ? JSON.parse(picksData.value) : []);
      setPicksLocked(picksLockedData ? JSON.parse(picksLockedData.value) : { instinct: false, final: false });
      setGamePhase(gamePhaseData ? gamePhaseData.value : 'instinct-picks');
      setQuestionnaires(questionnairesData ? JSON.parse(questionnairesData.value) : []);
      setSubmissions(submissionsData ? JSON.parse(submissionsData.value) : []);
      setQotWVotes(qotWVotesData ? JSON.parse(qotWVotesData.value) : []);
      setLatePenalties(latePenaltiesData ? JSON.parse(latePenaltiesData.value) : {});
      setPickScores(pickScoresData ? JSON.parse(pickScoresData.value) : []);
      setAdvantages(advantagesData ? JSON.parse(advantagesData.value) : []);
      setEpisodes(episodesData ? JSON.parse(episodesData.value) : []);
      // Load notifications and clean up ones older than 7 days
      if (notificationsData) {
        const allNotifications = JSON.parse(notificationsData.value);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentNotifications = allNotifications.filter(n =>
          new Date(n.createdAt) > sevenDaysAgo
        );
        // If we removed any old notifications, save the cleaned list
        if (recentNotifications.length !== allNotifications.length) {
          await storage.set('notifications', JSON.stringify(recentNotifications));
        }
        setNotifications(recentNotifications);
      } else {
        setNotifications([]);
      }

      setPlayerAdvantages(playerAdvantagesData ? JSON.parse(playerAdvantagesData.value) : []);
      setPlayerScores(playerScoresData ? JSON.parse(playerScoresData.value) : {});

      // Initialize default passwords for any player that doesn't have one
      for (const player of INITIAL_PLAYERS) {
        const existingPassword = await storage.get(`password_${player.id}`);
        if (!existingPassword) {
          await storage.set(`password_${player.id}`, DEFAULT_PASSWORD);
        }
      }
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
      setPlayerAdvantages([]);
      setPlayerScores({});
      setCurrentSeason(48);
      setSeasonHistory([]);

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
      await storage.set('playerAdvantages', JSON.stringify([]));
      await storage.set('playerScores', JSON.stringify({}));
      await storage.set('currentSeason', '48');
      await storage.set('seasonHistory', JSON.stringify([]));
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
      // Use server-side password verification
      const result = await auth.login(player.id, loginForm.password);

      if (result.success) {
        setCurrentUser(player);
        if (loginForm.rememberMe) {
          localStorage.setItem('survivorFantasyUser', JSON.stringify({ id: player.id, name: player.name }));
        }
      } else {
        alert('Invalid username or password');
      }
    } else {
      // Don't reveal whether username exists - same error message
      alert('Invalid username or password');
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      id: 'guest',
      name: 'Guest',
      isAdmin: true, // Allow viewing admin panel (read-only)
      isGuest: true  // Flag to prevent writes
    };
    setCurrentUser(guestUser);
  };

  const handleFindPlayer = async () => {
    if (!recoveryForm.name) {
      alert('Please enter your name');
      return;
    }

    const player = players.find(p =>
      p.name.toLowerCase() === recoveryForm.name.toLowerCase()
    );

    if (player) {
      // Check if they have a security question set up
      const securityData = await storage.get(`security_${player.id}`);
      if (securityData) {
        setRecoveryPlayer({ ...player, securityQuestion: JSON.parse(securityData.value).question });
        setRecoveryStep('answer');
      } else {
        // No security question set up - let them set one up now
        alert('No security question found. Please contact the admin (Joshua) to reset your password.');
      }
    } else {
      alert('Player not found. Valid players: ' + players.map(p => p.name).join(', '));
    }
  };

  const handleVerifySecurityAnswer = async () => {
    if (!recoveryForm.securityAnswer) {
      alert('Please enter your security answer');
      return;
    }

    const securityData = await storage.get(`security_${recoveryPlayer.id}`);
    if (securityData) {
      const { answer } = JSON.parse(securityData.value);
      if (recoveryForm.securityAnswer.toLowerCase().trim() === answer.toLowerCase().trim()) {
        setRecoveryStep('reset');
      } else {
        alert('Incorrect answer. Please try again.');
      }
    }
  };

  const handleResetPassword = async () => {
    if (!recoveryForm.newPassword || !recoveryForm.confirmPassword) {
      alert('Please fill in both password fields');
      return;
    }

    if (recoveryForm.newPassword !== recoveryForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (recoveryForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    // Use server-side password hashing
    const result = await auth.setPassword(recoveryPlayer.id, recoveryForm.newPassword);

    if (result.success) {
      alert('Password reset successfully! You can now login with your new password.');
      // Reset and go back to login
      setRecoveryForm({ name: '', securityAnswer: '', newPassword: '', confirmPassword: '' });
      setRecoveryStep('name');
      setRecoveryPlayer(null);
      setLoginView('login');
    } else {
      alert('Failed to reset password. Please try again.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ name: '', password: '', rememberMe: true });
    setRecoveryForm({ name: '', securityAnswer: '', newPassword: '', confirmPassword: '' });
    setRecoveryStep('name');
    setRecoveryPlayer(null);
    localStorage.removeItem('survivorFantasyUser');
  };

  const setupSecurityQuestion = async (question, answer) => {
    if (!currentUser) return;
    await storage.set(`security_${currentUser.id}`, JSON.stringify({ question, answer }));
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!currentUser) return false;

    // Verify current password server-side
    const verifyResult = await auth.verifyCurrentPassword(currentUser.id, currentPassword);
    if (!verifyResult.valid) {
      return false;
    }

    // Set new password (hashed server-side)
    const setResult = await auth.setPassword(currentUser.id, newPassword);
    return setResult.success;
  };

  // Cast Management Functions
  const updateContestant = async (contestantId, updates) => {
    const updated = contestants.map(c =>
      c.id === contestantId ? { ...c, ...updates } : c
    );
    setContestants(updated);
    await storage.set('contestants', JSON.stringify(updated));
  };

  const addContestant = async (newContestant) => {
    const maxId = Math.max(...contestants.map(c => c.id), 0);
    const contestant = {
      id: maxId + 1,
      name: newContestant.name || 'New Contestant',
      tribe: newContestant.tribe || 'TBD',
      image: newContestant.image || '',
      eliminated: false
    };
    const updated = [...contestants, contestant];
    setContestants(updated);
    await storage.set('contestants', JSON.stringify(updated));
    return contestant;
  };

  const removeContestant = async (contestantId) => {
    // Check if any picks reference this contestant
    const picksWithContestant = picks.filter(p => p.contestantId === contestantId);
    if (picksWithContestant.length > 0) {
      alert('Cannot remove contestant - they have been picked by players. Mark as eliminated instead.');
      return false;
    }
    const updated = contestants.filter(c => c.id !== contestantId);
    setContestants(updated);
    await storage.set('contestants', JSON.stringify(updated));
    return true;
  };

  const updateTribeName = async (oldTribeName, newTribeName) => {
    const updated = contestants.map(c =>
      c.tribe === oldTribeName ? { ...c, tribe: newTribeName } : c
    );
    setContestants(updated);
    await storage.set('contestants', JSON.stringify(updated));
  };

  // Season Management Functions
  const archiveCurrentSeason = async () => {
    const seasonData = {
      season: currentSeason,
      archivedAt: new Date().toISOString(),
      contestants: [...contestants],
      picks: [...picks],
      questionnaires: [...questionnaires],
      submissions: [...submissions],
      pickScores: [...pickScores],
      qotWVotes: [...qotWVotes],
      episodes: [...episodes],
      gamePhase,
      finalStandings: [...players]
        .map(p => ({ ...p, points: calculateTotalPoints(p.id) }))
        .sort((a, b) => b.points - a.points)
    };

    const updatedHistory = [...seasonHistory, seasonData];
    setSeasonHistory(updatedHistory);
    await storage.set('seasonHistory', JSON.stringify(updatedHistory));
    await storage.set(`season_${currentSeason}_archive`, JSON.stringify(seasonData));

    return seasonData;
  };

  const startNewSeason = async (newSeasonNumber, newCast = null) => {
    // Archive current season first
    await archiveCurrentSeason();

    // Reset all game data for new season
    const defaultCast = newCast || contestants.map(c => ({
      ...c,
      eliminated: false,
      id: c.id
    }));

    setCurrentSeason(newSeasonNumber);
    setContestants(defaultCast);
    setPicks([]);
    setPicksLocked({ instinct: false, final: false });
    setQuestionnaires([]);
    setSubmissions([]);
    setQotWVotes([]);
    setPickScores([]);
    setEpisodes([]);
    setGamePhase('instinct-picks');
    setPlayerAdvantages([]);
    // Keep playerScores - they carry over between seasons or reset based on your preference
    // For now, let's keep them to maintain the economy

    await storage.set('currentSeason', newSeasonNumber.toString());
    await storage.set('contestants', JSON.stringify(defaultCast));
    await storage.set('picks', JSON.stringify([]));
    await storage.set('picksLocked', JSON.stringify({ instinct: false, final: false }));
    await storage.set('questionnaires', JSON.stringify([]));
    await storage.set('submissions', JSON.stringify([]));
    await storage.set('qotWVotes', JSON.stringify([]));
    await storage.set('pickScores', JSON.stringify([]));
    await storage.set('episodes', JSON.stringify([]));
    await storage.set('gamePhase', 'instinct-picks');
    await storage.set('playerAdvantages', JSON.stringify([]));

    await addNotification({
      type: 'new_season',
      message: `Season ${newSeasonNumber} has begun! Time to make your Instinct Picks!`,
      targetPlayerId: null
    });

    return true;
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
    await guestSafeSet('picks', JSON.stringify(updatedPicks));
    alert(isGuestMode() ? 'Instinct pick submitted! (Demo mode - not saved)' : 'Instinct pick submitted!');
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
    await guestSafeSet('picks', JSON.stringify(updatedPicks));
    alert(isGuestMode() ? 'Final pick submitted! (Demo mode - not saved)' : 'Final pick submitted!');
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

  const togglePicksLock = async (pickType) => {
    if (isGuestMode()) {
      alert('Demo mode: Lock/Unlock Picks is disabled. Log in as a real user to make changes.');
      return;
    }

    const newLocked = { ...picksLocked, [pickType]: !picksLocked[pickType] };
    setPicksLocked(newLocked);
    await storage.set('picksLocked', JSON.stringify(newLocked));

    const action = newLocked[pickType] ? 'locked' : 'unlocked';
    const pickName = pickType === 'instinct' ? 'Instinct' : 'Final';
    alert(`${pickName} picks have been ${action}!`);
  };

  const getActiveContestants = () => {
    return contestants.filter(c => !c.eliminated);
  };

  const calculateTotalPoints = (playerId) => {
    let total = 0;

    // Points from pick performance (episodes)
    const playerPickScores = pickScores.filter(ps => {
      const pick = picks.find(p => p.id === ps.pickId);
      return pick && pick.playerId === playerId;
    });
    total += playerPickScores.reduce((sum, ps) => sum + ps.points, 0);

    // Points from questionnaires
    const playerSubmissions = submissions.filter(s => s.playerId === playerId && s.score !== undefined);
    total += playerSubmissions.reduce((sum, s) => sum + s.score, 0);

    // Points from QOTW wins
    const qotwWins = questionnaires.filter(q => {
      if (!q.qotwWinner) return false;
      const winners = Array.isArray(q.qotwWinner) ? q.qotwWinner : [q.qotwWinner];
      return winners.includes(playerId);
    });
    total += qotwWins.length * 5;

    // Points from playerScores breakdown (includes advantage purchases as negative)
    if (playerScores[playerId]?.breakdown) {
      total += playerScores[playerId].breakdown.reduce((sum, entry) => sum + entry.points, 0);
    }

    return total;
  };

  const getPointBreakdown = (playerId) => {
    const breakdown = [];

    // Pick scores (episode performance)
    const playerPickScoresData = pickScores.filter(ps => {
      const pick = picks.find(p => p.id === ps.pickId);
      return pick && pick.playerId === playerId;
    });
    playerPickScoresData.forEach(ps => {
      breakdown.push({
        description: ps.description || `Episode ${ps.episode} Pick Performance`,
        points: ps.points,
        date: ps.date || new Date().toISOString(),
        type: 'episode'
      });
    });

    // Questionnaire scores
    const playerSubmissions = submissions.filter(s => s.playerId === playerId && s.score !== undefined);
    playerSubmissions.forEach(sub => {
      const q = questionnaires.find(qu => qu.id === sub.questionnaireId);
      if (q) {
        breakdown.push({
          description: `${q.title} Score`,
          points: sub.score,
          date: sub.submittedAt,
          type: 'questionnaire'
        });
      }
    });

    // QOTW wins
    questionnaires.forEach(q => {
      if (!q.qotwWinner) return;
      const winners = Array.isArray(q.qotwWinner) ? q.qotwWinner : [q.qotwWinner];
      if (winners.includes(playerId)) {
        breakdown.push({
          description: `QOTW Winner - ${q.title}`,
          points: 5,
          date: q.createdAt,
          type: 'qotw'
        });
      }
    });

    // Custom scores from playerScores (advantages, etc.)
    if (playerScores[playerId]?.breakdown) {
      playerScores[playerId].breakdown.forEach(entry => {
        breakdown.push({
          ...entry,
          type: entry.type || 'other'
        });
      });
    }

    // Sort by date descending
    breakdown.sort((a, b) => new Date(b.date) - new Date(a.date));

    return breakdown;
  };

  const updatePlayerScore = async (playerId, points, description, type = 'other') => {
    const currentScores = { ...playerScores };
    if (!currentScores[playerId]) {
      currentScores[playerId] = { totalPoints: 0, breakdown: [] };
    }

    currentScores[playerId].breakdown.push({
      description,
      points,
      date: new Date().toISOString(),
      type
    });
    currentScores[playerId].totalPoints = currentScores[playerId].breakdown.reduce((sum, e) => sum + e.points, 0);

    setPlayerScores(currentScores);
    await storage.set('playerScores', JSON.stringify(currentScores));
  };

  const addNotification = async (notification) => {
    const newNotif = {
      id: Date.now(),
      ...notification,
      createdAt: new Date().toISOString(),
      readBy: [], // Array of user IDs who have read this notification
      seenBy: [] // Array of user IDs who have seen the banner (per-user tracking)
    };
    const updated = [...notifications, newNotif];
    setNotifications(updated);
    await storage.set('notifications', JSON.stringify(updated));
  };

  const markNotificationRead = async (notifId) => {
    const updated = notifications.map(n => {
      if (n.id === notifId) {
        const readBy = n.readBy || [];
        if (!readBy.includes(currentUser.id)) {
          return { ...n, readBy: [...readBy, currentUser.id] };
        }
      }
      return n;
    });
    setNotifications(updated);
    await storage.set('notifications', JSON.stringify(updated));
  };

  const markNotificationSeen = async (notifId) => {
    const updated = notifications.map(n => {
      if (n.id === notifId) {
        const seenBy = n.seenBy || [];
        if (!seenBy.includes(currentUser.id)) {
          return { ...n, seenBy: [...seenBy, currentUser.id] };
        }
      }
      return n;
    });
    setNotifications(updated);
    await storage.set('notifications', JSON.stringify(updated));
  };

  const markAllNotificationsRead = async () => {
    const updated = notifications.map(n => {
      if (n.targetPlayerId === currentUser?.id || !n.targetPlayerId) {
        const readBy = n.readBy || [];
        if (!readBy.includes(currentUser.id)) {
          return { ...n, readBy: [...readBy, currentUser.id] };
        }
      }
      return n;
    });
    setNotifications(updated);
    await storage.set('notifications', JSON.stringify(updated));
  };

  const deleteNotification = async (notifId) => {
    const updated = notifications.filter(n => n.id !== notifId);
    setNotifications(updated);
    await storage.set('notifications', JSON.stringify(updated));
  };

  const clearAllNotifications = async () => {
    if (!window.confirm('Delete all notifications? This cannot be undone.')) return;
    setNotifications([]);
    await storage.set('notifications', JSON.stringify([]));
  };

  // Check if an advantage is available to purchase (no one owns it unused)
  const isAdvantageAvailable = (advantageId) => {
    return !playerAdvantages.some(pa => pa.advantageId === advantageId && !pa.used);
  };

  const purchaseAdvantage = async (advantage) => {
    const totalPoints = calculateTotalPoints(currentUser.id);
    if (totalPoints < advantage.cost) {
      alert('Insufficient points to purchase this advantage!');
      return;
    }

    // Check global scarcity - only one of each can exist at a time
    if (!isAdvantageAvailable(advantage.id)) {
      alert('This advantage has already been purchased by another player!');
      return;
    }

    const newPlayerAdvantage = {
      id: Date.now(),
      playerId: currentUser.id,
      advantageId: advantage.id,
      name: advantage.name,
      description: advantage.description,
      type: advantage.type,
      purchasedAt: new Date().toISOString(),
      used: false,
      activated: false, // For tracking if effect should apply
      targetPlayerId: null, // For vote steal, knowledge is power
      linkedQuestionnaireId: null // For tracking which questionnaire the effect applies to
    };

    const updated = [...playerAdvantages, newPlayerAdvantage];
    setPlayerAdvantages(updated);
    await guestSafeSet('playerAdvantages', JSON.stringify(updated));

    // Skip point deduction and notifications for guest mode
    if (!isGuestMode()) {
      // Deduct points
      await updatePlayerScore(currentUser.id, -advantage.cost, `Purchased: ${advantage.name}`, 'advantage');

      // Send anonymous notification to all players
      await addNotification({
        type: 'advantage_purchased',
        message: `An advantage has been purchased! One less available in the shop.`,
        targetPlayerId: null // Broadcast to all
      });
    }

    alert(isGuestMode() ? `Successfully purchased ${advantage.name}! (Demo mode - not saved)` : `Successfully purchased ${advantage.name}!`);
  };

  const useAdvantage = async (playerAdvantageId, targetData = null) => {
    const advantage = playerAdvantages.find(a => a.id === playerAdvantageId);
    if (!advantage || advantage.used) {
      alert('This advantage has already been used!');
      return;
    }

    // Mark as used and store any target data
    const updated = playerAdvantages.map(a =>
      a.id === playerAdvantageId
        ? {
            ...a,
            used: true,
            usedAt: new Date().toISOString(),
            activated: true,
            targetPlayerId: targetData?.targetPlayerId || null,
            linkedQuestionnaireId: targetData?.questionnaireId || null
          }
        : a
    );
    setPlayerAdvantages(updated);
    await guestSafeSet('playerAdvantages', JSON.stringify(updated));

    // Skip notifications for guest mode
    if (!isGuestMode()) {
      // Send anonymous notification that advantage was played and returned to game
      await addNotification({
        type: 'advantage_played',
        message: `An advantage has been played and returned to the game!`,
        targetPlayerId: null // Broadcast to all
      });

      // Add specific notification if there's a target player (for Vote Steal, Knowledge is Power)
      if (targetData?.targetPlayerId && targetData?.notifyTarget) {
        const targetPlayer = players.find(p => p.id === targetData.targetPlayerId);
        await addNotification({
          type: 'advantage_used_on_you',
          message: targetData.targetMessage || `An advantage was used targeting you!`,
          targetPlayerId: targetData.targetPlayerId
        });
      }
    }

    return true;
  };

  // Execute Knowledge is Power - steal advantage from target
  const executeKnowledgeIsPower = async (playerAdvantageId, targetPlayerId) => {
    const myAdvantage = playerAdvantages.find(a => a.id === playerAdvantageId);
    if (!myAdvantage || myAdvantage.used) {
      alert('This advantage has already been used!');
      return;
    }

    // Find target's unused advantage
    const targetAdvantage = playerAdvantages.find(
      a => a.playerId === targetPlayerId && !a.used
    );

    if (targetAdvantage) {
      // Steal the advantage - transfer ownership
      const updated = playerAdvantages.map(a => {
        if (a.id === myAdvantage.id) {
          // Mark Knowledge is Power as used
          return { ...a, used: true, usedAt: new Date().toISOString(), activated: true, targetPlayerId };
        }
        if (a.id === targetAdvantage.id) {
          // Transfer to current user
          return { ...a, playerId: currentUser.id, stolenFrom: targetPlayerId, stolenAt: new Date().toISOString() };
        }
        return a;
      });
      setPlayerAdvantages(updated);
      await guestSafeSet('playerAdvantages', JSON.stringify(updated));

      const targetPlayer = players.find(p => p.id === targetPlayerId);

      // Skip notifications for guest mode
      if (!isGuestMode()) {
        // Notify the target that their advantage was stolen
        await addNotification({
          type: 'advantage_stolen',
          message: `Your ${targetAdvantage.name} was stolen by another player using Knowledge is Power!`,
          targetPlayerId: targetPlayerId
        });

        // Anonymous broadcast
        await addNotification({
          type: 'advantage_played',
          message: `An advantage has been played and returned to the game!`,
          targetPlayerId: null
        });
      }

      alert(isGuestMode()
        ? `Success! You stole ${targetAdvantage.name} from ${targetPlayer?.name || 'another player'}! (Demo mode - not saved)`
        : `Success! You stole ${targetAdvantage.name} from ${targetPlayer?.name || 'another player'}!`);
    } else {
      // Target has no advantage - wasted
      const updated = playerAdvantages.map(a => {
        if (a.id === myAdvantage.id) {
          return { ...a, used: true, usedAt: new Date().toISOString(), activated: true, targetPlayerId, wasted: true };
        }
        return a;
      });
      setPlayerAdvantages(updated);
      await guestSafeSet('playerAdvantages', JSON.stringify(updated));

      // Skip notifications for guest mode
      if (!isGuestMode()) {
        // Anonymous broadcast
        await addNotification({
          type: 'advantage_played',
          message: `An advantage has been played and returned to the game!`,
          targetPlayerId: null
        });
      }

      const targetPlayer = players.find(p => p.id === targetPlayerId);
      alert(isGuestMode()
        ? `${targetPlayer?.name || 'That player'} had no advantage to steal. Knowledge is Power was wasted. (Demo mode - not saved)`
        : `${targetPlayer?.name || 'That player'} had no advantage to steal. Knowledge is Power was wasted and returned to the game.`);
    }
  };

  // Execute Vote Steal - block target from voting and auto-vote for self
  const executeVoteSteal = async (playerAdvantageId, targetPlayerId, questionnaireId) => {
    const myAdvantage = playerAdvantages.find(a => a.id === playerAdvantageId);
    if (!myAdvantage || myAdvantage.used) {
      alert('This advantage has already been used!');
      return;
    }

    // Mark advantage as used with target info
    const updated = playerAdvantages.map(a => {
      if (a.id === myAdvantage.id) {
        return {
          ...a,
          used: true,
          usedAt: new Date().toISOString(),
          activated: true,
          targetPlayerId,
          linkedQuestionnaireId: questionnaireId
        };
      }
      return a;
    });
    setPlayerAdvantages(updated);
    await guestSafeSet('playerAdvantages', JSON.stringify(updated));

    // Find current user's submission for this questionnaire to get their QOTW answer ID
    const mySubmission = submissions.find(s => s.questionnaireId === questionnaireId && s.playerId === currentUser.id);
    const questionnaire = questionnaires.find(q => q.id === questionnaireId);

    if (mySubmission && questionnaire?.qotw?.id) {
      // Auto-add a "stolen vote" for the current user
      const stolenVote = {
        questionnaireId: questionnaireId,
        voterId: `stolen-from-${targetPlayerId}`,
        answerId: `${currentUser.id}-${questionnaire.qotw.id}`,
        isStolen: true,
        stolenFrom: targetPlayerId,
        stolenBy: currentUser.id
      };

      const updatedVotes = [...qotWVotes, stolenVote];
      setQotWVotes(updatedVotes);
      await guestSafeSet('qotWVotes', JSON.stringify(updatedVotes));
    }

    const targetPlayer = players.find(p => p.id === targetPlayerId);

    // Skip notifications for guest mode
    if (!isGuestMode()) {
      // Notify target that their vote was stolen
      await addNotification({
        type: 'vote_stolen',
        message: `Your QOTW vote was stolen! You cannot vote on this week's Question of the Week.`,
        targetPlayerId: targetPlayerId
      });

      // Anonymous broadcast
      await addNotification({
        type: 'advantage_played',
        message: `An advantage has been played and returned to the game!`,
        targetPlayerId: null
      });
    }

    alert(isGuestMode()
      ? `Vote Steal activated! ${targetPlayer?.name || 'That player'} can no longer vote, and a vote has been added for you! (Demo mode - not saved)`
      : `Vote Steal activated! ${targetPlayer?.name || 'That player'} can no longer vote, and a vote has been added for you!`);
  };

  // Activate Extra Vote - allows additional QOTW vote
  const activateExtraVote = async (playerAdvantageId, questionnaireId) => {
    const myAdvantage = playerAdvantages.find(a => a.id === playerAdvantageId);
    if (!myAdvantage || myAdvantage.used) {
      alert('This advantage has already been used!');
      return;
    }

    // Mark advantage as used
    const updated = playerAdvantages.map(a => {
      if (a.id === myAdvantage.id) {
        return {
          ...a,
          used: true,
          usedAt: new Date().toISOString(),
          activated: true,
          linkedQuestionnaireId: questionnaireId
        };
      }
      return a;
    });
    setPlayerAdvantages(updated);
    await guestSafeSet('playerAdvantages', JSON.stringify(updated));

    // Skip notifications for guest mode
    if (!isGuestMode()) {
      // Anonymous broadcast
      await addNotification({
        type: 'advantage_played',
        message: `An advantage has been played and returned to the game!`,
        targetPlayerId: null
      });
    }

    alert(isGuestMode()
      ? `Extra Vote activated! You can now cast an additional vote in QOTW voting. (Demo mode - not saved)`
      : `Extra Vote activated! You can now cast an additional vote in QOTW voting.`);
    return true;
  };

  // Activate Double Trouble or Immunity Idol (effect applies when scores are released)
  const activateWeeklyAdvantage = async (playerAdvantageId, questionnaireId) => {
    const myAdvantage = playerAdvantages.find(a => a.id === playerAdvantageId);
    if (!myAdvantage || myAdvantage.used) {
      alert('This advantage has already been used!');
      return;
    }

    // Mark advantage as used and link to questionnaire
    const updated = playerAdvantages.map(a => {
      if (a.id === myAdvantage.id) {
        return {
          ...a,
          used: true,
          usedAt: new Date().toISOString(),
          activated: true,
          linkedQuestionnaireId: questionnaireId
        };
      }
      return a;
    });
    setPlayerAdvantages(updated);
    await guestSafeSet('playerAdvantages', JSON.stringify(updated));

    // Skip notifications for guest mode
    if (!isGuestMode()) {
      // Anonymous broadcast
      await addNotification({
        type: 'advantage_played',
        message: `An advantage has been played and returned to the game!`,
        targetPlayerId: null
      });
    }

    const advantageName = myAdvantage.name;
    alert(isGuestMode()
      ? `${advantageName} activated! The effect will apply when this week's scores are released. (Demo mode - not saved)`
      : `${advantageName} activated! The effect will apply when this week's scores are released.`);
    return true;
  };

  // ============ WORDLE CHALLENGE FUNCTIONS ============

  // Get the Monday 12:00 AM of the current week
  const getWeekStart = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Get Sunday 11:59:59 PM of the current week
  const getWeekEnd = (date = new Date()) => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  };

  // Get active challenge
  const getActiveChallenge = () => {
    return challenges.find(c => c.status === 'active');
  };

  // Get random word not used in recent challenges
  const getRandomWord = () => {
    const usedWords = challenges.slice(-10).map(c => c.word);
    const availableWords = SURVIVOR_WORDS.filter(w => !usedWords.includes(w));
    const words = availableWords.length > 0 ? availableWords : SURVIVOR_WORDS;
    return words[Math.floor(Math.random() * words.length)];
  };

  // Check if a challenge exists for this week
  const getChallengeForWeek = (weekStart) => {
    return challenges.find(c => {
      const challengeWeekStart = new Date(c.weekStart);
      return challengeWeekStart.toDateString() === weekStart.toDateString();
    });
  };

  // Finalize challenge and determine winner (called by admin)
  const finalizeChallenge = async (challengeId) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.status !== 'active') return;

    // Find winner: solved attempts, sorted by guesses (asc) then time (asc)
    const solvedAttempts = challengeAttempts
      .filter(a => a.challengeId === challengeId && a.solved)
      .sort((a, b) => {
        if (a.guesses.length !== b.guesses.length) {
          return a.guesses.length - b.guesses.length;
        }
        return a.timeSpent - b.timeSpent;
      });

    let winnerId = null;
    let winnerData = null;

    if (solvedAttempts.length > 0) {
      const winner = solvedAttempts[0];
      winnerId = winner.playerId;
      winnerData = {
        guesses: winner.guesses.length,
        timeSpent: winner.timeSpent
      };

      // Award 3 points to winner
      await updatePlayerScore(winnerId, 3, 'Wordle Challenge Winner', 'challenge');

      const winnerPlayer = players.find(p => p.id === winnerId);
      await addNotification({
        type: 'challenge_winner',
        message: `${winnerPlayer?.name || 'Someone'} won this week's Wordle Challenge with ${winnerData.guesses} guess${winnerData.guesses > 1 ? 'es' : ''}!`,
        targetPlayerId: null
      });
    } else {
      await addNotification({
        type: 'challenge_ended',
        message: 'This week\'s Wordle Challenge ended with no winner.',
        targetPlayerId: null
      });
    }

    // Update challenge status
    const updatedChallenges = challenges.map(c =>
      c.id === challengeId
        ? { ...c, status: 'completed', winnerId, winnerData }
        : c
    );
    setChallenges(updatedChallenges);
    await storage.set('challenges', JSON.stringify(updatedChallenges));
  };

  // Get player's attempt for a challenge
  const getPlayerAttempt = (challengeId, playerId) => {
    return challengeAttempts.find(
      a => a.challengeId === challengeId && a.playerId === playerId
    );
  };

  // Start or resume a challenge attempt
  const startChallengeAttempt = async (challengeId) => {
    const existing = getPlayerAttempt(challengeId, currentUser.id);

    if (existing) {
      // Resume: update lastActiveAt
      const updated = challengeAttempts.map(a =>
        a.id === existing.id
          ? { ...a, lastActiveAt: new Date().toISOString() }
          : a
      );
      setChallengeAttempts(updated);
      await guestSafeSet('challengeAttempts', JSON.stringify(updated));
      return existing;
    }

    // New attempt
    const newAttempt = {
      id: Date.now(),
      challengeId,
      playerId: currentUser.id,
      guesses: [],
      timeSpent: 0,
      startedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      completedAt: null,
      solved: false,
      status: 'in_progress'
    };

    const updated = [...challengeAttempts, newAttempt];
    setChallengeAttempts(updated);
    await guestSafeSet('challengeAttempts', JSON.stringify(updated));
    return newAttempt;
  };

  // Submit a guess
  const submitChallengeGuess = async (attemptId, guess, elapsedSinceLastSave) => {
    const attempt = challengeAttempts.find(a => a.id === attemptId);
    if (!attempt || attempt.status !== 'in_progress') return null;

    const challenge = challenges.find(c => c.id === attempt.challengeId);
    if (!challenge) return null;

    const normalizedGuess = guess.toUpperCase();
    const newGuesses = [...attempt.guesses, normalizedGuess];
    const isSolved = normalizedGuess === challenge.word;
    const isFailed = newGuesses.length >= 6 && !isSolved;

    const updatedAttempt = {
      ...attempt,
      guesses: newGuesses,
      timeSpent: attempt.timeSpent + elapsedSinceLastSave,
      lastActiveAt: new Date().toISOString(),
      solved: isSolved,
      status: isSolved ? 'completed' : (isFailed ? 'failed' : 'in_progress'),
      completedAt: (isSolved || isFailed) ? new Date().toISOString() : null
    };

    const updated = challengeAttempts.map(a =>
      a.id === attemptId ? updatedAttempt : a
    );
    setChallengeAttempts(updated);
    await guestSafeSet('challengeAttempts', JSON.stringify(updated));

    return updatedAttempt;
  };

  // Save time progress (called periodically and on visibility change)
  const saveChallengeTimeProgress = async (attemptId, elapsedSinceLastSave) => {
    const attempt = challengeAttempts.find(a => a.id === attemptId);
    if (!attempt || attempt.status !== 'in_progress') return;

    const updated = challengeAttempts.map(a =>
      a.id === attemptId
        ? {
            ...a,
            timeSpent: a.timeSpent + elapsedSinceLastSave,
            lastActiveAt: new Date().toISOString()
          }
        : a
    );
    setChallengeAttempts(updated);
    await guestSafeSet('challengeAttempts', JSON.stringify(updated));
  };

  // Admin: manually create challenge
  const adminCreateChallenge = async (word) => {
    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd();

    // Cancel any existing active challenge
    const updatedChallenges = challenges.map(c =>
      c.status === 'active' ? { ...c, status: 'cancelled' } : c
    );

    const newChallenge = {
      id: Date.now(),
      word: word.toUpperCase(),
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      status: 'active',
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      winnerId: null,
      winnerData: null
    };

    const updated = [...updatedChallenges, newChallenge];
    setChallenges(updated);
    await storage.set('challenges', JSON.stringify(updated));

    await addNotification({
      type: 'challenge_started',
      message: 'New Survivor Wordle Challenge is live! Guess the word before Sunday.',
      targetPlayerId: null
    });

    return newChallenge;
  };

  // Admin: end challenge early
  const adminEndChallenge = async (challengeId) => {
    await finalizeChallenge(challengeId);
  };


  // Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 flex items-center justify-center p-3 sm:p-4 overflow-x-hidden w-full max-w-full">
        <div className="bg-black/60 backdrop-blur-sm p-5 sm:p-8 rounded-lg shadow-2xl max-w-md w-full border-2 border-amber-600 mx-auto">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Flame className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500 mr-2 sm:mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-400">Survivor Fantasy</h1>
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
              <label className="flex items-center gap-2 text-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={loginForm.rememberMe}
                  onChange={(e) => setLoginForm({...loginForm, rememberMe: e.target.checked})}
                  className="w-4 h-4 rounded border-amber-600 text-amber-600 focus:ring-amber-500"
                />
                Remember me
              </label>
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
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-amber-600/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black/50 text-amber-400/60">or</span>
                </div>
              </div>
              <button
                onClick={handleGuestLogin}
                type="button"
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded font-semibold hover:from-gray-500 hover:to-gray-600 transition border border-gray-500"
              >
                Demo / Guest
              </button>
              <p className="text-amber-400/60 text-xs text-center mt-4">
                First time? Default password: password123
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-amber-300 text-center mb-4">Password Recovery</h2>

              {recoveryStep === 'name' && (
                <>
                  <div>
                    <label className="block text-amber-200 mb-2">Enter Your Name</label>
                    <input
                      type="text"
                      value={recoveryForm.name}
                      onChange={(e) => setRecoveryForm({...recoveryForm, name: e.target.value})}
                      onKeyPress={(e) => e.key === 'Enter' && handleFindPlayer()}
                      className="w-full px-4 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                      placeholder="Your player name"
                    />
                  </div>
                  <button
                    onClick={handleFindPlayer}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded font-semibold hover:from-amber-500 hover:to-orange-500 transition"
                  >
                    Find My Account
                  </button>
                </>
              )}

              {recoveryStep === 'answer' && recoveryPlayer && (
                <>
                  <p className="text-amber-200 text-sm">Hi {recoveryPlayer.name}! Answer your security question:</p>
                  <div className="bg-amber-900/30 border border-amber-600 p-3 rounded">
                    <p className="text-amber-300 font-semibold">{recoveryPlayer.securityQuestion}</p>
                  </div>
                  <div>
                    <label className="block text-amber-200 mb-2">Your Answer</label>
                    <input
                      type="text"
                      value={recoveryForm.securityAnswer}
                      onChange={(e) => setRecoveryForm({...recoveryForm, securityAnswer: e.target.value})}
                      onKeyPress={(e) => e.key === 'Enter' && handleVerifySecurityAnswer()}
                      className="w-full px-4 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                      placeholder="Enter your answer"
                    />
                  </div>
                  <button
                    onClick={handleVerifySecurityAnswer}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded font-semibold hover:from-amber-500 hover:to-orange-500 transition"
                  >
                    Verify Answer
                  </button>
                </>
              )}

              {recoveryStep === 'reset' && recoveryPlayer && (
                <>
                  <p className="text-green-400 text-sm text-center">Verified! Create your new password:</p>
                  <div>
                    <label className="block text-amber-200 mb-2">New Password</label>
                    <input
                      type="password"
                      value={recoveryForm.newPassword}
                      onChange={(e) => setRecoveryForm({...recoveryForm, newPassword: e.target.value})}
                      className="w-full px-4 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                      placeholder="New password"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-200 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={recoveryForm.confirmPassword}
                      onChange={(e) => setRecoveryForm({...recoveryForm, confirmPassword: e.target.value})}
                      onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
                      className="w-full px-4 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                      placeholder="Confirm password"
                    />
                  </div>
                  <button
                    onClick={handleResetPassword}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded font-semibold hover:from-green-500 hover:to-emerald-500 transition"
                  >
                    Reset Password
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  setLoginView('login');
                  setRecoveryStep('name');
                  setRecoveryPlayer(null);
                  setRecoveryForm({ name: '', securityAnswer: '', newPassword: '', confirmPassword: '' });
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
  const myAdvantages = playerAdvantages.filter(a => a.playerId === currentUser.id && !a.used);
  const myUsedAdvantages = playerAdvantages.filter(a => a.playerId === currentUser.id && a.used);
  const unreadNotifications = notifications.filter(n => {
    const isForMe = n.targetPlayerId === currentUser.id || !n.targetPlayerId;
    const readBy = n.readBy || [];
    const isRead = readBy.includes(currentUser.id) || n.read; // Support legacy 'read' field
    return !isRead && isForMe;
  });
  const activeQuestionnaire = questionnaires.find(q => q.status === 'active');
  const mySubmission = activeQuestionnaire ? submissions.find(s => s.questionnaireId === activeQuestionnaire.id && s.playerId === currentUser.id) : null;
  const completedQuestionnaires = submissions.filter(s => s.playerId === currentUser.id).length;
  const myQotwWins = questionnaires.filter(q => {
    if (!q.qotwWinner) return false;
    const winners = Array.isArray(q.qotwWinner) ? q.qotwWinner : [q.qotwWinner];
    return winners.includes(currentUser.id);
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 overflow-x-hidden w-full max-w-full">
      {/* Header */}
      <header className="bg-black/60 backdrop-blur-sm border-b-2 border-amber-600 relative z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Mobile: Two rows, Desktop: Single row */}
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 flex-shrink-0" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-amber-400">Survivor Fantasy</h1>
                <p className="text-amber-200 text-xs sm:text-sm">Season 48</p>
              </div>
            </div>

            {/* Right side: User info and actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* User info - compact on mobile, fuller on desktop */}
              <div className="text-right hidden min-[400px]:block">
                <p className="text-amber-200 text-xs sm:text-sm hidden sm:block">Welcome back,</p>
                <p className="text-white font-semibold text-sm sm:text-base truncate max-w-[80px] sm:max-w-none">{currentUser.name}</p>
                <p className="text-amber-400 text-xs sm:text-sm font-semibold">{myTotalPoints} pts</p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition relative"
                  >
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
                    {unreadNotifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                        {unreadNotifications.length}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 top-10 sm:top-12 w-72 sm:w-80 bg-black/95 border-2 border-amber-600 rounded-lg shadow-xl z-50 max-h-80 sm:max-h-96 overflow-y-auto">
                      <div className="p-2 sm:p-3 border-b border-amber-600 flex items-center justify-between">
                        <h3 className="text-amber-400 font-semibold text-sm sm:text-base">Notifications</h3>
                        <div className="flex gap-2">
                          {unreadNotifications.length > 0 && (
                            <button
                              onClick={markAllNotificationsRead}
                              className="text-xs text-amber-300 hover:text-amber-200"
                            >
                              Mark read
                            </button>
                          )}
                          {notifications.filter(n => n.targetPlayerId === currentUser.id || !n.targetPlayerId).length > 0 && (
                            <button
                              onClick={async () => {
                                if (window.confirm('Clear all your notifications?')) {
                                  // Clear notifications for this user (remove broadcasts and targeted ones)
                                  const updated = notifications.filter(n =>
                                    n.targetPlayerId !== null && n.targetPlayerId !== currentUser.id
                                  );
                                  setNotifications(updated);
                                  await storage.set('notifications', JSON.stringify(updated));
                                  setShowNotifications(false);
                                }
                              }}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Clear all
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="divide-y divide-amber-600/30">
                        {notifications
                          .filter(n => n.targetPlayerId === currentUser.id || !n.targetPlayerId)
                          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                          .slice(0, 10)
                          .map(notif => (
                            <div
                              key={notif.id}
                              onClick={() => markNotificationRead(notif.id)}
                              className={`p-2 sm:p-3 cursor-pointer transition ${
                                notif.read ? 'bg-transparent opacity-60' : 'bg-amber-900/30'
                              } hover:bg-amber-900/50`}
                            >
                              <p className="text-white text-xs sm:text-sm">{notif.message}</p>
                              <p className="text-amber-400 text-xs mt-1">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        {notifications.filter(n => n.targetPlayerId === currentUser.id || !n.targetPlayerId).length === 0 && (
                          <div className="p-3 sm:p-4 text-center text-amber-300 text-xs sm:text-sm">
                            No notifications yet
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {currentUser.isAdmin && (
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" title="Admin (Jeff)" />
                )}
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition"
                  title="Settings"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile-only: User name and points shown below header on very small screens */}
          <div className="min-[400px]:hidden flex items-center justify-between mt-2 pt-2 border-t border-amber-600/30">
            <p className="text-white font-semibold text-sm">{currentUser.name}</p>
            <p className="text-amber-400 text-sm font-semibold">{myTotalPoints} points</p>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-amber-600 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Account Settings
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition"
                >
                  <X className="w-5 h-5 text-amber-300" />
                </button>
              </div>

              {/* Security Question Setup */}
              <div className="mb-6 p-4 bg-purple-900/30 border border-purple-600 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Security Question
                  {hasSecurityQuestion && <span className="text-green-400 text-sm">(Set)</span>}
                </h3>
                {!hasSecurityQuestion && (
                  <p className="text-purple-200 text-sm mb-3">
                    Set up a security question to recover your password if you forget it.
                  </p>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">Select a Question</label>
                    <select
                      value={securitySetup.question}
                      onChange={(e) => setSecuritySetup({...securitySetup, question: e.target.value})}
                      className="w-full px-3 py-2 rounded bg-black/50 text-white border border-purple-600 focus:outline-none focus:border-purple-400"
                    >
                      <option value="">Choose a security question...</option>
                      {SECURITY_QUESTIONS.map((q, idx) => (
                        <option key={idx} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">Your Answer</label>
                    <input
                      type="text"
                      value={securitySetup.answer}
                      onChange={(e) => setSecuritySetup({...securitySetup, answer: e.target.value})}
                      placeholder="Enter your answer"
                      className="w-full px-3 py-2 rounded bg-black/50 text-white border border-purple-600 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!securitySetup.question || !securitySetup.answer) {
                        alert('Please select a question and enter an answer');
                        return;
                      }
                      await setupSecurityQuestion(securitySetup.question, securitySetup.answer);
                      setHasSecurityQuestion(true);
                      setSecuritySetup({ question: '', answer: '' });
                      alert('Security question saved!');
                    }}
                    className="w-full py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-500 transition"
                  >
                    {hasSecurityQuestion ? 'Update Security Question' : 'Save Security Question'}
                  </button>
                </div>
              </div>

              {/* Change Password */}
              <div className="p-4 bg-amber-900/30 border border-amber-600 rounded-lg">
                <h3 className="text-lg font-semibold text-amber-300 mb-3">Change Password</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-amber-200 text-sm mb-1">Current Password</label>
                    <input
                      type="password"
                      value={passwordChange.current}
                      onChange={(e) => setPasswordChange({...passwordChange, current: e.target.value})}
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-200 text-sm mb-1">New Password</label>
                    <input
                      type="password"
                      value={passwordChange.new}
                      onChange={(e) => setPasswordChange({...passwordChange, new: e.target.value})}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-200 text-sm mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordChange.confirm}
                      onChange={(e) => setPasswordChange({...passwordChange, confirm: e.target.value})}
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!passwordChange.current || !passwordChange.new || !passwordChange.confirm) {
                        alert('Please fill in all fields');
                        return;
                      }
                      if (passwordChange.new !== passwordChange.confirm) {
                        alert('New passwords do not match');
                        return;
                      }
                      if (passwordChange.new.length < 4) {
                        alert('Password must be at least 4 characters');
                        return;
                      }
                      const success = await changePassword(passwordChange.current, passwordChange.new);
                      if (success) {
                        alert('Password changed successfully!');
                        setPasswordChange({ current: '', new: '', confirm: '' });
                      } else {
                        alert('Current password is incorrect');
                      }
                    }}
                    className="w-full py-2 bg-amber-600 text-white rounded font-semibold hover:bg-amber-500 transition"
                  >
                    Change Password
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-4 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-500 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-black/40 backdrop-blur-sm border-b border-amber-600/50">
        <div className="container mx-auto px-1 sm:px-4">
          <div className="flex justify-center gap-0 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Home - icon only */}
            <button
              onClick={() => { setCurrentView('home'); setShowNotifications(false); }}
              className={`px-2 sm:px-3 py-2.5 sm:py-3 transition flex items-center ${
                currentView === 'home' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-amber-200 hover:text-amber-300'
              }`}
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {/* Other tabs with labels */}
            {[
              { id: 'picks', label: 'PICKS', icon: Target, activeClass: 'text-orange-400 border-b-2 border-orange-400', inactiveClass: 'text-orange-300 hover:text-orange-200' },
              { id: 'questionnaire', label: 'QUESTIONNAIRE', icon: FileText, activeClass: 'text-amber-400 border-b-2 border-amber-400', inactiveClass: 'text-amber-200 hover:text-amber-300' },
              { id: 'challenge', label: 'WORDLE', icon: Zap, activeClass: 'text-amber-400 border-b-2 border-amber-400', inactiveClass: 'text-amber-200 hover:text-amber-300' },
              { id: 'leaderboard', label: 'BOARD', icon: Trophy, activeClass: 'text-amber-400 border-b-2 border-amber-400', inactiveClass: 'text-amber-200 hover:text-amber-300' },
              { id: 'advantages', label: "ADV'S", icon: Gift, activeClass: 'text-amber-400 border-b-2 border-amber-400', inactiveClass: 'text-amber-200 hover:text-amber-300' }
            ].map(({ id, label, icon: Icon, activeClass, inactiveClass }) => (
              <button
                key={id}
                onClick={() => { setCurrentView(id); setShowNotifications(false); }}
                className={`px-2 sm:px-3 py-2.5 sm:py-3 transition whitespace-nowrap flex items-center gap-1 sm:gap-1.5 ${
                  currentView === id ? activeClass : inactiveClass
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="picks-text text-xs sm:text-sm font-bold">{label}</span>
              </button>
            ))}
            {currentUser.isAdmin && (
              <button
                onClick={() => { setCurrentView('admin'); setShowNotifications(false); }}
                className={`px-2 sm:px-3 py-2.5 sm:py-3 transition whitespace-nowrap flex items-center gap-1 sm:gap-1.5 ${
                  currentView === 'admin'
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-yellow-300 hover:text-yellow-200'
                }`}
              >
                <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="picks-text text-xs sm:text-sm font-bold">JEFF</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
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
                  {picksLocked.instinct ? (
                    // Picks are LOCKED
                    myInstinctPick ? (
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
                              🔒 Locked in and ready for the season!
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-900/40 p-6 rounded-lg border border-gray-600 text-center">
                        <p className="text-gray-400">Instinct picks are now locked. You did not submit a pick.</p>
                      </div>
                    )
                  ) : (
                    // Picks are UNLOCKED - can change
                    <>
                      {myInstinctPick && (
                        <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 p-4 rounded-lg border-2 border-amber-600 mb-4">
                          <p className="text-amber-300 font-semibold mb-2">Your Current Pick:</p>
                          <div className="flex items-center gap-4">
                            <img
                              src={contestants.find(c => c.id === myInstinctPick.contestantId)?.image}
                              alt=""
                              className="w-16 h-16 rounded-lg object-cover border-2 border-amber-500"
                            />
                            <div>
                              <p className="text-white font-bold text-lg">
                                {contestants.find(c => c.id === myInstinctPick.contestantId)?.name}
                              </p>
                              <p className="text-amber-200 text-sm">
                                You can change your pick until Jeff locks it
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
                        <p className="text-yellow-200 text-sm">
                          ⏰ Pick must be submitted before Episode 1. You can change your pick until Jeff locks it.
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {contestants.map(contestant => (
                          <div
                            key={contestant.id}
                            onClick={() => {
                              const action = myInstinctPick ? 'change your pick to' : 'select';
                              if (window.confirm(`${action === 'change your pick to' ? 'Change' : 'Select'} ${contestant.name} as your Instinct Pick?`)) {
                                submitInstinctPick(contestant.id);
                              }
                            }}
                            className={`bg-gradient-to-br from-amber-900/40 to-orange-900/40 p-4 rounded-lg border-2 ${myInstinctPick?.contestantId === contestant.id ? 'border-green-500 ring-2 ring-green-500' : 'border-amber-600 hover:border-amber-400'} cursor-pointer transition transform hover:scale-105`}
                          >
                            <img
                              src={contestant.image}
                              alt={contestant.name}
                              className="w-full h-40 object-cover rounded-lg mb-3"
                            />
                            <h3 className="text-white font-bold text-lg">{contestant.name}</h3>
                            <p className="text-amber-300 text-sm mb-2">{contestant.tribe} Tribe</p>
                            <button className={`w-full py-2 ${myInstinctPick?.contestantId === contestant.id ? 'bg-green-600' : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500'} text-white rounded font-semibold transition`}>
                              {myInstinctPick?.contestantId === contestant.id ? '✓ Current Pick' : (myInstinctPick ? 'Change to This Pick' : 'Select as Instinct Pick')}
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

                  {picksLocked.final ? (
                    // Final picks are LOCKED
                    myFinalPick ? (
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
                              🔒 Locked in for the rest of the season!
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-900/40 p-6 rounded-lg border border-gray-600 text-center">
                        <p className="text-gray-400">Final picks are now locked. You did not submit a pick.</p>
                      </div>
                    )
                  ) : (
                    // Final picks are UNLOCKED - can change
                    <>
                      {myFinalPick && (
                        <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-4 rounded-lg border-2 border-purple-600 mb-4">
                          <p className="text-purple-300 font-semibold mb-2">Your Current Pick:</p>
                          <div className="flex items-center gap-4">
                            <img
                              src={contestants.find(c => c.id === myFinalPick.contestantId)?.image}
                              alt=""
                              className="w-16 h-16 rounded-lg object-cover border-2 border-purple-500"
                            />
                            <div>
                              <p className="text-white font-bold text-lg">
                                {contestants.find(c => c.id === myFinalPick.contestantId)?.name}
                              </p>
                              <p className="text-purple-200 text-sm">
                                You can change your pick until Jeff locks it
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mb-4 p-3 bg-purple-900/30 border border-purple-600 rounded-lg">
                        <p className="text-purple-200 text-sm">
                          ⏰ Choose from the remaining contestants. You can change your pick until Jeff locks it.
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {contestants.filter(c => !c.eliminated).map(contestant => (
                          <div
                            key={contestant.id}
                            onClick={() => {
                              const action = myFinalPick ? 'change your pick to' : 'select';
                              if (window.confirm(`${action === 'change your pick to' ? 'Change' : 'Select'} ${contestant.name} as your Final Pick?`)) {
                                submitFinalPick(contestant.id);
                              }
                            }}
                            className={`bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-4 rounded-lg border-2 ${myFinalPick?.contestantId === contestant.id ? 'border-green-500 ring-2 ring-green-500' : 'border-purple-600 hover:border-purple-400'} cursor-pointer transition transform hover:scale-105`}
                          >
                            <img
                              src={contestant.image}
                              alt={contestant.name}
                              className="w-full h-40 object-cover rounded-lg mb-3"
                            />
                            <h3 className="text-white font-bold text-lg">{contestant.name}</h3>
                            <p className="text-purple-300 text-sm mb-2">{contestant.tribe} Tribe</p>
                            <button className={`w-full py-2 ${myFinalPick?.contestantId === contestant.id ? 'bg-green-600' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'} text-white rounded font-semibold transition`}>
                              {myFinalPick?.contestantId === contestant.id ? '✓ Current Pick' : (myFinalPick ? 'Change to This Pick' : 'Select as Final Pick')}
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
              {(() => {
                // Calculate rankings with ties
                const sortedPlayers = [...players]
                  .map(p => ({ ...p, points: calculateTotalPoints(p.id) }))
                  .sort((a, b) => b.points - a.points);

                // Build ranking with ties: T-1, T-1, 3 (not T-1, T-1, T-2)
                const rankings = [];
                let currentRank = 1;
                sortedPlayers.forEach((player, index) => {
                  if (index === 0) {
                    rankings.push({ rank: 1, isTied: false });
                  } else {
                    const prevPlayer = sortedPlayers[index - 1];
                    if (player.points === prevPlayer.points) {
                      // Same points as previous - tie
                      rankings[index - 1].isTied = true;
                      rankings.push({ rank: rankings[index - 1].rank, isTied: true });
                    } else {
                      // Different points - new rank (skips tied positions)
                      rankings.push({ rank: index + 1, isTied: false });
                    }
                  }
                });

                return sortedPlayers.map((player, index) => {
                  const points = player.points;
                  const { rank, isTied } = rankings[index];
                  const rankDisplay = isTied ? `T-${rank}` : rank;
                  const isCurrentUser = player.id === currentUser.id;
                  const isExpanded = expandedPlayer === player.id;
                  const breakdown = getPointBreakdown(player.id);

                  return (
                    <div key={player.id}>
                      <div
                        onClick={() => setExpandedPlayer(isExpanded ? null : player.id)}
                        className={`bg-gradient-to-r from-amber-900/40 to-orange-900/40 p-4 rounded-lg border-2 transition cursor-pointer hover:bg-amber-900/50 ${
                          isCurrentUser
                            ? 'border-yellow-400 shadow-lg shadow-yellow-400/30'
                            : 'border-amber-600'
                        } ${isExpanded ? 'rounded-b-none' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Rank Badge */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${isTied ? 'text-sm' : 'text-lg'} ${
                              rank === 1 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50' :
                              rank === 2 ? 'bg-gray-400 text-black shadow-lg shadow-gray-400/50' :
                              rank === 3 ? 'bg-amber-700 text-white shadow-lg shadow-amber-700/50' :
                              'bg-amber-600/50 text-white'
                            }`}>
                              {rankDisplay}
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

                          {/* Points Display & Expand Button */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-3xl font-bold text-amber-400">
                                {points}
                              </div>
                              <div className="text-xs text-amber-300">
                                total points
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-amber-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-amber-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Breakdown */}
                      {isExpanded && (
                        <div className={`bg-black/80 border-2 border-t-0 rounded-b-lg p-4 ${
                          isCurrentUser ? 'border-yellow-400' : 'border-amber-600'
                        }`}>
                          <h4 className="text-amber-300 font-semibold mb-3">Point History</h4>
                          {breakdown.length === 0 ? (
                            <p className="text-gray-400 text-sm">No point history yet</p>
                          ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {breakdown.map((entry, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-amber-900/30">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${
                                      entry.type === 'questionnaire' ? 'bg-green-400' :
                                      entry.type === 'qotw' ? 'bg-purple-400' :
                                      entry.type === 'episode' ? 'bg-blue-400' :
                                      entry.type === 'advantage' ? 'bg-red-400' :
                                      'bg-amber-400'
                                    }`}></span>
                                    <span className="text-white">{entry.description}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={`font-bold ${entry.points >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {entry.points >= 0 ? '+' : ''}{entry.points}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                      {new Date(entry.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
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
                  {(() => {
                    const myPoints = calculateTotalPoints(currentUser.id);
                    // Rank = 1 + number of players with MORE points than me
                    const playersAbove = players.filter(p => calculateTotalPoints(p.id) > myPoints).length;
                    const rank = playersAbove + 1;
                    const isTied = players.filter(p => calculateTotalPoints(p.id) === myPoints).length > 1;
                    return isTied ? `T-${rank}` : `#${rank}`;
                  })()}
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
            guestSafeSet={guestSafeSet}
            isGuestMode={isGuestMode}
            playerAdvantages={playerAdvantages}
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
            notifications={notifications}
            deleteNotification={deleteNotification}
            clearAllNotifications={clearAllNotifications}
            storage={storage}
            currentSeason={currentSeason}
            updateContestant={updateContestant}
            addContestant={addContestant}
            removeContestant={removeContestant}
            updateTribeName={updateTribeName}
            startNewSeason={startNewSeason}
            archiveCurrentSeason={archiveCurrentSeason}
            seasonHistory={seasonHistory}
            challenges={challenges}
            setChallenges={setChallenges}
            challengeAttempts={challengeAttempts}
            adminCreateChallenge={adminCreateChallenge}
            adminEndChallenge={adminEndChallenge}
            isGuestMode={isGuestMode()}
            picksLocked={picksLocked}
            setPicksLocked={setPicksLocked}
            togglePicksLock={togglePicksLock}
            playerAdvantages={playerAdvantages}
            setPlayerAdvantages={setPlayerAdvantages}
            updatePlayerScore={updatePlayerScore}
            loadingBackup={loadingBackup}
            setLoadingBackup={setLoadingBackup}
            snapshots={snapshots}
            setSnapshots={setSnapshots}
          />
        )}

        {/* Home View - Cast Display */}
        {currentView === 'home' && (
          <div className="space-y-6">
            {/* Banner Notifications */}
            <NotificationBanners
              notifications={notifications}
              currentUser={currentUser}
              markNotificationSeen={markNotificationSeen}
              onVisibleNotifications={setVisibleBannerIds}
            />

            {/* Combined Welcome Section */}
            <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-600">
              <h2 className="text-2xl font-bold text-amber-400 mb-2 flex items-center gap-2">
                <Flame className="w-6 h-6" />
                Welcome to Survivor Fantasy Season 48!
              </h2>
              <p className="text-amber-200 mb-4">
                Hey {currentUser.name}! Compete with your friends by making picks, answering weekly questionnaires, and earning points throughout the season!
              </p>
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="bg-gradient-to-br from-amber-600 to-orange-600 p-6 rounded-xl">
                  <p className="text-white text-sm opacity-80">Your Total Points</p>
                  <p className="text-5xl font-bold text-white">{myTotalPoints}</p>
                </div>
                <div>
                  <p className="text-amber-300">Current Rank</p>
                  <p className="text-3xl font-bold text-white">
                    #{[...players].sort((a, b) => calculateTotalPoints(b.id) - calculateTotalPoints(a.id)).findIndex(p => p.id === currentUser.id) + 1}
                    <span className="text-lg text-amber-400 ml-2">of {players.length}</span>
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-amber-900/30 p-4 rounded-lg border border-amber-600">
                  <p className="text-3xl font-bold text-amber-400">{players.length}</p>
                  <p className="text-amber-200 text-sm">Players Competing</p>
                </div>
                <div className="bg-amber-900/30 p-4 rounded-lg border border-amber-600">
                  <p className="text-3xl font-bold text-amber-400">{contestants.length}</p>
                  <p className="text-amber-200 text-sm">Survivors</p>
                </div>
                <div className="bg-amber-900/30 p-4 rounded-lg border border-amber-600">
                  <p className="text-3xl font-bold text-amber-400">{getActiveContestants().length}</p>
                  <p className="text-amber-200 text-sm">Still in the Game</p>
                </div>
              </div>
            </div>

            {/* Picks Status */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-600">
                <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Your Picks
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-amber-900/30 rounded-lg">
                    <div>
                      <p className="text-amber-300 text-sm">Instinct Pick</p>
                      <p className="text-white font-semibold">
                        {myInstinctPick
                          ? contestants.find(c => c.id === myInstinctPick.contestantId)?.name
                          : 'Not submitted'}
                      </p>
                    </div>
                    {myInstinctPick ? (
                      <Check className="w-6 h-6 text-green-400" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-yellow-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-900/30 rounded-lg">
                    <div>
                      <p className="text-purple-300 text-sm">Final Pick</p>
                      <p className="text-white font-semibold">
                        {myFinalPick
                          ? contestants.find(c => c.id === myFinalPick.contestantId)?.name
                          : gamePhase === 'final-picks' || gamePhase === 'mid-season' || gamePhase === 'finale'
                            ? 'Not submitted'
                            : 'Available after merge'}
                      </p>
                    </div>
                    {myFinalPick ? (
                      <Check className="w-6 h-6 text-green-400" />
                    ) : (
                      <Clock className="w-6 h-6 text-purple-400" />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-600">
                <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Questionnaires
                </h3>
                <div className="space-y-4">
                  {activeQuestionnaire ? (
                    <div className={`p-3 rounded-lg ${mySubmission ? 'bg-green-900/30' : 'bg-yellow-900/30'}`}>
                      <p className={mySubmission ? 'text-green-300 text-sm' : 'text-yellow-300 text-sm'}>
                        {mySubmission ? 'Submitted' : 'Current Questionnaire'}
                      </p>
                      <p className="text-white font-semibold">{activeQuestionnaire.title}</p>
                      {!mySubmission && (
                        <button
                          onClick={() => setCurrentView('questionnaire')}
                          className="mt-2 px-4 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-500 transition"
                        >
                          Answer Now
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-900/30 rounded-lg">
                      <p className="text-gray-400">No active questionnaire</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-amber-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-amber-400">{completedQuestionnaires}</p>
                      <p className="text-amber-300 text-xs">Completed</p>
                    </div>
                    <div className="p-3 bg-purple-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-400">{myQotwWins}</p>
                      <p className="text-purple-300 text-xs">QOTW Wins</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How to Play Section */}
            <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-600">
              <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                How to Play
              </h3>
              <div className="space-y-4 text-amber-200">
                <p>
                  Navigate through the app using the tabs above to manage your fantasy game experience:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-600/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold text-amber-300">Picks</h4>
                    </div>
                    <p className="text-sm">Select your Instinct Pick before the season starts and your Final Pick after the merge. Earn points based on how your picks perform!</p>
                  </div>
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-600/50">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold text-amber-300">Questionnaire</h4>
                    </div>
                    <p className="text-sm">Answer weekly prediction questions about the upcoming episode. Get points for correct answers and compete in Question of the Week!</p>
                  </div>
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-600/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold text-amber-300">Leaderboard</h4>
                    </div>
                    <p className="text-sm">See how you stack up against the competition! View everyone's total points, rankings, and detailed score breakdowns.</p>
                  </div>
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-600/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold text-amber-300">Advantages</h4>
                    </div>
                    <p className="text-sm">View and activate special advantages you've earned. These powerful bonuses can steal points, double your score, or protect you from penalties!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cast Accordion */}
            <div className="bg-black/60 backdrop-blur-sm rounded-lg border-2 border-amber-600 overflow-hidden">
              <button
                onClick={() => setCastAccordionOpen(!castAccordionOpen)}
                className="w-full p-6 flex items-center justify-between hover:bg-amber-900/20 transition"
              >
                <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Check Out This Season's Cast
                </h3>
                {castAccordionOpen ? (
                  <ChevronUp className="w-6 h-6 text-amber-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-amber-400" />
                )}
              </button>

              {castAccordionOpen && (
                <div className="px-6 pb-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contestants.map(contestant => {
                      const tribeColor = contestant.tribe === 'Civa' ? 'green' : contestant.tribe === 'Lagi' ? 'orange' : 'blue';
                      return (
                        <div
                          key={contestant.id}
                          className={`p-4 rounded-lg border ${
                            contestant.eliminated
                              ? 'bg-red-900/20 border-red-600 opacity-60'
                              : `bg-${tribeColor}-900/30 border-${tribeColor}-500`
                          }`}
                        >
                          <img
                            src={contestant.image}
                            alt={contestant.name}
                            className="w-full h-40 object-cover rounded-lg mb-3"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                          />
                          <h5 className="text-white font-bold">{contestant.name}</h5>
                          <p className={`text-${tribeColor}-300 text-sm mb-2`}>{contestant.tribe}</p>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {CONTESTANT_BIOS[contestant.id] || 'Bio coming soon...'}
                          </p>
                          {contestant.eliminated && (
                            <p className="text-red-400 text-sm font-semibold mt-2">Eliminated</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'advantages' && (
          <div className="space-y-6">
            {/* Advantage Play Modal */}
            {advantageModal.show && advantageModal.advantage && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-lg border-2 border-amber-600 max-w-md w-full">
                  <h3 className="text-xl font-bold text-amber-400 mb-4">Play {advantageModal.advantage.name}</h3>

                  {/* Knowledge is Power - Select target player */}
                  {advantageModal.advantage.advantageId === 'knowledge-is-power' && (
                    <div>
                      <p className="text-amber-200 mb-4">Select a player to steal their advantage from. If they have no advantage, this will be wasted!</p>
                      <div className="space-y-2 mb-4">
                        {players.filter(p => p.id !== currentUser.id).map(player => (
                          <button
                            key={player.id}
                            onClick={() => setAdvantageTarget(player.id)}
                            className={`w-full p-3 rounded-lg border-2 transition ${
                              advantageTarget === player.id
                                ? 'border-amber-500 bg-amber-900/40 text-white'
                                : 'border-gray-600 bg-gray-800/40 text-gray-300 hover:border-amber-600'
                            }`}
                          >
                            {player.name}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setAdvantageModal({ show: false, advantage: null, step: 'confirm' }); setAdvantageTarget(null); }}
                          className="flex-1 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-500 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (advantageTarget) {
                              executeKnowledgeIsPower(advantageModal.advantage.id, advantageTarget);
                              setAdvantageModal({ show: false, advantage: null, step: 'confirm' });
                              setAdvantageTarget(null);
                            }
                          }}
                          disabled={!advantageTarget}
                          className="flex-1 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded font-semibold hover:from-amber-500 hover:to-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Steal Advantage
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Vote Steal - Select target player */}
                  {advantageModal.advantage.advantageId === 'vote-steal' && (
                    <div>
                      <p className="text-amber-200 mb-4">Select a player to steal their QOTW vote. They will be blocked from voting, and a vote will automatically be added for you!</p>
                      {!activeQuestionnaire?.qotwVotingOpen ? (
                        <div>
                          <p className="text-red-400 mb-4">QOTW voting is not currently open. Wait until voting opens to use this advantage.</p>
                          <button
                            onClick={() => { setAdvantageModal({ show: false, advantage: null, step: 'confirm' }); setAdvantageTarget(null); }}
                            className="w-full py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-500 transition"
                          >
                            Close
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2 mb-4">
                            {players.filter(p => p.id !== currentUser.id).map(player => (
                              <button
                                key={player.id}
                                onClick={() => setAdvantageTarget(player.id)}
                                className={`w-full p-3 rounded-lg border-2 transition ${
                                  advantageTarget === player.id
                                    ? 'border-amber-500 bg-amber-900/40 text-white'
                                    : 'border-gray-600 bg-gray-800/40 text-gray-300 hover:border-amber-600'
                                }`}
                              >
                                {player.name}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => { setAdvantageModal({ show: false, advantage: null, step: 'confirm' }); setAdvantageTarget(null); }}
                              className="flex-1 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-500 transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                if (advantageTarget && activeQuestionnaire) {
                                  executeVoteSteal(advantageModal.advantage.id, advantageTarget, activeQuestionnaire.id);
                                  setAdvantageModal({ show: false, advantage: null, step: 'confirm' });
                                  setAdvantageTarget(null);
                                }
                              }}
                              disabled={!advantageTarget}
                              className="flex-1 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded font-semibold hover:from-red-500 hover:to-pink-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Steal Vote
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Extra Vote - Activate for QOTW voting */}
                  {advantageModal.advantage.advantageId === 'extra-vote' && (
                    <div>
                      <p className="text-amber-200 mb-4">Activate Extra Vote to cast an additional vote in Question of the Week voting.</p>
                      {!activeQuestionnaire?.qotwVotingOpen ? (
                        <div>
                          <p className="text-red-400 mb-4">QOTW voting is not currently open. Wait until voting opens to use this advantage.</p>
                          <button
                            onClick={() => { setAdvantageModal({ show: false, advantage: null, step: 'confirm' }); }}
                            className="w-full py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-500 transition"
                          >
                            Close
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => { setAdvantageModal({ show: false, advantage: null, step: 'confirm' }); }}
                            className="flex-1 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-500 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              await activateExtraVote(advantageModal.advantage.id, activeQuestionnaire.id);
                              setAdvantageModal({ show: false, advantage: null, step: 'confirm' });
                            }}
                            className="flex-1 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded font-semibold hover:from-green-500 hover:to-emerald-500 transition"
                          >
                            Activate Extra Vote
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Double Trouble - Activate for current week */}
                  {advantageModal.advantage.advantageId === 'double-trouble' && (
                    <div>
                      <p className="text-amber-200 mb-4">Activate Double Trouble to double ALL your points for the current week when scores are released (questionnaire, picks, and QOTW).</p>
                      {!activeQuestionnaire ? (
                        <div>
                          <p className="text-red-400 mb-4">No active questionnaire. Wait for a new questionnaire to use this advantage.</p>
                          <button
                            onClick={() => { setAdvantageModal({ show: false, advantage: null, step: 'confirm' }); }}
                            className="w-full py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-500 transition"
                          >
                            Close
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => { setAdvantageModal({ show: false, advantage: null, step: 'confirm' }); }}
                            className="flex-1 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-500 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              await activateWeeklyAdvantage(advantageModal.advantage.id, activeQuestionnaire.id);
                              setAdvantageModal({ show: false, advantage: null, step: 'confirm' });
                            }}
                            className="flex-1 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded font-semibold hover:from-yellow-500 hover:to-amber-500 transition"
                          >
                            Activate Double Trouble
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Immunity Idol - Activate for current week */}
                  {advantageModal.advantage.advantageId === 'immunity-idol' && (
                    <div>
                      <p className="text-amber-200 mb-4">Activate Immunity Idol to negate all negative points for the current week when scores are released.</p>
                      {!activeQuestionnaire ? (
                        <div>
                          <p className="text-red-400 mb-4">No active questionnaire. Wait for a new questionnaire to use this advantage.</p>
                          <button
                            onClick={() => { setAdvantageModal({ show: false, advantage: null, step: 'confirm' }); }}
                            className="w-full py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-500 transition"
                          >
                            Close
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => { setAdvantageModal({ show: false, advantage: null, step: 'confirm' }); }}
                            className="flex-1 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-500 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              await activateWeeklyAdvantage(advantageModal.advantage.id, activeQuestionnaire.id);
                              setAdvantageModal({ show: false, advantage: null, step: 'confirm' });
                            }}
                            className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded font-semibold hover:from-blue-500 hover:to-cyan-500 transition"
                          >
                            Activate Immunity Idol
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Your Advantages */}
            <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-600">
              <h2 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                <Gift className="w-6 h-6" />
                Your Advantages
              </h2>

              {myAdvantages.length === 0 && myUsedAdvantages.length === 0 ? (
                <p className="text-amber-200 text-center py-8">
                  You haven't purchased any advantages yet. Browse the shop below!
                </p>
              ) : (
                <div className="space-y-4">
                  {myAdvantages.length > 0 && (
                    <div>
                      <h3 className="text-lg text-green-400 font-semibold mb-3">Active Advantages (Ready to Play)</h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myAdvantages.map(adv => (
                          <div key={adv.id} className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 p-4 rounded-lg border-2 border-green-600">
                            <h4 className="text-white font-bold text-lg">{adv.name}</h4>
                            <p className="text-green-300 text-sm mb-3">{adv.description}</p>
                            <p className="text-green-400 text-xs mb-3">
                              Purchased: {new Date(adv.purchasedAt).toLocaleDateString()}
                            </p>
                            <button
                              onClick={() => setAdvantageModal({ show: true, advantage: adv, step: 'confirm' })}
                              className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded font-semibold hover:from-green-500 hover:to-emerald-500 transition flex items-center justify-center gap-2"
                            >
                              <Zap className="w-4 h-4" />
                              Play Advantage
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {myUsedAdvantages.length > 0 && (
                    <div>
                      <h3 className="text-lg text-gray-400 font-semibold mb-3">Used Advantages</h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myUsedAdvantages.map(adv => (
                          <div key={adv.id} className="bg-gray-900/40 p-4 rounded-lg border border-gray-600 opacity-60">
                            <h4 className="text-gray-300 font-bold">{adv.name}</h4>
                            <p className="text-gray-500 text-sm">{adv.description}</p>
                            <p className="text-gray-500 text-xs mt-2">
                              Used: {new Date(adv.usedAt).toLocaleDateString()}
                              {adv.wasted && <span className="text-red-400 ml-2">(Wasted)</span>}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Advantage Shop */}
            <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-purple-600">
              <h2 className="text-2xl font-bold text-purple-400 mb-2 flex items-center gap-2">
                <Star className="w-6 h-6" />
                Advantage Shop
              </h2>
              <p className="text-purple-200 mb-2">
                Spend your hard-earned points on powerful advantages! Your current balance: <span className="font-bold text-amber-400">{myTotalPoints} points</span>
              </p>
              <p className="text-purple-300 text-sm mb-6 italic">
                ⚠️ Scarcity Rule: Only ONE of each advantage can exist in the game at a time. Once played, it returns to the shop!
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DEFAULT_ADVANTAGES.map(adv => {
                  const canAfford = myTotalPoints >= adv.cost;
                  const alreadyOwned = playerAdvantages.some(pa => pa.playerId === currentUser.id && pa.advantageId === adv.id && !pa.used);
                  const ownedByOther = !isAdvantageAvailable(adv.id) && !alreadyOwned;

                  return (
                    <div
                      key={adv.id}
                      className={`p-4 rounded-lg border-2 ${
                        alreadyOwned
                          ? 'bg-green-900/30 border-green-600'
                          : ownedByOther
                          ? 'bg-red-900/20 border-red-800'
                          : 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-bold text-lg">{adv.name}</h4>
                        <span className={`px-2 py-1 rounded text-sm font-bold ${
                          alreadyOwned ? 'bg-green-600 text-white' :
                          ownedByOther ? 'bg-red-800 text-red-200' :
                          canAfford ? 'bg-amber-600 text-white' : 'bg-gray-600 text-gray-300'
                        }`}>
                          {adv.cost} pts
                        </span>
                      </div>
                      <p className={`text-sm mb-4 ${ownedByOther ? 'text-red-200' : 'text-purple-200'}`}>{adv.description}</p>

                      {alreadyOwned ? (
                        <button
                          disabled
                          className="w-full py-2 bg-green-700 text-green-200 rounded font-semibold cursor-not-allowed"
                        >
                          ✓ You Own This
                        </button>
                      ) : ownedByOther ? (
                        <button
                          disabled
                          className="w-full py-2 bg-red-900/60 text-red-300 rounded font-semibold cursor-not-allowed"
                        >
                          Someone Has Purchased This
                        </button>
                      ) : canAfford ? (
                        <button
                          onClick={() => {
                            if (window.confirm(`Purchase ${adv.name} for ${adv.cost} points?`)) {
                              purchaseAdvantage(adv);
                            }
                          }}
                          className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-semibold hover:from-purple-500 hover:to-pink-500 transition"
                        >
                          Purchase
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2 bg-gray-600 text-gray-400 rounded font-semibold cursor-not-allowed"
                        >
                          Insufficient Points
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Wordle Challenge View */}
        {currentView === 'challenge' && (
          <div className="space-y-6">
            <WordleGame
              currentUser={currentUser}
              challenges={challenges}
              challengeAttempts={challengeAttempts}
              players={players}
              startChallengeAttempt={startChallengeAttempt}
              submitChallengeGuess={submitChallengeGuess}
              saveChallengeTimeProgress={saveChallengeTimeProgress}
              getPlayerAttempt={getPlayerAttempt}
            />
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
function AdminPanel({ currentUser, players, setPlayers, contestants, setContestants, questionnaires, setQuestionnaires, submissions, setSubmissions, pickStatus, gamePhase, setGamePhase, picks, pickScores, setPickScores, advantages, setAdvantages, episodes, setEpisodes, qotWVotes, addNotification, notifications, deleteNotification, clearAllNotifications, storage, currentSeason, updateContestant, addContestant, removeContestant, updateTribeName, startNewSeason, archiveCurrentSeason, seasonHistory, challenges, setChallenges, challengeAttempts, adminCreateChallenge, adminEndChallenge, isGuestMode, picksLocked, setPicksLocked, togglePicksLock, playerAdvantages, setPlayerAdvantages, updatePlayerScore, loadingBackup, setLoadingBackup, snapshots, setSnapshots }) {
  const [adminView, setAdminView] = useState('main');

  // Helper to check guest mode and show alert
  const requireRealUser = (actionName) => {
    if (isGuestMode) {
      alert(`Demo mode: ${actionName} is disabled. Log in as a real user to make changes.`);
      return false;
    }
    return true;
  };
  const [newQ, setNewQ] = useState({
    title: '',
    episodeNumber: episodes.length + 1,
    questions: [],
    qotw: { id: 'qotw', text: '', anonymous: false }
  });
  const [scoringQ, setScoringQ] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [episodeScoring, setEpisodeScoring] = useState({
    episodeNumber: episodes.length + 1,
    pickScoresData: {}
  });
  const [qotwManageQ, setQotwManageQ] = useState(null);
  const [editingContestant, setEditingContestant] = useState(null);
  const [newContestantForm, setNewContestantForm] = useState({ name: '', tribe: '', image: '' });
  const [editTribeForm, setEditTribeForm] = useState({ oldName: '', newName: '' });
  const [newSeasonForm, setNewSeasonForm] = useState({ seasonNumber: currentSeason + 1 });
  const [dragOverNew, setDragOverNew] = useState(false);
  const [dragOverEdit, setDragOverEdit] = useState(null);
  const [notificationForm, setNotificationForm] = useState({ selectedPlayers: [], message: '', sendToAll: false });

  // Helper function to convert image file to Base64
  const handleImageFile = (file, callback) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please drop an image file (PNG, JPG, etc.)');
      return;
    }
    // Limit to 500KB for MongoDB storage
    if (file.size > 500000) {
      alert('Image too large. Please use an image under 500KB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result); // Base64 data URL
    };
    reader.readAsDataURL(file);
  };

  const createQuestionnaire = async () => {
    if (!requireRealUser('Create Questionnaire')) return;
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
      required: false,
      options: type === 'multiple-choice' ? ['', ''] : []
    };
    setNewQ({...newQ, questions: [...newQ.questions, question]});
  };

  // Re-open a questionnaire by extending its deadline
  const reopenQuestionnaire = async (questionnaire) => {
    if (!requireRealUser('Re-open Questionnaire')) return;

    // Calculate new deadline: next Wednesday 7:59 PM EST, or 24 hours from now if sooner
    const now = new Date();
    const nextWednesday = new Date();
    nextWednesday.setDate(now.getDate() + ((3 - now.getDay() + 7) % 7 || 7)); // Next Wednesday
    nextWednesday.setHours(19, 59, 0, 0);

    // If next Wednesday is more than 7 days away, use a shorter deadline
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const newDeadline = nextWednesday < in24Hours ? in24Hours : nextWednesday;

    const newLockedAt = new Date(newDeadline);
    newLockedAt.setHours(21, 0, 0, 0);

    const updated = questionnaires.map(q =>
      q.id === questionnaire.id
        ? {
            ...q,
            deadline: newDeadline.toISOString(),
            lockedAt: newLockedAt.toISOString(),
            status: 'active'
          }
        : q
    );

    setQuestionnaires(updated);
    await storage.set('questionnaires', JSON.stringify(updated));

    await addNotification({
      type: 'questionnaire_reopened',
      message: `Questionnaire "${questionnaire.title}" has been re-opened! New deadline: ${newDeadline.toLocaleString()}`,
      targetPlayerId: null
    });

    alert(`Questionnaire re-opened!\n\nNew deadline: ${newDeadline.toLocaleString()}\nLocks at: ${newLockedAt.toLocaleString()}`);
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
    if (!requireRealUser('Release Scores')) return;

    const isRescore = scoringQ.isRescore;

    // Auto-snapshot before releasing/re-scoring
    await backup.createSnapshot(isRescore ? 'before-rescore' : 'before-release-scores');

    const newScores = calculateScores(scoringQ, correctAnswers);

    // For re-scoring, get old scores and calculate adjustments
    if (isRescore) {
      const qSubmissions = submissions.filter(s => s.questionnaireId === scoringQ.id);

      for (const sub of qSubmissions) {
        const oldScore = sub.score || 0;
        const newScore = newScores[sub.playerId] || 0;
        const adjustment = newScore - oldScore;

        if (adjustment !== 0) {
          await updatePlayerScore(
            sub.playerId,
            adjustment,
            `Score Adjustment (${scoringQ.title})`,
            'questionnaire'
          );
        }
      }

      // Update submissions with new scores
      const updatedSubmissions = submissions.map(s => {
        if (s.questionnaireId === scoringQ.id) {
          return { ...s, score: newScores[s.playerId] || 0 };
        }
        return s;
      });

      // Update questionnaire with new correct answers (keep existing qotwWinner)
      const updatedQuestionnaires = questionnaires.map(q => {
        if (q.id === scoringQ.id) {
          return { ...q, correctAnswers };
        }
        return q;
      });

      await storage.set('submissions', JSON.stringify(updatedSubmissions));
      await storage.set('questionnaires', JSON.stringify(updatedQuestionnaires));
      setSubmissions(updatedSubmissions);
      setQuestionnaires(updatedQuestionnaires);

      await addNotification({
        type: 'scores_updated',
        message: `Scores for ${scoringQ.title} have been updated (re-scored).`,
        targetPlayerId: null
      });

      alert('Scores have been re-calculated and updated!');
      setAdminView('main');
      setScoringQ(null);
      setCorrectAnswers({});
      return;
    }

    // Original first-time scoring logic
    const qotwVotesForThis = qotWVotes.filter(v => v.questionnaireId === scoringQ.id);
    const voteCounts = {};
    qotwVotesForThis.forEach(v => {
      voteCounts[v.answerId] = (voteCounts[v.answerId] || 0) + 1;
    });

    const maxVotes = Math.max(...Object.values(voteCounts), 0);
    const winners = Object.keys(voteCounts).filter(k => voteCounts[k] === maxVotes);
    const winnerPlayerIds = winners.map(answerId => parseInt(answerId.split('-')[0]));

    // Check for Double Trouble and Immunity Idol advantages
    const doubleTroubleAdvantages = playerAdvantages.filter(
      a => a.advantageId === 'double-trouble' &&
           a.used &&
           a.activated &&
           a.linkedQuestionnaireId === scoringQ.id
    );

    const immunityIdolAdvantages = playerAdvantages.filter(
      a => a.advantageId === 'immunity-idol' &&
           a.used &&
           a.activated &&
           a.linkedQuestionnaireId === scoringQ.id
    );

    const updatedSubmissions = submissions.map(s => {
      if (s.questionnaireId === scoringQ.id) {
        return { ...s, score: newScores[s.playerId] || 0 };
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

    // Apply Double Trouble effect - double the player's weekly points
    for (const dtAdv of doubleTroubleAdvantages) {
      const baseScore = newScores[dtAdv.playerId] || 0;
      const qotwBonus = winnerPlayerIds.includes(dtAdv.playerId) ? 5 : 0;
      const totalWeeklyPoints = baseScore + qotwBonus;

      // Add the doubled amount as a bonus (so they get 2x total)
      if (totalWeeklyPoints !== 0) {
        await updatePlayerScore(
          dtAdv.playerId,
          totalWeeklyPoints, // Add same amount again to double it
          `Double Trouble Bonus (${scoringQ.title})`,
          'advantage'
        );

        const playerName = players.find(p => p.id === dtAdv.playerId)?.name;
        await addNotification({
          type: 'double_trouble_applied',
          message: `${playerName} used Double Trouble and doubled their weekly points! (+${totalWeeklyPoints} bonus)`,
          targetPlayerId: null
        });
      }
    }

    // Apply Immunity Idol effect - negate negative points
    for (const iiAdv of immunityIdolAdvantages) {
      const baseScore = newScores[iiAdv.playerId] || 0;

      // If the questionnaire score is negative, add points to offset it to 0
      if (baseScore < 0) {
        await updatePlayerScore(
          iiAdv.playerId,
          Math.abs(baseScore), // Add enough to offset to 0
          `Immunity Idol Protection (${scoringQ.title})`,
          'advantage'
        );

        const playerName = players.find(p => p.id === iiAdv.playerId)?.name;
        await addNotification({
          type: 'immunity_idol_applied',
          message: `${playerName} used Immunity Idol and negated ${Math.abs(baseScore)} negative points!`,
          targetPlayerId: null
        });
      }
    }

    await addNotification({
      type: 'scores_released',
      message: `Scores for ${scoringQ.title} have been released!`,
      targetPlayerId: null
    });

    alert('Scores released to all players!');
    setAdminView('main');
  };

  const eliminateContestant = async (contestantId) => {
    if (!requireRealUser('Eliminate Contestant')) return;

    const contestant = contestants.find(c => c.id === contestantId);
    const isCurrentlyEliminated = contestant?.eliminated;

    const action = isCurrentlyEliminated ? 'un-eliminate' : 'eliminate';
    if (!window.confirm(`Are you sure you want to ${action} ${contestant?.name}?${isCurrentlyEliminated ? ' This will restore them to the active cast.' : ''}`)) return;

    // Create backup before elimination status change
    await backup.createSnapshot(`before-${action}-contestant`);

    // Determine current episode from latest questionnaire
    const currentEpisode = questionnaires.length > 0
      ? Math.max(...questionnaires.map(q => q.episodeNumber || 1))
      : 1;

    const updated = contestants.map(c =>
      c.id === contestantId ? {
        ...c,
        eliminated: !isCurrentlyEliminated,
        // Track which episode they were eliminated in (or clear if un-eliminating)
        eliminatedEpisode: !isCurrentlyEliminated ? currentEpisode : null
      } : c
    );
    setContestants(updated);
    await storage.set('contestants', JSON.stringify(updated));
    alert(`${contestant?.name} has been ${isCurrentlyEliminated ? 'restored to active cast' : 'marked as eliminated'}`);
  };

  const GAME_PHASES = ['instinct-picks', 'early-season', 'final-picks', 'mid-season', 'finale'];

  const advancePhase = async () => {
    if (!requireRealUser('Advance Phase')) return;
    const currentIndex = GAME_PHASES.indexOf(gamePhase);
    if (currentIndex < GAME_PHASES.length - 1) {
      const newPhase = GAME_PHASES[currentIndex + 1];
      setGamePhase(newPhase);
      await storage.set('gamePhase', newPhase);

      if (newPhase === 'final-picks') {
        await addNotification({
          type: 'final_picks_open',
          message: 'Final Picks are now open! Submit your pick before the deadline.',
          targetPlayerId: null
        });
      }

      alert(`Game phase advanced to: ${newPhase.replace('-', ' ')}`);
    } else {
      alert('Already at the final phase!');
    }
  };

  const regressPhase = async () => {
    if (!requireRealUser('Regress Phase')) return;
    const currentIndex = GAME_PHASES.indexOf(gamePhase);
    if (currentIndex > 0) {
      const newPhase = GAME_PHASES[currentIndex - 1];
      if (!window.confirm(`Go back to "${newPhase.replace('-', ' ')}" phase? This should only be used to fix mistakes.`)) {
        return;
      }
      setGamePhase(newPhase);
      await storage.set('gamePhase', newPhase);
      alert(`Game phase reverted to: ${newPhase.replace('-', ' ')}`);
    } else {
      alert('Already at the first phase!');
    }
  };

  const setPhaseDirectly = async (newPhase) => {
    if (!requireRealUser('Change Phase')) return;
    if (!window.confirm(`Change phase to "${newPhase.replace('-', ' ')}"?`)) {
      return;
    }
    setGamePhase(newPhase);
    await storage.set('gamePhase', newPhase);

    if (newPhase === 'final-picks') {
      await addNotification({
        type: 'final_picks_open',
        message: 'Final Picks are now open! Submit your pick before the deadline.',
        targetPlayerId: null
      });
    }

    alert(`Game phase set to: ${newPhase.replace('-', ' ')}`);
  };

  const submitEpisodeScoring = async () => {
    // Create backup before episode scoring
    await backup.createSnapshot('before-episode-scoring');

    const newScores = [];

    Object.entries(episodeScoring.pickScoresData).forEach(([pickId, scoreData]) => {
      let points = 0;
      if (scoreData.survived) points += 1;
      if (scoreData.foundIdol) points += 2;
      if (scoreData.journey) points += 1;
      if (scoreData.immunity) points += 1;
      if (scoreData.reward) points += 1;
      if (scoreData.votesReceived) points += scoreData.votesReceived;
      if (scoreData.playedIdol) points += 1;
      if (scoreData.incorrectVote) points -= 1;

      if (points !== 0 || scoreData.survived) {
        newScores.push({
          id: Date.now() + parseInt(pickId),
          pickId: parseInt(pickId),
          episode: episodeScoring.episodeNumber,
          points,
          description: `Episode ${episodeScoring.episodeNumber} Pick Performance`,
          date: new Date().toISOString(),
          breakdown: scoreData
        });
      }
    });

    const updated = [...pickScores, ...newScores];
    setPickScores(updated);
    await storage.set('pickScores', JSON.stringify(updated));

    // Record the episode
    const newEpisode = {
      number: episodeScoring.episodeNumber,
      scoredAt: new Date().toISOString()
    };
    const updatedEpisodes = [...episodes, newEpisode];
    setEpisodes(updatedEpisodes);
    await storage.set('episodes', JSON.stringify(updatedEpisodes));

    await addNotification({
      type: 'episode_scored',
      message: `Episode ${episodeScoring.episodeNumber} scores have been released!`,
      targetPlayerId: null
    });

    alert(`Episode ${episodeScoring.episodeNumber} scores submitted!`);
    setAdminView('main');
    setEpisodeScoring({
      episodeNumber: updatedEpisodes.length + 1,
      pickScoresData: {}
    });
  };

  const openQotwVoting = async (questionnaire) => {
    const updated = questionnaires.map(q =>
      q.id === questionnaire.id ? { ...q, qotwVotingOpen: true } : q
    );
    setQuestionnaires(updated);
    await storage.set('questionnaires', JSON.stringify(updated));

    await addNotification({
      type: 'qotw_voting_open',
      message: `QOTW voting is now open for ${questionnaire.title}!`,
      targetPlayerId: null
    });

    alert('QOTW voting opened!');
  };

  const closeQotwVoting = async (questionnaire) => {
    const updated = questionnaires.map(q =>
      q.id === questionnaire.id ? { ...q, qotwVotingOpen: false, qotwVotingClosed: true } : q
    );
    setQuestionnaires(updated);
    await storage.set('questionnaires', JSON.stringify(updated));
    alert('QOTW voting closed!');
  };

  const awardQotwWinner = async (questionnaire) => {
    const qotwVotesForThis = qotWVotes.filter(v => v.questionnaireId === questionnaire.id);
    const voteCounts = {};
    qotwVotesForThis.forEach(v => {
      voteCounts[v.answerId] = (voteCounts[v.answerId] || 0) + 1;
    });

    if (Object.keys(voteCounts).length === 0) {
      alert('No votes have been cast yet!');
      return;
    }

    const maxVotes = Math.max(...Object.values(voteCounts));
    const winners = Object.keys(voteCounts).filter(k => voteCounts[k] === maxVotes);
    const winnerPlayerIds = winners.map(answerId => parseInt(answerId.split('-')[0]));

    const updated = questionnaires.map(q =>
      q.id === questionnaire.id ? { ...q, qotwWinner: winnerPlayerIds, qotwAwarded: true } : q
    );
    setQuestionnaires(updated);
    await storage.set('questionnaires', JSON.stringify(updated));

    const winnerNames = winnerPlayerIds.map(id => players.find(p => p.id === id)?.name).join(', ');
    await addNotification({
      type: 'qotw_winner',
      message: `QOTW Winner${winnerPlayerIds.length > 1 ? 's' : ''} for ${questionnaire.title}: ${winnerNames} (+5 pts each)!`,
      targetPlayerId: null
    });

    alert(`Winner${winnerPlayerIds.length > 1 ? 's' : ''} awarded: ${winnerNames} (+5 points each)!`);
    setAdminView('main');
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
                {newQ.questions.map((q, idx) => {
                  const typeLabel = q.type === 'multiple-choice' ? 'Multiple Choice'
                    : q.type === 'cast-dropdown' ? 'Dropdown (Remaining Cast)'
                    : q.type === 'true-false' ? 'True/False'
                    : q.type;
                  return (
                    <div key={q.id} className="bg-yellow-900/20 p-4 rounded border border-yellow-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-yellow-300 font-semibold">
                          Question {idx + 1} - {typeLabel}
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
                            <div key={optIdx} className="flex gap-2">
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const updated = [...newQ.questions];
                                  updated[idx].options[optIdx] = e.target.value;
                                  setNewQ({...newQ, questions: updated});
                                }}
                                placeholder={`Option ${optIdx + 1}`}
                                className="flex-1 px-4 py-2 rounded bg-black/50 text-white border border-yellow-600 focus:outline-none focus:border-yellow-400"
                              />
                              {q.options.length > 2 && (
                                <button
                                  onClick={() => {
                                    const updated = [...newQ.questions];
                                    updated[idx].options = updated[idx].options.filter((_, i) => i !== optIdx);
                                    setNewQ({...newQ, questions: updated});
                                  }}
                                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const updated = [...newQ.questions];
                              updated[idx].options = [...updated[idx].options, ''];
                              setNewQ({...newQ, questions: updated});
                            }}
                            className="px-3 py-2 bg-yellow-700 text-white rounded text-sm hover:bg-yellow-600"
                          >
                            + Add Option
                          </button>
                        </div>
                      )}
                      {q.type === 'cast-dropdown' && (
                        <p className="text-yellow-400 text-sm mt-2">
                          Players will see a dropdown of all non-eliminated contestants
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => addQuestion('multiple-choice')} className="px-3 py-2 bg-yellow-700 text-white rounded text-sm hover:bg-yellow-600">
                  + Multiple Choice
                </button>
                <button onClick={() => addQuestion('cast-dropdown')} className="px-3 py-2 bg-yellow-700 text-white rounded text-sm hover:bg-yellow-600">
                  + Dropdown (Remaining Cast)
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
    // Safety check: if scoringQ is null (e.g., after refresh), go back to main
    if (!scoringQ) {
      return (
        <div className="space-y-6">
          <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-yellow-600">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">No Questionnaire Selected</h2>
            <p className="text-yellow-200 mb-4">Please select a questionnaire to score from the main panel.</p>
            <button
              onClick={() => setAdminView('main')}
              className="py-3 px-6 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition"
            >
              Back to Controls
            </button>
          </div>
        </div>
      );
    }
    const qSubmissions = submissions.filter(s => s.questionnaireId === scoringQ.id);
    const isRescore = scoringQ.isRescore;

    return (
      <div className="space-y-6">
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-yellow-600">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">
            {isRescore ? 'Re-Score' : 'Score'}: {scoringQ.title}
          </h2>

          {isRescore && (
            <div className="bg-amber-900/30 border border-amber-500 p-4 rounded-lg mb-6">
              <p className="text-amber-300 font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Re-Scoring Mode
              </p>
              <p className="text-amber-200 text-sm mt-1">
                Changing correct answers will calculate score adjustments for each player. Advantages (Double Trouble, Immunity Idol) will NOT be re-applied.
              </p>
            </div>
          )}

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

                {q.type === 'cast-dropdown' && (
                  <select
                    value={correctAnswers[q.id] || ''}
                    onChange={(e) => setCorrectAnswers({...correctAnswers, [q.id]: e.target.value})}
                    className="w-full px-4 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
                  >
                    <option value="">Select correct answer...</option>
                    {contestants.map(contestant => (
                      <option key={contestant.id} value={contestant.name}>{contestant.name}</option>
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
              className={`flex-1 py-3 ${isRescore ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'} text-white rounded-lg font-semibold transition text-lg`}
            >
              {isRescore ? 'Update Scores' : 'Release Scores to Players'}
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
                  <div className="space-y-1">
                    <p className="text-red-400 text-sm font-semibold">❌ Eliminated</p>
                    <button
                      onClick={() => eliminateContestant(contestant.id)}
                      className="w-full py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-500 transition text-sm"
                    >
                      <RotateCcw size={14} className="inline mr-1" /> Un-eliminate
                    </button>
                  </div>
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

  // Episode Scoring View
  if (adminView === 'episode-scoring') {
    // Get all players with picks
    const playersWithPicks = players.filter(player => {
      const hasInstinct = picks.some(p => p.playerId === player.id && p.type === 'instinct');
      const hasFinal = picks.some(p => p.playerId === player.id && p.type === 'final');
      return hasInstinct || hasFinal;
    });

    return (
      <div className="space-y-6">
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-blue-600">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">Episode Scoring</h2>

          <div className="mb-6">
            <label className="block text-blue-300 mb-2">Episode Number</label>
            <input
              type="number"
              value={episodeScoring.episodeNumber}
              onChange={(e) => setEpisodeScoring({...episodeScoring, episodeNumber: parseInt(e.target.value)})}
              className="w-32 px-4 py-2 rounded bg-black/50 text-white border border-blue-600 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-blue-300 font-semibold">Score Each Player's Picks</h3>

            {playersWithPicks.map(player => {
              const instinctPick = picks.find(p => p.playerId === player.id && p.type === 'instinct');
              const finalPick = picks.find(p => p.playerId === player.id && p.type === 'final');

              return (
                <div key={player.id} className="bg-blue-900/20 border border-blue-600 p-4 rounded-lg">
                  <h4 className="text-white font-bold mb-3">{player.name}</h4>

                  {instinctPick && (
                    <div className="mb-4 p-3 bg-amber-900/20 rounded-lg border border-amber-600">
                      <p className="text-amber-300 font-semibold mb-2">
                        Instinct Pick: {contestants.find(c => c.id === instinctPick.contestantId)?.name}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { key: 'survived', label: 'Survived (+1)' },
                          { key: 'immunity', label: 'Won Immunity (+1)' },
                          { key: 'reward', label: 'Won Reward (+1)' },
                          { key: 'journey', label: 'Went on Journey (+1)' },
                          { key: 'foundIdol', label: 'Found Idol/Adv (+2)' },
                          { key: 'playedIdol', label: 'Played Idol (+1)' },
                          { key: 'incorrectVote', label: 'Incorrect Vote (-1)' }
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-2 text-white text-sm">
                            <input
                              type="checkbox"
                              checked={episodeScoring.pickScoresData[instinctPick.id]?.[key] || false}
                              onChange={(e) => {
                                const current = episodeScoring.pickScoresData[instinctPick.id] || {};
                                setEpisodeScoring({
                                  ...episodeScoring,
                                  pickScoresData: {
                                    ...episodeScoring.pickScoresData,
                                    [instinctPick.id]: { ...current, [key]: e.target.checked }
                                  }
                                });
                              }}
                              className="w-4 h-4"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {finalPick && (
                    <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-600">
                      <p className="text-purple-300 font-semibold mb-2">
                        Final Pick: {contestants.find(c => c.id === finalPick.contestantId)?.name}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { key: 'survived', label: 'Survived (+1)' },
                          { key: 'immunity', label: 'Won Immunity (+1)' },
                          { key: 'reward', label: 'Won Reward (+1)' },
                          { key: 'journey', label: 'Went on Journey (+1)' },
                          { key: 'foundIdol', label: 'Found Idol/Adv (+2)' },
                          { key: 'playedIdol', label: 'Played Idol (+1)' },
                          { key: 'incorrectVote', label: 'Incorrect Vote (-1)' }
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-2 text-white text-sm">
                            <input
                              type="checkbox"
                              checked={episodeScoring.pickScoresData[finalPick.id]?.[key] || false}
                              onChange={(e) => {
                                const current = episodeScoring.pickScoresData[finalPick.id] || {};
                                setEpisodeScoring({
                                  ...episodeScoring,
                                  pickScoresData: {
                                    ...episodeScoring.pickScoresData,
                                    [finalPick.id]: { ...current, [key]: e.target.checked }
                                  }
                                });
                              }}
                              className="w-4 h-4"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={submitEpisodeScoring}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-500 hover:to-indigo-500 transition"
            >
              Submit Episode Scores
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
    );
  }

  // QOTW Management View
  if (adminView === 'qotw-management') {
    const gradedQuestionnaires = questionnaires.filter(q => q.scoresReleased && !q.qotwAwarded);

    return (
      <div className="space-y-6">
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-purple-600">
          <h2 className="text-2xl font-bold text-purple-400 mb-6">QOTW Management</h2>

          {gradedQuestionnaires.length === 0 ? (
            <p className="text-purple-200">No questionnaires ready for QOTW management. Grade a questionnaire first!</p>
          ) : (
            <div className="space-y-4">
              {gradedQuestionnaires.map(q => {
                const qotwVotesForThis = qotWVotes.filter(v => v.questionnaireId === q.id);
                const voteCounts = {};
                qotwVotesForThis.forEach(v => {
                  voteCounts[v.answerId] = (voteCounts[v.answerId] || 0) + 1;
                });

                const qotwSubmissions = submissions
                  .filter(s => s.questionnaireId === q.id && s.answers[q.qotw.id])
                  .map(s => ({
                    playerId: s.playerId,
                    playerName: players.find(p => p.id === s.playerId)?.name,
                    answer: s.answers[q.qotw.id],
                    votes: voteCounts[`${s.playerId}-${q.qotw.id}`] || 0
                  }))
                  .sort((a, b) => b.votes - a.votes);

                return (
                  <div key={q.id} className="bg-purple-900/20 border border-purple-600 p-4 rounded-lg">
                    <h3 className="text-white font-bold mb-2">{q.title}</h3>
                    <p className="text-purple-300 mb-4">QOTW: {q.qotw.text}</p>

                    <div className="mb-4">
                      <p className="text-purple-200 text-sm mb-2">Answers & Votes:</p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {qotwSubmissions.map((sub, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-black/30 p-2 rounded">
                            <div>
                              <span className="text-purple-400">{sub.playerName}:</span>
                              <span className="text-white ml-2">{sub.answer}</span>
                            </div>
                            <span className="text-purple-300 font-bold">{sub.votes} votes</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!q.qotwVotingOpen && !q.qotwVotingClosed && (
                        <button
                          onClick={() => openQotwVoting(q)}
                          className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-500 transition"
                        >
                          Open Voting
                        </button>
                      )}
                      {q.qotwVotingOpen && (
                        <button
                          onClick={() => closeQotwVoting(q)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded font-semibold hover:bg-yellow-500 transition"
                        >
                          Close Voting
                        </button>
                      )}
                      {q.qotwVotingClosed && !q.qotwAwarded && (
                        <button
                          onClick={() => awardQotwWinner(q)}
                          className="px-4 py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-500 transition"
                        >
                          Award Winner (+5 pts)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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

  // Cast Editor View
  if (adminView === 'cast-editor') {
    const tribes = [...new Set(contestants.map(c => c.tribe))];

    return (
      <div className="space-y-6">
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-green-600">
          <h2 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
            <Edit3 className="w-6 h-6" />
            Edit Cast - Season {currentSeason}
          </h2>

          {/* Add New Contestant */}
          <div className="mb-6 p-4 bg-green-900/30 border border-green-600 rounded-lg">
            <h3 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Contestant
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3 items-start">
              <input
                type="text"
                value={newContestantForm.name}
                onChange={(e) => setNewContestantForm({...newContestantForm, name: e.target.value})}
                placeholder="Name"
                className="px-3 py-2 rounded bg-black/50 text-white border border-green-600 focus:outline-none focus:border-green-400"
              />
              <select
                value={newContestantForm.tribe}
                onChange={(e) => setNewContestantForm({...newContestantForm, tribe: e.target.value})}
                className="px-3 py-2 rounded bg-black/50 text-white border border-green-600 focus:outline-none focus:border-green-400"
              >
                <option value="">Select Tribe</option>
                {tribes.map(t => <option key={t} value={t}>{t}</option>)}
                <option value="new">+ New Tribe</option>
              </select>
              {/* Image: URL input OR drag-and-drop */}
              <div className="lg:col-span-2">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newContestantForm.image}
                    onChange={(e) => setNewContestantForm({...newContestantForm, image: e.target.value})}
                    placeholder="Image URL"
                    className="flex-1 px-3 py-2 rounded bg-black/50 text-white border border-green-600 focus:outline-none focus:border-green-400"
                  />
                  <label className="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-500 flex items-center gap-1">
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Browse</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handleImageFile(e.target.files[0], (base64) => {
                          setNewContestantForm({...newContestantForm, image: base64});
                        });
                      }}
                    />
                  </label>
                </div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOverNew(true); }}
                  onDragLeave={() => setDragOverNew(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverNew(false);
                    handleImageFile(e.dataTransfer.files[0], (base64) => {
                      setNewContestantForm({...newContestantForm, image: base64});
                    });
                  }}
                  className={`border-2 border-dashed rounded p-3 text-center text-sm transition ${
                    dragOverNew
                      ? 'border-green-400 bg-green-900/40 text-green-300'
                      : 'border-gray-600 text-gray-400 hover:border-green-600'
                  }`}
                >
                  {newContestantForm.image ? (
                    <div className="flex items-center justify-center gap-2">
                      <img
                        src={newContestantForm.image}
                        alt="Preview"
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=?'; }}
                      />
                      <span className="text-green-400">Image loaded</span>
                      <button
                        onClick={() => setNewContestantForm({...newContestantForm, image: ''})}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Image className="w-4 h-4" />
                      Drop image here
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!newContestantForm.name) {
                    alert('Please enter a name');
                    return;
                  }
                  const tribe = newContestantForm.tribe === 'new'
                    ? prompt('Enter new tribe name:')
                    : newContestantForm.tribe || 'TBD';
                  if (tribe) {
                    await addContestant({ ...newContestantForm, tribe });
                    setNewContestantForm({ name: '', tribe: '', image: '' });
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-500 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Rename Tribe */}
          <div className="mb-6 p-4 bg-amber-900/30 border border-amber-600 rounded-lg">
            <h3 className="text-amber-300 font-semibold mb-3">Rename Tribe</h3>
            <div className="flex gap-3">
              <select
                value={editTribeForm.oldName}
                onChange={(e) => setEditTribeForm({...editTribeForm, oldName: e.target.value})}
                className="flex-1 px-3 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
              >
                <option value="">Select Tribe to Rename</option>
                {tribes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input
                type="text"
                value={editTribeForm.newName}
                onChange={(e) => setEditTribeForm({...editTribeForm, newName: e.target.value})}
                placeholder="New Name"
                className="flex-1 px-3 py-2 rounded bg-black/50 text-white border border-amber-600 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={async () => {
                  if (editTribeForm.oldName && editTribeForm.newName) {
                    await updateTribeName(editTribeForm.oldName, editTribeForm.newName);
                    setEditTribeForm({ oldName: '', newName: '' });
                  }
                }}
                className="px-4 py-2 bg-amber-600 text-white rounded font-semibold hover:bg-amber-500 transition"
              >
                Rename
              </button>
            </div>
          </div>

          {/* Cast List by Tribe */}
          {tribes.map(tribe => (
            <div key={tribe} className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                {tribe} Tribe ({contestants.filter(c => c.tribe === tribe).length})
              </h3>
              <div className="space-y-2">
                {contestants.filter(c => c.tribe === tribe).map(contestant => (
                  <div
                    key={contestant.id}
                    className={`p-3 rounded-lg border ${contestant.eliminated ? 'bg-red-900/20 border-red-600 opacity-60' : 'bg-green-900/20 border-green-600'}`}
                  >
                    {editingContestant === contestant.id ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <img
                            src={document.getElementById(`image-${contestant.id}`)?.value || contestant.image || 'https://via.placeholder.com/50?text=?'}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=?'; }}
                          />
                          <input
                            type="text"
                            defaultValue={contestant.name}
                            id={`name-${contestant.id}`}
                            placeholder="Name"
                            className="flex-1 min-w-[150px] px-3 py-2 rounded bg-black/50 text-white border border-green-600"
                          />
                          <select
                            defaultValue={contestant.tribe}
                            id={`tribe-${contestant.id}`}
                            className="px-3 py-2 rounded bg-black/50 text-white border border-green-600"
                          >
                            {tribes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        {/* Image section with drag-and-drop */}
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            defaultValue={contestant.image}
                            id={`image-${contestant.id}`}
                            placeholder="Image URL"
                            className="flex-1 min-w-[200px] px-3 py-2 rounded bg-black/50 text-white border border-green-600"
                          />
                          <label className="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-500 flex items-center gap-1">
                            <Upload className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleImageFile(e.target.files[0], (base64) => {
                                  document.getElementById(`image-${contestant.id}`).value = base64;
                                  setDragOverEdit(null); // trigger re-render
                                });
                              }}
                            />
                          </label>
                          <div
                            onDragOver={(e) => { e.preventDefault(); setDragOverEdit(contestant.id); }}
                            onDragLeave={() => setDragOverEdit(null)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setDragOverEdit(null);
                              handleImageFile(e.dataTransfer.files[0], (base64) => {
                                document.getElementById(`image-${contestant.id}`).value = base64;
                              });
                            }}
                            className={`flex-1 min-w-[120px] border-2 border-dashed rounded p-2 text-center text-sm transition ${
                              dragOverEdit === contestant.id
                                ? 'border-green-400 bg-green-900/40 text-green-300'
                                : 'border-gray-600 text-gray-400'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <Image className="w-4 h-4" />
                              Drop image
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              const name = document.getElementById(`name-${contestant.id}`).value;
                              const tribe = document.getElementById(`tribe-${contestant.id}`).value;
                              const image = document.getElementById(`image-${contestant.id}`).value;
                              await updateContestant(contestant.id, { name, tribe, image });
                              setEditingContestant(null);
                            }}
                            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-500"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingContestant(null)}
                            className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={contestant.image || 'https://via.placeholder.com/50?text=?'}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=?'; }}
                          />
                          <div>
                            <p className="text-white font-semibold">{contestant.name}</p>
                            <p className="text-green-300 text-sm">{contestant.tribe}</p>
                            {contestant.eliminated && <span className="text-red-400 text-xs">Eliminated</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingContestant(contestant.id)}
                            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-500"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm(`Remove ${contestant.name} from the cast? This cannot be undone if they have picks.`)) {
                                await removeContestant(contestant.id);
                              }
                            }}
                            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={() => setAdminView('main')}
            className="mt-4 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition"
          >
            Back to Controls
          </button>
        </div>
      </div>
    );
  }

  // Season Management View
  if (adminView === 'season-management') {
    return (
      <div className="space-y-6">
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-cyan-600">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
            <Archive className="w-6 h-6" />
            Season Management
          </h2>

          {/* Current Season Info */}
          <div className="mb-6 p-4 bg-cyan-900/30 border border-cyan-600 rounded-lg">
            <h3 className="text-cyan-300 font-semibold mb-3">Current Season: {currentSeason}</h3>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="bg-black/30 p-3 rounded">
                <p className="text-2xl font-bold text-white">{contestants.length}</p>
                <p className="text-cyan-300 text-sm">Total Cast</p>
              </div>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-2xl font-bold text-white">{contestants.filter(c => !c.eliminated).length}</p>
                <p className="text-cyan-300 text-sm">Remaining</p>
              </div>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-2xl font-bold text-white">{questionnaires.length}</p>
                <p className="text-cyan-300 text-sm">Questionnaires</p>
              </div>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-2xl font-bold text-white capitalize">{gamePhase.replace('-', ' ')}</p>
                <p className="text-cyan-300 text-sm">Current Phase</p>
              </div>
            </div>
          </div>

          {/* Start New Season */}
          <div className="mb-6 p-4 bg-green-900/30 border border-green-600 rounded-lg">
            <h3 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Start New Season
            </h3>
            <p className="text-green-200 text-sm mb-4">
              This will archive the current season data and reset the game for a new season.
              All picks, questionnaires, and scores will be saved to history.
            </p>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-green-200 text-sm mb-1">New Season Number</label>
                <input
                  type="number"
                  value={newSeasonForm.seasonNumber}
                  onChange={(e) => setNewSeasonForm({ seasonNumber: parseInt(e.target.value) })}
                  className="w-24 px-3 py-2 rounded bg-black/50 text-white border border-green-600"
                />
              </div>
              <button
                onClick={async () => {
                  if (window.confirm(`Start Season ${newSeasonForm.seasonNumber}? This will archive Season ${currentSeason} and reset all game data.`)) {
                    // Create empty cast for new season
                    const emptyCast = [];
                    await startNewSeason(newSeasonForm.seasonNumber, emptyCast);
                    alert(`Season ${newSeasonForm.seasonNumber} has begun! Add your new cast in the Cast Editor.`);
                    setAdminView('cast-editor');
                  }
                }}
                className="px-6 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-500 transition mt-5"
              >
                Start Season {newSeasonForm.seasonNumber}
              </button>
            </div>
          </div>

          {/* Season History */}
          <div className="p-4 bg-purple-900/30 border border-purple-600 rounded-lg">
            <h3 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Season History
            </h3>
            {seasonHistory.length === 0 ? (
              <p className="text-purple-200 text-sm">No archived seasons yet.</p>
            ) : (
              <div className="space-y-3">
                {seasonHistory.map((season, idx) => (
                  <div key={idx} className="bg-black/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">Season {season.season}</h4>
                      <span className="text-purple-300 text-sm">
                        Archived: {new Date(season.archivedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-purple-200 mb-2">
                      {season.contestants?.length || 0} contestants • {season.questionnaires?.length || 0} questionnaires
                    </div>
                    {season.finalStandings && (
                      <div className="mt-2">
                        <p className="text-purple-300 text-sm mb-1">Final Standings:</p>
                        <div className="flex flex-wrap gap-2">
                          {season.finalStandings.slice(0, 3).map((player, rank) => (
                            <span key={player.id} className={`px-2 py-1 rounded text-xs ${
                              rank === 0 ? 'bg-yellow-600 text-white' :
                              rank === 1 ? 'bg-gray-400 text-black' :
                              'bg-amber-700 text-white'
                            }`}>
                              #{rank + 1} {player.name} ({player.points} pts)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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

  if (adminView === 'phase-control') {
    // Safety check for required data
    const safeGamePhase = gamePhase || 'instinct-picks';
    const safePicksLocked = picksLocked || { instinct: false, final: false };
    const currentIndex = GAME_PHASES.indexOf(safeGamePhase);

    return (
      <div className="space-y-6">
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-yellow-600">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
            <RefreshCw className="w-6 h-6" />
            Phase Control
          </h2>

          {/* Current Phase Display */}
          <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-600 mb-6">
            <p className="text-yellow-300 text-sm mb-1">Current Phase</p>
            <p className="text-2xl font-bold text-white capitalize">{safeGamePhase.replace('-', ' ')}</p>
            <p className="text-yellow-400 text-sm mt-1">Phase {currentIndex + 1} of {GAME_PHASES.length}</p>
          </div>

          {/* Phase Navigation */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={regressPhase}
              disabled={currentIndex === 0}
              className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                currentIndex === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous Phase
            </button>
            <button
              onClick={advancePhase}
              disabled={currentIndex === GAME_PHASES.length - 1}
              className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                currentIndex === GAME_PHASES.length - 1
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500'
              }`}
            >
              Next Phase
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* All Phases Grid */}
          <div>
            <p className="text-yellow-300 font-semibold mb-3">Jump to Phase</p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {GAME_PHASES.map((phase, idx) => (
                <button
                  key={phase}
                  onClick={() => phase !== safeGamePhase && setPhaseDirectly(phase)}
                  className={`p-3 rounded-lg border text-sm font-semibold transition ${
                    phase === safeGamePhase
                      ? 'bg-yellow-600 border-yellow-400 text-white'
                      : 'bg-yellow-900/20 border-yellow-600/50 text-yellow-200 hover:bg-yellow-900/40'
                  }`}
                >
                  <p className="capitalize">{phase.replace('-', ' ')}</p>
                  <p className="text-xs opacity-70 mt-1">Phase {idx + 1}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Phase Descriptions */}
          <div className="mt-6 bg-yellow-900/20 p-4 rounded-lg border border-yellow-600/50">
            <p className="text-yellow-300 font-semibold mb-2">Phase Guide</p>
            <div className="space-y-2 text-sm">
              <p className="text-yellow-200"><span className="text-yellow-400">Instinct Picks:</span> Pre-season, players select their first pick</p>
              <p className="text-yellow-200"><span className="text-yellow-400">Early Season:</span> Episodes 1-4, picks are locked</p>
              <p className="text-yellow-200"><span className="text-yellow-400">Final Picks:</span> Post-merge, players select their final pick</p>
              <p className="text-yellow-200"><span className="text-yellow-400">Mid Season:</span> Merge to near-finale</p>
              <p className="text-yellow-200"><span className="text-yellow-400">Finale:</span> Final episodes of the season</p>
            </div>
          </div>

          {/* Picks Lock Control */}
          <div className="mt-6 bg-amber-900/20 p-4 rounded-lg border border-amber-600">
            <p className="text-amber-300 font-semibold mb-3">Picks Lock Control</p>
            <p className="text-amber-200 text-sm mb-4">
              Players can change their picks until you lock them. Lock picks when you're ready to start scoring.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => togglePicksLock('instinct')}
                className={`p-4 rounded-lg border-2 font-semibold transition flex flex-col items-center gap-2 ${
                  safePicksLocked.instinct
                    ? 'bg-red-900/40 border-red-500 text-red-300'
                    : 'bg-green-900/40 border-green-500 text-green-300'
                }`}
              >
                <span className="text-2xl">{safePicksLocked.instinct ? '🔒' : '🔓'}</span>
                <span>Instinct Picks</span>
                <span className="text-xs opacity-80">{safePicksLocked.instinct ? 'Locked' : 'Unlocked'}</span>
              </button>
              <button
                onClick={() => togglePicksLock('final')}
                className={`p-4 rounded-lg border-2 font-semibold transition flex flex-col items-center gap-2 ${
                  safePicksLocked.final
                    ? 'bg-red-900/40 border-red-500 text-red-300'
                    : 'bg-green-900/40 border-green-500 text-green-300'
                }`}
              >
                <span className="text-2xl">{safePicksLocked.final ? '🔒' : '🔓'}</span>
                <span>Final Picks</span>
                <span className="text-xs opacity-80">{safePicksLocked.final ? 'Locked' : 'Unlocked'}</span>
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => setAdminView('main')}
          className="w-full py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition"
        >
          Back to Controls
        </button>
      </div>
    );
  }

  if (adminView === 'password-management') {
    const resetPassword = async (playerId) => {
      if (!requireRealUser('Reset Password')) return;

      const player = players.find(p => p.id === playerId);
      if (!player) return;

      if (!confirm(`Reset ${player.name}'s password to "password123"?`)) return;

      // Use server-side password reset (hashed)
      const result = await auth.resetToDefault(playerId);
      if (result.success) {
        alert(`${player.name}'s password has been reset to "password123"`);
      } else {
        alert('Failed to reset password. Please try again.');
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-gray-600">
          <h2 className="text-2xl font-bold text-gray-300 mb-6 flex items-center gap-2">
            <Key className="w-6 h-6" />
            Password Management
          </h2>

          <p className="text-gray-400 mb-4 text-sm">
            Reset a player's password to the default: <code className="bg-gray-800 px-2 py-1 rounded">password123</code>
          </p>

          <div className="space-y-3">
            {players.map(player => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center border-2 border-gray-500">
                    <span className="text-white font-bold">{player.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{player.name}</p>
                    {player.isAdmin && (
                      <span className="text-yellow-400 text-xs flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Admin
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => resetPassword(player.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-500 transition flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset to Default
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setAdminView('main')}
            className="w-full mt-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition"
          >
            Back to Controls
          </button>
        </div>
      </div>
    );
  }

  if (adminView === 'backup-management') {
    const loadSnapshots = async () => {
      setLoadingBackup(true);
      const result = await backup.getSnapshots();
      if (result.success) {
        setSnapshots(result.snapshots);
      }
      setLoadingBackup(false);
    };

    const createManualSnapshot = async () => {
      if (!requireRealUser('Create Backup')) return;
      setLoadingBackup(true);
      const result = await backup.createSnapshot('manual');
      if (result.success) {
        alert('Backup created successfully!');
        await loadSnapshots();
      } else {
        alert('Failed to create backup');
      }
      setLoadingBackup(false);
    };

    const restoreSnapshot = async (snapshotId) => {
      if (!requireRealUser('Restore Backup')) return;
      if (!confirm('Are you sure you want to restore this backup? This will overwrite all current data. A safety backup will be created first.')) return;

      setLoadingBackup(true);
      const result = await backup.restoreSnapshot(snapshotId);
      if (result.success) {
        alert('Backup restored successfully! Please refresh the page to see the changes.');
        window.location.reload();
      } else {
        alert('Failed to restore backup: ' + result.error);
      }
      setLoadingBackup(false);
    };

    const deleteSnapshot = async (snapshotId) => {
      if (!requireRealUser('Delete Backup')) return;
      if (!confirm('Are you sure you want to delete this backup? This cannot be undone.')) return;

      setLoadingBackup(true);
      const result = await backup.deleteSnapshot(snapshotId);
      if (result.success) {
        await loadSnapshots();
      } else {
        alert('Failed to delete backup');
      }
      setLoadingBackup(false);
    };

    const exportData = async () => {
      const result = await backup.exportData();
      if (result.success) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `survivor-fantasy-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert('Failed to export data');
      }
    };

    // Load snapshots on mount
    if (snapshots.length === 0 && !loadingBackup) {
      loadSnapshots();
    }

    const formatTrigger = (trigger) => {
      const triggerLabels = {
        'manual': 'Manual Backup',
        'before-release-scores': 'Before Score Release',
        'before-episode-scoring': 'Before Episode Scoring',
        'before-eliminate-contestant': 'Before Elimination',
        'before-un-eliminate-contestant': 'Before Un-eliminate',
        'pre-restore-safety': 'Pre-Restore Safety'
      };
      return triggerLabels[trigger] || trigger;
    };

    return (
      <div className="space-y-6">
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-slate-600">
          <h2 className="text-2xl font-bold text-slate-300 mb-6 flex items-center gap-2">
            <Database className="w-6 h-6" />
            Backup Management
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={createManualSnapshot}
              disabled={loadingBackup}
              className="py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-500 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Database className="w-5 h-5" />
              Create Manual Backup
            </button>
            <button
              onClick={exportData}
              disabled={loadingBackup}
              className="py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              Export Data (JSON)
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-300 font-semibold">Snapshots</h3>
              <button
                onClick={loadSnapshots}
                disabled={loadingBackup}
                className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
              >
                <RefreshCw className={`w-4 h-4 ${loadingBackup ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {loadingBackup && snapshots.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Loading snapshots...</p>
            ) : snapshots.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No snapshots yet. They'll be created automatically before risky actions.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {snapshots.map(snapshot => (
                  <div
                    key={snapshot.id}
                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700"
                  >
                    <div>
                      <p className="text-white font-medium text-sm">{formatTrigger(snapshot.trigger)}</p>
                      <p className="text-slate-400 text-xs">
                        {new Date(snapshot.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => restoreSnapshot(snapshot.id)}
                        disabled={loadingBackup}
                        className="px-3 py-1 bg-amber-600 text-white rounded text-sm font-medium hover:bg-amber-500 transition flex items-center gap-1 disabled:opacity-50"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Restore
                      </button>
                      <button
                        onClick={() => deleteSnapshot(snapshot.id)}
                        disabled={loadingBackup}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-500 transition flex items-center gap-1 disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-slate-500 text-xs mb-4">
            Snapshots are created automatically before: releasing scores, episode scoring, and contestant eliminations.
          </p>

          <button
            onClick={() => setAdminView('main')}
            className="w-full py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-500 transition"
          >
            Back to Controls
          </button>
        </div>
      </div>
    );
  }

  if (adminView === 'tree-mail') {
    const togglePlayer = (playerId) => {
      if (notificationForm.selectedPlayers.includes(playerId)) {
        setNotificationForm({
          ...notificationForm,
          selectedPlayers: notificationForm.selectedPlayers.filter(id => id !== playerId)
        });
      } else {
        setNotificationForm({
          ...notificationForm,
          selectedPlayers: [...notificationForm.selectedPlayers, playerId]
        });
      }
    };

    const handleSendNotification = async () => {
      if (!notificationForm.message.trim()) {
        alert('Please enter a message');
        return;
      }

      if (!notificationForm.sendToAll && notificationForm.selectedPlayers.length === 0) {
        alert('Please select at least one player or choose "Send to All"');
        return;
      }

      if (notificationForm.sendToAll) {
        await addNotification({
          type: 'admin_message',
          message: notificationForm.message,
          targetPlayerId: null
        });
      } else {
        for (const playerId of notificationForm.selectedPlayers) {
          await addNotification({
            type: 'admin_message',
            message: notificationForm.message,
            targetPlayerId: playerId
          });
        }
      }

      const recipientCount = notificationForm.sendToAll ? players.length : notificationForm.selectedPlayers.length;
      alert(`Notification sent to ${recipientCount} player${recipientCount > 1 ? 's' : ''}!`);
      setNotificationForm({ selectedPlayers: [], message: '', sendToAll: false });
    };

    const getRecipientName = (notif) => {
      if (!notif.targetPlayerId) return 'Everyone';
      const player = players.find(p => p.id === notif.targetPlayerId);
      return player ? player.name : 'Unknown';
    };

    return (
      <div className="space-y-6">
        {/* Send New Notification */}
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-orange-600">
          <h2 className="text-2xl font-bold text-orange-400 mb-6 flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Tree Mail
          </h2>

          <div className="space-y-4">
            <h3 className="text-orange-300 font-semibold">Send New Notification</h3>

            {/* Send to All Toggle */}
            <label className="flex items-center gap-3 p-3 bg-orange-900/30 rounded-lg border border-orange-600 cursor-pointer hover:bg-orange-900/50 transition">
              <input
                type="checkbox"
                checked={notificationForm.sendToAll}
                onChange={(e) => setNotificationForm({
                  ...notificationForm,
                  sendToAll: e.target.checked,
                  selectedPlayers: e.target.checked ? [] : notificationForm.selectedPlayers
                })}
                className="w-5 h-5"
              />
              <div>
                <span className="text-white font-semibold">Send to All Players</span>
                <p className="text-orange-300 text-sm">Broadcast to everyone</p>
              </div>
            </label>

            {/* Individual Player Selection */}
            {!notificationForm.sendToAll && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {players.map(player => (
                  <label
                    key={player.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition text-sm ${
                      notificationForm.selectedPlayers.includes(player.id)
                        ? 'bg-orange-600 border-orange-400 text-white'
                        : 'bg-orange-900/20 border-orange-600/50 text-orange-200 hover:bg-orange-900/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={notificationForm.selectedPlayers.includes(player.id)}
                      onChange={() => togglePlayer(player.id)}
                      className="w-3 h-3"
                    />
                    <span>{player.name}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Message Input */}
            <textarea
              value={notificationForm.message}
              onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
              placeholder="Enter your notification message..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-black/50 text-white border border-orange-600 focus:outline-none focus:border-orange-400 resize-none"
            />

            <button
              onClick={handleSendNotification}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-red-500 transition flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Send Tree Mail
            </button>
          </div>
        </div>

        {/* Manage Existing Notifications */}
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-orange-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-orange-400">Current Notifications ({notifications.length})</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-500 transition"
              >
                Clear All
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-orange-300 text-center py-4">No notifications currently active</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(notif => (
                  <div
                    key={notif.id}
                    className="flex items-start justify-between gap-3 p-3 bg-orange-900/20 rounded-lg border border-orange-600/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">{notif.message}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-orange-400 text-xs">
                          To: {getRecipientName(notif)}
                        </span>
                        <span className="text-orange-400/60 text-xs">
                          {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <span className={`text-xs ${notif.read ? 'text-green-400' : 'text-yellow-400'}`}>
                          {notif.read ? 'Read' : 'Unread'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="text-red-400 hover:text-red-300 p-1 transition flex-shrink-0"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setNotificationForm({ selectedPlayers: [], message: '', sendToAll: false });
            setAdminView('main');
          }}
          className="w-full py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition"
        >
          Back to Controls
        </button>
      </div>
    );
  }

  if (adminView === 'challenge-management') {
    const activeChallenge = challenges.find(c => c.status === 'active');
    const completedChallenges = challenges.filter(c => c.status === 'completed').slice(-10).reverse();

    return (
      <div className="space-y-6">
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-cyan-600">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Wordle Challenge Management
          </h2>

          {/* Current Status */}
          <div className="mb-6 p-4 bg-cyan-900/30 rounded-lg border border-cyan-600">
            <h3 className="text-cyan-300 font-semibold mb-2">Current Status</h3>
            {activeChallenge ? (
              <div>
                <p className="text-white">Active Challenge: <span className="font-mono tracking-widest text-cyan-300">{activeChallenge.word}</span></p>
                <p className="text-cyan-200 text-sm">Ends: {new Date(activeChallenge.weekEnd).toLocaleString()}</p>
                <p className="text-cyan-200 text-sm">
                  Attempts: {challengeAttempts.filter(a => a.challengeId === activeChallenge.id).length} started,
                  {' '}{challengeAttempts.filter(a => a.challengeId === activeChallenge.id && a.solved).length} solved
                </p>
                <button
                  onClick={async () => {
                    if (window.confirm('End this challenge early and calculate winner?')) {
                      await adminEndChallenge(activeChallenge.id);
                      alert('Challenge ended!');
                    }
                  }}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition"
                >
                  End Challenge Early
                </button>
              </div>
            ) : (
              <p className="text-cyan-200">No active challenge</p>
            )}
          </div>

          {/* Create New Challenge */}
          <div className="mb-6 p-4 bg-cyan-900/30 rounded-lg border border-cyan-600">
            <h3 className="text-cyan-300 font-semibold mb-3">Create New Challenge</h3>
            <div className="flex gap-3">
              <input
                type="text"
                id="challenge-word-input"
                placeholder="5-letter word"
                maxLength={5}
                className="flex-1 px-4 py-2 rounded bg-black/50 text-white border border-cyan-600 font-mono text-lg tracking-widest uppercase"
                onChange={(e) => e.target.value = e.target.value.toUpperCase()}
              />
              <button
                onClick={async () => {
                  const input = document.getElementById('challenge-word-input');
                  const word = input.value.trim().toUpperCase();
                  if (word.length !== 5) {
                    alert('Word must be exactly 5 letters');
                    return;
                  }
                  if (!/^[A-Z]+$/.test(word)) {
                    alert('Word must contain only letters');
                    return;
                  }
                  if (window.confirm(`Create challenge with word "${word}"?`)) {
                    await adminCreateChallenge(word);
                    input.value = '';
                    alert('Challenge created!');
                  }
                }}
                className="px-6 py-2 bg-cyan-600 text-white rounded font-semibold hover:bg-cyan-500 transition"
              >
                Create
              </button>
            </div>
            <p className="text-cyan-400 text-sm mt-2">
              Suggested: {SURVIVOR_WORDS.slice(0, 8).join(', ')}...
            </p>
          </div>

          {/* Past Challenges */}
          {completedChallenges.length > 0 && (
            <div className="p-4 bg-cyan-900/30 rounded-lg border border-cyan-600">
              <h3 className="text-cyan-300 font-semibold mb-3">Recent Challenges</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {completedChallenges.map(c => {
                  const winner = players.find(p => p.id === c.winnerId);
                  const attempts = challengeAttempts.filter(a => a.challengeId === c.id);
                  return (
                    <div key={c.id} className="bg-cyan-900/20 p-3 rounded border border-cyan-600/50">
                      <div className="flex justify-between">
                        <span className="text-white font-mono tracking-widest">{c.word}</span>
                        <span className="text-cyan-300 text-sm">
                          {new Date(c.weekStart).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-cyan-400 text-sm">
                        {winner
                          ? `Winner: ${winner.name} (${c.winnerData?.guesses} guesses)`
                          : 'No winner'
                        } • {attempts.filter(a => a.solved).length}/{attempts.length} solved
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setAdminView('main')}
          className="w-full py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition"
        >
          Back to Controls
        </button>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Guest Mode Banner */}
      {isGuestMode && (
        <div className="bg-gray-800 border-2 border-gray-500 p-4 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            <Eye className="w-5 h-5 text-gray-300" />
          </div>
          <div>
            <h3 className="text-gray-200 font-bold">Demo Mode - Read Only</h3>
            <p className="text-gray-400 text-sm">You can view the admin panel but cannot make changes. Log in as a real admin to manage the game.</p>
          </div>
        </div>
      )}

      {/* Season Header */}
      <div className="bg-gradient-to-r from-amber-900/60 to-orange-900/60 p-4 rounded-lg border-2 border-amber-600 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-amber-400">Season {currentSeason}</h2>
          <p className="text-amber-200 text-sm capitalize">{gamePhase.replace('-', ' ')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-300 text-sm">{contestants.filter(c => !c.eliminated).length}/{contestants.length} remaining</span>
        </div>
      </div>

      {/* Weekly Admin Checklist */}
      {(() => {
        // Determine current episode based on completion status
        const getWeeklyStatus = () => {
          if (questionnaires.length === 0) {
            return { episode: 1, questionnaire: 'not-created', qotw: 'not-open', pickScoring: false, eliminations: false, wordle: 'none', allDone: false };
          }

          // Sort questionnaires by episode number
          const sortedQs = [...questionnaires].sort((a, b) => (b.episodeNumber || 0) - (a.episodeNumber || 0));

          // Find the current working episode (first incomplete, or latest if all done)
          for (const q of sortedQs) {
            const ep = q.episodeNumber || 1;
            const hasPickScoring = pickScores.some(ps => ps.episode === ep);
            const qStatus = q.scoresReleased ? 'released' : (q.status === 'scored' ? 'graded' : 'collecting');
            const qotwStatus = q.scoresReleased ? 'awarded' : (q.qotwVotingOpen ? 'voting' : 'not-open');
            const hasEliminations = contestants.some(c => c.eliminatedEpisode === ep);

            // Check Wordle status
            const activeChallenge = challenges.find(c => c.status === 'active');
            const completedThisWeek = challenges.find(c => c.status === 'ended' && c.winnerId);
            const wordleStatus = completedThisWeek ? 'awarded' : (activeChallenge ? 'active' : 'none');

            const allDone = qStatus === 'released' && hasPickScoring && hasEliminations && (wordleStatus === 'awarded' || wordleStatus === 'none');

            if (!allDone) {
              return { episode: ep, questionnaire: qStatus, qotw: qotwStatus, pickScoring: hasPickScoring, eliminations: hasEliminations, wordle: wordleStatus, allDone: false, q };
            }
          }

          // All episodes complete - show latest and prompt for next
          const latestQ = sortedQs[0];
          const latestEp = latestQ?.episodeNumber || 1;
          const activeChallenge = challenges.find(c => c.status === 'active');
          const completedThisWeek = challenges.find(c => c.status === 'ended' && c.winnerId);
          const wordleStatus = completedThisWeek ? 'awarded' : (activeChallenge ? 'active' : 'none');

          return {
            episode: latestEp,
            questionnaire: 'released',
            qotw: 'awarded',
            pickScoring: true,
            eliminations: true,
            wordle: wordleStatus,
            allDone: true,
            nextEpisode: latestEp + 1
          };
        };

        const status = getWeeklyStatus();

        const getStatusIcon = (done) => done
          ? <span className="text-green-400">✓</span>
          : <span className="text-yellow-400">○</span>;

        const getQStatusText = (s) => {
          switch(s) {
            case 'not-created': return 'Not created';
            case 'collecting': return 'Collecting';
            case 'graded': return 'Graded';
            case 'released': return 'Released';
            default: return s;
          }
        };

        const getQotwStatusText = (s) => {
          switch(s) {
            case 'not-open': return 'Not open';
            case 'voting': return 'Voting';
            case 'awarded': return 'Awarded';
            default: return s;
          }
        };

        const getWordleStatusText = (s) => {
          switch(s) {
            case 'none': return 'No challenge';
            case 'active': return 'Active';
            case 'awarded': return 'Awarded';
            default: return s;
          }
        };

        return (
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 p-4 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-200 font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Episode {status.episode} Checklist
              </h3>
              {status.allDone && (
                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">All Done!</span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-1">
                {getStatusIcon(status.questionnaire === 'released')}
                <span className="text-slate-400">Q:</span>
                <span className={status.questionnaire === 'released' ? 'text-green-400' : 'text-yellow-300'}>
                  {getQStatusText(status.questionnaire)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon(status.qotw === 'awarded')}
                <span className="text-slate-400">QotW:</span>
                <span className={status.qotw === 'awarded' ? 'text-green-400' : 'text-yellow-300'}>
                  {getQotwStatusText(status.qotw)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon(status.pickScoring)}
                <span className="text-slate-400">Picks:</span>
                <span className={status.pickScoring ? 'text-green-400' : 'text-yellow-300'}>
                  {status.pickScoring ? 'Scored' : 'Not done'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon(status.eliminations)}
                <span className="text-slate-400">Elim:</span>
                <span className={status.eliminations ? 'text-green-400' : 'text-yellow-300'}>
                  {status.eliminations ? 'Done' : 'Not done'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon(status.wordle === 'awarded' || status.wordle === 'none')}
                <span className="text-slate-400">Wordle:</span>
                <span className={status.wordle === 'awarded' ? 'text-green-400' : (status.wordle === 'none' ? 'text-slate-500' : 'text-yellow-300')}>
                  {getWordleStatusText(status.wordle)}
                </span>
              </div>
            </div>
            {status.allDone && (
              <p className="text-green-300 text-xs mt-2">Ready to create Episode {status.nextEpisode} questionnaire!</p>
            )}
          </div>
        );
      })()}

      <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-yellow-600">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
          <Crown className="w-6 h-6" />
          Jeff's Control Panel
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => setAdminView('create-questionnaire')}
            className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-yellow-500 hover:to-amber-500 transition text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span>Create Questionnaire</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>

          <button
            onClick={() => setAdminView('cast-editor')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-500 hover:to-emerald-500 transition text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                <span>Edit Cast</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>

          <button
            onClick={() => setAdminView('manage-cast')}
            className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-red-500 hover:to-rose-500 transition text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Eliminations</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>

          <button
            onClick={() => setAdminView('episode-scoring')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-500 hover:to-indigo-500 transition text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>Episode Scoring</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>

          <button
            onClick={() => setAdminView('qotw-management')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-purple-500 hover:to-pink-500 transition text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>QOTW Management</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>

          <button
            onClick={() => setAdminView('phase-control')}
            className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-yellow-500 hover:to-amber-500 transition text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                <span>Phase Control</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>

          <button
            onClick={() => setAdminView('season-management')}
            className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-cyan-500 hover:to-teal-500 transition text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5" />
                <span>Season Management</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>

          <button
            onClick={() => setAdminView('tree-mail')}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-orange-500 hover:to-red-500 transition text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span>Tree Mail</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>

          <button
            onClick={() => setAdminView('challenge-management')}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-cyan-500 hover:to-blue-500 transition text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>Wordle Challenge</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>

          <button
            onClick={() => setAdminView('password-management')}
            className="bg-gradient-to-r from-gray-600 to-slate-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-gray-500 hover:to-slate-500 transition text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                <span>Password Management</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>

          <button
            onClick={() => setAdminView('backup-management')}
            className="bg-gradient-to-r from-slate-600 to-zinc-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-slate-500 hover:to-zinc-500 transition text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                <span>Backup Management</span>
              </div>
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
                const now = new Date();
                const deadline = new Date(q.deadline);
                const lockedAt = new Date(q.lockedAt);
                const isPastDeadline = now > deadline;
                const isLocked = now > lockedAt;
                return (
                  <div key={q.id} className="bg-yellow-900/20 border border-yellow-600 p-4 rounded-lg">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-semibold">{q.title}</p>
                          <p className="text-yellow-300 text-sm">
                            Episode {q.episodeNumber} • {qSubmissions.length}/{players.length} submitted
                          </p>
                          <p className={`text-sm ${isPastDeadline ? 'text-red-400' : 'text-green-400'}`}>
                            Deadline: {deadline.toLocaleString()} {isPastDeadline ? '(PASSED)' : ''}
                          </p>
                          {q.scoresReleased && (
                            <span className="text-green-400 text-sm">✓ Scores Released</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                          {/* Re-Open Button - show when past deadline or locked */}
                          {(isPastDeadline || isLocked) && !q.scoresReleased && (
                            <button
                              onClick={() => reopenQuestionnaire(q)}
                              className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-500 transition flex items-center gap-1"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Re-Open
                            </button>
                          )}
                          {!q.scoresReleased && (
                            <button
                              onClick={() => {
                                setScoringQ(q);
                                setCorrectAnswers(q.correctAnswers || {});
                                setAdminView('score-questionnaire');
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-500 transition"
                            >
                              Score
                            </button>
                          )}
                          {q.scoresReleased && (
                            <button
                              onClick={() => {
                                setScoringQ({ ...q, isRescore: true });
                                setCorrectAnswers(q.correctAnswers || {});
                                setAdminView('score-questionnaire');
                              }}
                              className="px-4 py-2 bg-amber-600 text-white rounded font-semibold hover:bg-amber-500 transition flex items-center gap-1"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Re-Score
                            </button>
                          )}
                        </div>
                      </div>
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

// Notification Banners Component - Shows unseen notifications as dismissible banners
// Banners are marked as "seen" when user leaves the Home tab (handled by parent)
function NotificationBanners({ notifications, currentUser, markNotificationSeen, onVisibleNotifications }) {
  const [dismissedIds, setDismissedIds] = useState(new Set());

  // Get unseen notifications for this user (broadcast or targeted to them)
  // Uses seenBy array for per-user tracking
  const unseenNotifications = notifications.filter(n => {
    const isForMe = n.targetPlayerId === currentUser.id || !n.targetPlayerId;
    const seenBy = n.seenBy || [];
    const hasSeen = seenBy.includes(currentUser.id) || n.seen; // Support legacy 'seen' field
    return !hasSeen && !dismissedIds.has(n.id) && isForMe;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first

  // Report visible notification IDs to parent (for marking as seen when leaving tab)
  useEffect(() => {
    const visibleIds = unseenNotifications.slice(0, 5).map(n => n.id);
    if (onVisibleNotifications) {
      onVisibleNotifications(visibleIds);
    }
  }, [unseenNotifications.map(n => n.id).join(',')]);

  const dismissNotification = (notifId) => {
    markNotificationSeen(notifId);
    setDismissedIds(prev => new Set([...prev, notifId]));
  };

  // Get color scheme based on notification type
  const getNotificationStyle = (type) => {
    switch (type) {
      case 'scores_released':
        return 'from-green-600 to-emerald-600 border-green-400';
      case 'qotw_voting_open':
      case 'qotw_winner':
        return 'from-purple-600 to-pink-600 border-purple-400';
      case 'advantage_purchased':
      case 'advantage_played':
        return 'from-amber-600 to-orange-600 border-amber-400';
      case 'advantage_stolen':
      case 'vote_stolen':
      case 'advantage_used_on_you':
        return 'from-red-600 to-rose-600 border-red-400';
      case 'double_trouble_applied':
        return 'from-yellow-500 to-amber-500 border-yellow-400';
      case 'immunity_idol_applied':
        return 'from-blue-600 to-cyan-600 border-blue-400';
      case 'final_picks_open':
        return 'from-indigo-600 to-purple-600 border-indigo-400';
      case 'new_questionnaire':
        return 'from-teal-600 to-cyan-600 border-teal-400';
      case 'tree_mail':
        return 'from-orange-600 to-red-600 border-orange-400';
      default:
        return 'from-gray-600 to-gray-700 border-gray-400';
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'scores_released':
        return '📊';
      case 'qotw_voting_open':
        return '🗳️';
      case 'qotw_winner':
        return '🏆';
      case 'advantage_purchased':
        return '🛒';
      case 'advantage_played':
        return '🎮';
      case 'advantage_stolen':
      case 'vote_stolen':
        return '🚨';
      case 'advantage_used_on_you':
        return '⚠️';
      case 'double_trouble_applied':
        return '✨';
      case 'immunity_idol_applied':
        return '🛡️';
      case 'final_picks_open':
        return '🎯';
      case 'new_questionnaire':
        return '📝';
      case 'tree_mail':
        return '📬';
      default:
        return '🔔';
    }
  };

  if (unseenNotifications.length === 0) return null;

  return (
    <div className="space-y-3">
      {unseenNotifications.slice(0, 5).map((notif) => (
        <div
          key={notif.id}
          className={`notification-banner bg-gradient-to-r ${getNotificationStyle(notif.type)} p-4 rounded-lg border-2 shadow-lg flex items-center justify-between gap-4`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getNotificationIcon(notif.type)}</span>
            <div>
              <p className="text-white font-semibold">{notif.message}</p>
              <p className="text-white/70 text-xs">
                {new Date(notif.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => dismissNotification(notif.id)}
            className="text-white/80 hover:text-white p-1 hover:bg-white/20 rounded transition"
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
      {unseenNotifications.length > 5 && (
        <p className="text-amber-300 text-center text-sm">
          +{unseenNotifications.length - 5} more notifications (check the bell icon)
        </p>
      )}
    </div>
  );
}

function QuestionnaireView({ currentUser, questionnaires, submissions, setSubmissions, contestants, latePenalties, setLatePenalties, qotWVotes, setQotWVotes, players, guestSafeSet, isGuestMode, playerAdvantages }) {
  const activeQ = questionnaires.find(q => q.status === 'active');
  const mySubmission = activeQ ? submissions.find(s => s.questionnaireId === activeQ.id && s.playerId === currentUser.id) : null;
  const [answers, setAnswers] = useState({});
  const [votingFor, setVotingFor] = useState(null);
  const [viewingArchived, setViewingArchived] = useState(null);

  const isOpen = activeQ && new Date() < new Date(activeQ.deadline) && new Date() < new Date(activeQ.lockedAt);
  const isLocked = activeQ && new Date() >= new Date(activeQ.lockedAt);
  const isLate = activeQ && new Date() > new Date(activeQ.deadline) && new Date() < new Date(activeQ.lockedAt);

  const archivedQuestionnaires = questionnaires.filter(q => q.status === 'archived' && q.scoresReleased);

  // Check if current user's vote was stolen for this questionnaire
  const voteWasStolen = activeQ && playerAdvantages?.some(
    a => a.advantageId === 'vote-steal' &&
         a.used &&
         a.linkedQuestionnaireId === activeQ.id &&
         a.targetPlayerId === currentUser.id
  );

  // Check if current user has an active Extra Vote for this questionnaire
  const hasExtraVote = activeQ && playerAdvantages?.some(
    a => a.advantageId === 'extra-vote' &&
         a.used &&
         a.activated &&
         a.linkedQuestionnaireId === activeQ.id &&
         a.playerId === currentUser.id
  );

  // Count how many votes the user has cast for this questionnaire
  const myVoteCount = activeQ ? qotWVotes.filter(
    v => v.questionnaireId === activeQ.id && v.voterId === currentUser.id
  ).length : 0;

  // Can cast another vote? (1 normally, 2 with Extra Vote)
  const maxVotes = hasExtraVote ? 2 : 1;
  const canVoteAgain = myVoteCount < maxVotes;

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
    await guestSafeSet('submissions', JSON.stringify(updatedSubmissions));

    if (penalty > 0) {
      const updatedPenalties = { ...latePenalties, [currentUser.id]: penalty };
      setLatePenalties(updatedPenalties);
      await guestSafeSet('latePenalties', JSON.stringify(updatedPenalties));
    }

    const demoSuffix = isGuestMode() ? ' (Demo mode - not saved)' : '';
    alert(isLate ? `Submitted! Late penalty applied: -${penalty} points${demoSuffix}` : `Submitted successfully!${demoSuffix}`);
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
    await guestSafeSet('qotWVotes', JSON.stringify(updatedVotes));
    alert(isGuestMode() ? 'Vote submitted! (Demo mode - not saved)' : 'Vote submitted!');
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

  if (votingFor === 'qotw' && activeQ?.qotwVotingOpen && activeQ) {
    // Check if vote was stolen
    if (voteWasStolen) {
      return (
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-red-600">
          <h2 className="text-2xl font-bold text-red-400 mb-4">⭐ Question of the Week Voting</h2>
          <div className="bg-red-900/30 p-6 rounded-lg border border-red-600 text-center">
            <p className="text-red-300 text-xl mb-4">🚫 Your Vote Was Stolen!</p>
            <p className="text-red-200">Another player used the Vote Steal advantage on you. You cannot vote on this week's Question of the Week.</p>
            <p className="text-red-400 text-sm mt-4">The stolen vote was automatically applied to the player who stole it.</p>
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

        {/* Extra Vote indicator */}
        {hasExtraVote && (
          <div className="bg-green-900/30 p-3 rounded-lg border border-green-600 mb-4">
            <p className="text-green-300 font-semibold">🎯 Extra Vote Active! You can cast {maxVotes} votes this week.</p>
            <p className="text-green-400 text-sm">Votes used: {myVoteCount}/{maxVotes}</p>
          </div>
        )}

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
                disabled={!canVoteAgain}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-semibold hover:from-purple-500 hover:to-pink-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!canVoteAgain ? `✓ All Votes Used (${myVoteCount}/${maxVotes})` : 'Vote for This Answer'}
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

                  {question.type === 'cast-dropdown' && (
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

          {mySubmission && activeQ?.qotwVotingOpen && (
            voteWasStolen ? (
              <button
                onClick={() => setVotingFor('qotw')}
                className="w-full mt-4 py-3 bg-gradient-to-r from-red-800 to-red-900 text-red-200 rounded-lg font-semibold cursor-pointer"
              >
                🚫 Your Vote Was Stolen
              </button>
            ) : (
              <button
                onClick={() => setVotingFor('qotw')}
                className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-pink-500 transition"
              >
                {!canVoteAgain
                  ? `✓ All Votes Used (${myVoteCount}/${maxVotes})`
                  : hasExtraVote
                  ? `Vote on QOTW (${myVoteCount}/${maxVotes} votes used)`
                  : 'Vote on Question of the Week'
                }
              </button>
            )
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


// Wordle Game Component
function WordleGame({
  currentUser,
  challenges,
  challengeAttempts,
  players,
  startChallengeAttempt,
  submitChallengeGuess,
  saveChallengeTimeProgress,
  getPlayerAttempt
}) {
  const [currentGuess, setCurrentGuess] = useState('');
  const [attempt, setAttempt] = useState(null);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [displayTime, setDisplayTime] = useState(0);

  const activeChallenge = challenges.find(c => c.status === 'active');
  const isExpired = activeChallenge && new Date() > new Date(activeChallenge.weekEnd);

  // Load existing attempt on mount
  useEffect(() => {
    if (activeChallenge && currentUser) {
      const existingAttempt = getPlayerAttempt(activeChallenge.id, currentUser.id);
      if (existingAttempt) {
        setAttempt(existingAttempt);
        setDisplayTime(existingAttempt.timeSpent);
      }
    }
  }, [activeChallenge?.id, currentUser?.id, challengeAttempts]);

  // Timer display update
  useEffect(() => {
    if (attempt?.status !== 'in_progress' || !lastSaveTime) return;

    const interval = setInterval(() => {
      setDisplayTime(attempt.timeSpent + (Date.now() - lastSaveTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [attempt, lastSaveTime]);

  // Visibility change handler - save progress when user leaves, resume when returning
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (attempt?.status === 'in_progress' && lastSaveTime) {
        if (document.hidden) {
          // User is leaving - save progress
          const elapsed = Date.now() - lastSaveTime;
          await saveChallengeTimeProgress(attempt.id, elapsed);
        }
        // Reset lastSaveTime when tab becomes visible again OR when leaving
        // This ensures timer continues from correct point when returning
        setLastSaveTime(Date.now());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [attempt, lastSaveTime]);

  // Periodic save (every 30 seconds while active)
  useEffect(() => {
    if (attempt?.status !== 'in_progress' || !lastSaveTime) return;

    const interval = setInterval(async () => {
      const elapsed = Date.now() - lastSaveTime;
      await saveChallengeTimeProgress(attempt.id, elapsed);
      setLastSaveTime(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, [attempt, lastSaveTime]);

  // Start playing
  const handleStartPlaying = async () => {
    if (!activeChallenge) return;
    const newAttempt = await startChallengeAttempt(activeChallenge.id);
    setAttempt(newAttempt);
    setLastSaveTime(Date.now());
    setDisplayTime(0);
  };

  // Submit guess
  const handleSubmitGuess = async () => {
    if (!attempt || currentGuess.length !== 5) return;

    const elapsed = lastSaveTime ? Date.now() - lastSaveTime : 0;
    const updatedAttempt = await submitChallengeGuess(attempt.id, currentGuess, elapsed);
    setAttempt(updatedAttempt);
    setCurrentGuess('');
    setLastSaveTime(Date.now());
    if (updatedAttempt) {
      setDisplayTime(updatedAttempt.timeSpent);
    }
  };

  // Handle keyboard input
  const handleKeyPress = (key) => {
    if (attempt?.status !== 'in_progress') return;

    if (key === 'ENTER') {
      if (currentGuess.length === 5) {
        handleSubmitGuess();
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key);
    }
  };

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (attempt?.status !== 'in_progress') return;

      if (e.key === 'Enter') {
        e.preventDefault();
        handleKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKeyPress('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, attempt]);

  // Get letter status for coloring
  const getLetterStatus = (letter, position, word) => {
    if (!activeChallenge) return 'empty';
    const answer = activeChallenge.word;

    if (answer[position] === letter) return 'correct';
    if (answer.includes(letter)) return 'present';
    return 'absent';
  };

  // Get keyboard letter status
  const getKeyboardLetterStatus = (letter) => {
    if (!attempt) return 'unused';

    let status = 'unused';
    for (const guess of attempt.guesses) {
      for (let i = 0; i < 5; i++) {
        if (guess[i] === letter) {
          const letterStatus = getLetterStatus(letter, i, guess);
          if (letterStatus === 'correct') return 'correct';
          if (letterStatus === 'present' && status !== 'correct') status = 'present';
          if (letterStatus === 'absent' && status === 'unused') status = 'absent';
        }
      }
    }
    return status;
  };

  // Format time display
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  // Render game board
  const renderBoard = () => {
    const rows = [];
    for (let i = 0; i < 6; i++) {
      const guess = attempt?.guesses[i] || '';
      const isCurrentRow = attempt?.guesses.length === i;
      const displayGuess = isCurrentRow ? currentGuess : guess;

      rows.push(
        <div key={i} className="flex gap-2 justify-center">
          {[0, 1, 2, 3, 4].map(j => {
            const letter = displayGuess[j] || '';
            let bgClass = 'bg-gray-700 border-gray-600';

            if (guess && !isCurrentRow) {
              const status = getLetterStatus(letter, j, guess);
              if (status === 'correct') bgClass = 'bg-green-600 border-green-500';
              else if (status === 'present') bgClass = 'bg-yellow-600 border-yellow-500';
              else bgClass = 'bg-gray-600 border-gray-500';
            } else if (letter) {
              bgClass = 'bg-gray-600 border-gray-400';
            }

            return (
              <div
                key={j}
                className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold text-white border-2 rounded ${bgClass}`}
              >
                {letter}
              </div>
            );
          })}
        </div>
      );
    }
    return rows;
  };

  // Render keyboard
  const renderKeyboard = () => {
    const rows = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
    ];

    return rows.map((row, i) => (
      <div key={i} className="flex gap-1 justify-center">
        {row.map(key => {
          const displayKey = key === 'DEL' ? 'BACKSPACE' : key;
          const status = key.length === 1 ? getKeyboardLetterStatus(key) : 'unused';
          let bgClass = 'bg-gray-600 hover:bg-gray-500';

          if (status === 'correct') bgClass = 'bg-green-600 hover:bg-green-500';
          else if (status === 'present') bgClass = 'bg-yellow-600 hover:bg-yellow-500';
          else if (status === 'absent') bgClass = 'bg-gray-800 hover:bg-gray-700';

          return (
            <button
              key={key}
              onClick={() => handleKeyPress(displayKey)}
              className={`${bgClass} text-white font-bold rounded py-3 ${
                key.length > 1 ? 'px-2 sm:px-3 text-xs' : 'px-3 sm:px-4 text-sm'
              } transition`}
            >
              {key === 'DEL' ? '⌫' : key}
            </button>
          );
        })}
      </div>
    ));
  };

  // No active challenge
  if (!activeChallenge) {
    const completedChallenges = challenges.filter(c => c.status === 'completed');

    return (
      <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-600">
        <h2 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Survivor Wordle
        </h2>
        <p className="text-amber-200 text-center py-8">
          No active challenge right now. Check back Monday for the next weekly challenge!
        </p>

        {completedChallenges.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg text-amber-300 font-semibold mb-3">Past Challenges</h3>
            <div className="space-y-2">
              {completedChallenges
                .slice(-5)
                .reverse()
                .map(c => {
                  const winner = players.find(p => p.id === c.winnerId);
                  return (
                    <div key={c.id} className="bg-amber-900/30 p-3 rounded border border-amber-600">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold font-mono tracking-widest">{c.word}</span>
                        <span className="text-amber-300 text-sm">
                          {winner ? `Winner: ${winner.name}` : 'No winner'}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Challenge expired but not yet finalized
  if (isExpired && activeChallenge.status === 'active') {
    return (
      <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-600">
        <h2 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Challenge Ended
        </h2>
        <p className="text-amber-200 text-center py-8">
          This week's challenge has ended. Results will be announced soon!
        </p>
      </div>
    );
  }

  // Player hasn't started yet
  if (!attempt) {
    return (
      <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-600">
        <h2 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Survivor Wordle Challenge
        </h2>

        <div className="text-center py-8">
          <div className="mb-6">
            <p className="text-amber-200 text-lg mb-2">
              Guess the 5-letter Survivor-themed word in 6 tries or less!
            </p>
            <div className="flex justify-center gap-2 my-4">
              <div className="w-10 h-10 bg-green-600 rounded flex items-center justify-center text-white font-bold">T</div>
              <div className="w-10 h-10 bg-yellow-600 rounded flex items-center justify-center text-white font-bold">R</div>
              <div className="w-10 h-10 bg-gray-600 rounded flex items-center justify-center text-white font-bold">I</div>
              <div className="w-10 h-10 bg-gray-600 rounded flex items-center justify-center text-white font-bold">B</div>
              <div className="w-10 h-10 bg-green-600 rounded flex items-center justify-center text-white font-bold">E</div>
            </div>
            <p className="text-amber-400 text-sm">
              <span className="text-green-400">Green</span> = correct spot,
              <span className="text-yellow-400 ml-2">Yellow</span> = wrong spot,
              <span className="text-gray-400 ml-2">Gray</span> = not in word
            </p>
          </div>

          <p className="text-amber-300 text-sm mb-6">
            Ends: {new Date(activeChallenge.weekEnd).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </p>

          <button
            onClick={handleStartPlaying}
            className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-bold text-xl hover:from-amber-500 hover:to-orange-500 transition"
          >
            Start Challenge
          </button>

          <p className="text-red-400 text-sm mt-4 font-semibold">
            Warning: You only get ONE attempt! Choose wisely.
          </p>
        </div>
      </div>
    );
  }

  // Game completed (won or lost)
  if (attempt.status !== 'in_progress') {
    const attemptsList = challengeAttempts
      .filter(a => a.challengeId === activeChallenge.id && a.status !== 'in_progress')
      .sort((a, b) => {
        if (a.solved !== b.solved) return b.solved - a.solved;
        if (a.guesses.length !== b.guesses.length) return a.guesses.length - b.guesses.length;
        return a.timeSpent - b.timeSpent;
      });

    return (
      <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-600">
        <h2 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          {attempt.solved ? 'You Got It!' : 'Challenge Complete'}
        </h2>

        <div className="space-y-3 mb-6">
          {renderBoard()}
        </div>

        <div className="text-center py-4">
          {attempt.solved ? (
            <>
              <p className="text-green-400 text-xl font-bold mb-2">
                Solved in {attempt.guesses.length} guess{attempt.guesses.length > 1 ? 'es' : ''}!
              </p>
              <p className="text-amber-300">
                Time: {formatTime(attempt.timeSpent)}
              </p>
            </>
          ) : (
            <>
              <p className="text-red-400 text-xl font-bold mb-2">
                The word was: <span className="font-mono tracking-widest">{activeChallenge.word}</span>
              </p>
              <p className="text-amber-300">Better luck next week!</p>
            </>
          )}
        </div>

        {attemptsList.length > 0 && (
          <div className="mt-6 bg-amber-900/30 p-4 rounded border border-amber-600">
            <h3 className="text-lg text-amber-300 font-semibold mb-3">This Week's Results</h3>
            <div className="space-y-2">
              {attemptsList.map((a, i) => {
                const player = players.find(p => p.id === a.playerId);
                const isYou = a.playerId === currentUser.id;
                return (
                  <div key={a.id} className={`flex justify-between text-sm p-2 rounded ${isYou ? 'bg-amber-800/50' : ''}`}>
                    <span className={`flex items-center gap-2 ${a.solved ? 'text-green-400' : 'text-gray-400'}`}>
                      {i === 0 && a.solved && <Trophy className="w-4 h-4 text-yellow-400" />}
                      {player?.name || 'Unknown'}
                      {isYou && <span className="text-amber-400 text-xs">(You)</span>}
                    </span>
                    <span className="text-amber-300">
                      {a.solved ? `${a.guesses.length} guesses, ${formatTime(a.timeSpent)}` : 'Did not solve'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active game
  return (
    <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-600">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-amber-400 flex items-center gap-2">
          <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
          Survivor Wordle
        </h2>
        <div className="flex items-center gap-2 text-amber-300">
          <Clock className="w-4 h-4" />
          <span className="text-sm sm:text-base">{formatTime(displayTime)}</span>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3 mb-6">
        {renderBoard()}
      </div>

      <div className="space-y-1 sm:space-y-2">
        {renderKeyboard()}
      </div>

      <p className="text-center text-amber-400 text-sm mt-4">
        Guesses remaining: {6 - attempt.guesses.length}
      </p>
    </div>
  );
}
