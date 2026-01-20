import React, { useState, useEffect } from 'react';
import {
  Mail,
  Users,
  Plus,
  TrendingUp,
  DollarSign,
  Check,
  X,
  ExternalLink,
  Copy,
  AlertTriangle,
  Zap,
  ArrowRight,
  Flame,
} from 'lucide-react';

// DARK VIBRANT NEON UI - Action Network Inspired

const DEMO_USER = { id: '1', email: 'demo@example.com', name: 'Demo User' };

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);

const haptic = (type = 'light') => {
  if (window.navigator.vibrate) {
    const patterns = { light: [10], medium: [20], heavy: [30] };
    window.navigator.vibrate(patterns[type] || [10]);
  }
};

const openPaymentApp = (type: string, username: string, amount: number, note: string) => {
  if (type === 'venmo') {
    const deepLink = `venmo://paycharge?txn=pay&recipients=${username}&amount=${amount}&note=${encodeURIComponent(note)}`;
    const webFallback = `https://venmo.com/${username}`;
    window.location.href = deepLink;
    setTimeout(() => {
      if (document.hidden === false) window.location.href = webFallback;
    }, 1500);
  }
  
  if (type === 'cashapp') {
    const cleanTag = username.replace('$', '');
    const deepLink = `cashapp://cash.app/$${cleanTag}/${amount}`;
    const webFallback = `https://cash.app/$${cleanTag}/${amount}`;
    window.location.href = deepLink;
    setTimeout(() => {
      if (document.hidden === false) window.location.href = webFallback;
    }, 1500);
  }
  
  if (type === 'zelle') {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(username);
      alert(`Zelle email copied!\n${username}\n\nOpen your banking app to send $${amount}`);
    }
  }
};

const PredictionApp = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<any>(null);

  const [isInstalled, setIsInstalled] = useState(false);
  
  useEffect(() => {
    setIsInstalled(
      window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
    );
  }, []);

  const handleLogin = (phone: string) => {
    haptic('medium');
    setUser(DEMO_USER);
    setCurrentView('groups');
  };

  const handleCreateGroup = (name: string) => {
    haptic('medium');
    const newGroup = {
      id: Date.now().toString(),
      name,
      inviteCode: generateInviteCode(),
      members: [DEMO_USER],
    };
    setGroups([...groups, newGroup]);
    setCurrentView('groups');
  };

  const handleCreatePrediction = (predictionData: any) => {
    haptic('heavy');
    const newPrediction = {
      id: Date.now().toString(),
      groupId: selectedGroup.id,
      ...predictionData,
      status: 'open',
      commitments: [{
        userId: DEMO_USER.id,
        userName: DEMO_USER.name,
        side: predictionData.initialSide,
        amount: predictionData.initialAmount,
        venmoUsername: 'demo-user',
        cashAppTag: '$demouser',
      }],
      confirmations: [],
    };
    setPredictions([...predictions, newPrediction]);
    setCurrentView('prediction');
    setSelectedPrediction(newPrediction);
  };

  const handleJoinPrediction = (side: string, amount: number) => {
    haptic('medium');
    const updated = {
      ...selectedPrediction,
      commitments: [...selectedPrediction.commitments, {
        userId: 'friend-' + Date.now(),
        userName: 'Friend User',
        side,
        amount: parseFloat(amount as any),
        venmoUsername: 'friend-user',
        cashAppTag: '$frienduser',
      }],
    };
    setSelectedPrediction(updated);
    setPredictions(predictions.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleConfirmOutcome = (outcome: string) => {
    haptic('heavy');
    const settlement = calculateSettlement(selectedPrediction, outcome);
    setSelectedPrediction({
      ...selectedPrediction,
      status: 'resolved',
      resolution: outcome,
      settlement,
    });
    setCurrentView('settle');
  };

  const calculatePoolStats = (commitments: any[]) => {
    const sideA = commitments.filter((c) => c.side === 'a').reduce((sum, c) => sum + c.amount, 0);
    const sideB = commitments.filter((c) => c.side === 'b').reduce((sum, c) => sum + c.amount, 0);
    const total = sideA + sideB;
    
    return {
      sideATotal: sideA,
      sideBTotal: sideB,
      totalPool: total,
      sideAProbability: total > 0 ? ((sideA / total) * 100).toFixed(1) : 0,
      sideBProbability: total > 0 ? ((sideB / total) * 100).toFixed(1) : 0,
    };
  };

  const calculateSettlement = (prediction: any, winningSide: string) => {
    const stats = calculatePoolStats(prediction.commitments);
    const sideTotal = winningSide === 'a' ? stats.sideATotal : stats.sideBTotal;

    const winners = prediction.commitments
      .filter((c: any) => c.side === winningSide)
      .map((c: any) => ({
        ...c,
        payout: (c.amount / sideTotal) * stats.totalPool,
        profit: (c.amount / sideTotal) * stats.totalPool - c.amount,
      }));

    const losers = prediction.commitments
      .filter((c: any) => c.side !== winningSide)
      .map((c: any) => ({ ...c, loss: c.amount }));

    return { winners, losers };
  };

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  if (currentView === 'login') {
    return <LoginView onLogin={handleLogin} isInstalled={isInstalled} />;
  }

  if (currentView === 'groups') {
    return (
      <GroupsView 
        groups={groups} 
        onSelectGroup={(g: any) => {
          haptic('light');
          setSelectedGroup(g);
          setCurrentView('prediction');
        }}
        onCreateGroup={() => {
          haptic('light');
          setCurrentView('createGroup');
        }}
      />
    );
  }

  if (currentView === 'createGroup') {
    return <CreateGroupView onCreate={handleCreateGroup} onBack={() => setCurrentView('groups')} />;
  }

  if (currentView === 'prediction') {
    const groupPredictions = predictions.filter((p) => p.groupId === selectedGroup?.id);
    return (
      <PredictionListView
        group={selectedGroup}
        predictions={groupPredictions}
        onSelectPrediction={(p: any) => {
          haptic('light');
          setSelectedPrediction(p);
        }}
        onCreatePrediction={() => setCurrentView('createPrediction')}
        onBack={() => setCurrentView('groups')}
      />
    );
  }

  if (currentView === 'createPrediction') {
    return (
      <CreatePredictionView
        onCreate={handleCreatePrediction}
        onBack={() => setCurrentView('prediction')}
      />
    );
  }

  if (currentView === 'settle') {
    return (
      <SettlementView
        prediction={selectedPrediction}
        onBack={() => setCurrentView('prediction')}
      />
    );
  }

  return <div className="p-4">Loading...</div>;
};

// DARK NEON LOGIN
const LoginView = ({ onLogin, isInstalled }: any) => {
  const [phone, setPhone] = useState('');

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      <div className="relative z-10 w-full max-w-md">
        {!isInstalled && isIOS() && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl backdrop-blur-xl">
            <p className="font-bold text-purple-300 mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Install for best experience
            </p>
            <p className="text-cyan-300/80 text-xs">
              Tap Share → Add to Home Screen
            </p>
          </div>
        )}

        <div className="text-center mb-8">
          <img
            src="https://i.imgur.com/S3VZl4y.png"
            alt="VYRE Logo"
            className="w-64 h-64 mx-auto mb-6 drop-shadow-2xl"
            style={{filter: 'drop-shadow(0 0 40px rgba(168, 85, 247, 0.6))'}}
          />
          <h1 className="text-7xl font-black mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            VYRE
          </h1>
          <p className="text-cyan-300/60 text-sm tracking-wide">Private predictions • Zero fees • Pure competition</p>
        </div>

        <div className="space-y-4 backdrop-blur-xl bg-white/5 p-6 rounded-3xl border border-white/10 shadow-2xl">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-5 py-4 text-base bg-black/40 border-2 border-purple-500/30 rounded-2xl focus:border-purple-500 focus:outline-none text-white placeholder-gray-500 transition-all"
            placeholder="Enter your phone number"
            style={{ fontSize: '16px' }}
          />

          <button
            onClick={() => onLogin(phone)}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-purple-500 hover:to-cyan-500 transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 active:scale-98"
            style={{ minHeight: '56px' }}
          >
            <Zap className="w-5 h-5" />
            Authenticate
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-xs text-gray-500 text-center pt-2">
            We'll send a 6-digit code to your phone
          </p>
        </div>
      </div>
    </div>
  );
};

// DARK GROUPS VIEW
const GroupsView = ({ groups, onSelectGroup, onCreateGroup }: any) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleShareGroup = (group: any, e: React.MouseEvent) => {
    e.stopPropagation();
    haptic('light');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(group.inviteCode);
      setCopiedCode(group.id);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 bg-gradient-to-b from-black via-black/95 to-transparent backdrop-blur-xl border-b border-purple-500/20 px-4 py-6 z-10">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">Your Groups</h1>
            <p className="text-cyan-400/60 text-sm">Create • Join • Compete</p>
          </div>
          <button
            onClick={onCreateGroup}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 active:scale-95 transition-all"
            style={{ minHeight: '48px' }}
          >
            <Plus className="w-5
