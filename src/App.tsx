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
            <Plus className="w-5 h-5" />
            New
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {groups.length === 0 ? (
          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-3xl p-12 text-center mt-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-purple-400" />
            </div>
            <p className="text-gray-400 text-lg mb-4">No groups yet</p>
            <p className="text-gray-600 text-sm">Create your first group to start making predictions</p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {groups.map((group: any) => (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group)}
                className="backdrop-blur-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 p-6 rounded-3xl hover:border-purple-500/40 active:scale-98 transition-all cursor-pointer shadow-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-xl mb-1">{group.name}</h3>
                    <p className="text-cyan-400/60 text-sm flex items-center gap-2">
                      <Zap className="w-3 h-3" />
                      Code: {group.inviteCode}
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-purple-400" />
                </div>
                
                <button
                  onClick={(e) => handleShareGroup(group, e)}
                  className="w-full mt-3 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 text-cyan-300 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:border-cyan-500/50 active:scale-98 transition-all"
                >
                  {copiedCode === group.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      Code Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Share Invite Code
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// DARK CREATE GROUP
const CreateGroupView = ({ onCreate, onBack }: any) => {
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-purple-500/20 px-4 py-4">
        <button onClick={onBack} className="text-purple-400 font-bold flex items-center gap-2 hover:text-purple-300 transition-colors">
          <ArrowRight className="w-5 h-5 rotate-180" />
          Back
        </button>
      </div>
      
      <div className="max-w-md mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white mb-2">Create Group</h2>
          <p className="text-cyan-400/60">Name your prediction squad</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-purple-300 font-bold mb-3 text-sm uppercase tracking-wide">Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 text-base bg-black/40 border-2 border-purple-500/30 rounded-2xl focus:border-purple-500 focus:outline-none text-white placeholder-gray-600 transition-all"
              placeholder="Weekend Warriors"
              style={{ fontSize: '16px', minHeight: '56px' }}
            />
          </div>

          <button
            onClick={() => name && onCreate(name)}
            disabled={!name}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 active:scale-98 transition-all"
            style={{ minHeight: '56px' }}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

// DARK PREDICTION LIST
const PredictionListView = ({ group, predictions, onSelectPrediction, onCreatePrediction, onBack }: any) => {
  const [copiedPrediction, setCopiedPrediction] = useState<string | null>(null);

  const calculatePoolStats = (commitments: any[]) => {
    const sideA = commitments.filter(c => c.side === 'a').reduce((sum, c) => sum + c.amount, 0);
    const sideB = commitments.filter(c => c.side === 'b').reduce((sum, c) => sum + c.amount, 0);
    return { sideATotal: sideA, sideBTotal: sideB, totalPool: sideA + sideB };
  };

  const handleSharePrediction = (pred: any, e: React.MouseEvent) => {
    e.stopPropagation();
    haptic('light');
    const shareText = `Join my VYRE prediction: "${pred.title}" - ${pred.sideALabel} vs ${pred.sideBLabel}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedPrediction(pred.id);
      setTimeout(() => setCopiedPrediction(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 bg-gradient-to-b from-black via-black/95 to-transparent backdrop-blur-xl border-b border-purple-500/20 px-4 py-6 z-10">
        <button onClick={onBack} className="text-purple-400 font-bold mb-4 flex items-center gap-2 hover:text-purple-300 transition-colors">
          <ArrowRight className="w-5 h-5 rotate-180" />
          Back
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">{group.name}</h1>
            <p className="text-cyan-400/60 text-sm flex items-center gap-2">
              <Flame className="w-3 h-3" />
              Live Predictions
            </p>
          </div>
          <button
            onClick={onCreatePrediction}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-purple-500/50 active:scale-95 transition-all"
            style={{ minHeight: '48px' }}
          >
            <Plus className="w-5 h-5" />
            New
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {predictions.length === 0 ? (
          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-3xl p-12 text-center mt-8">
            <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-400">No predictions yet</p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {predictions.map((pred: any) => {
              const stats = calculatePoolStats(pred.commitments);
              return (
                <div
                  key={pred.id}
                  className="backdrop-blur-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 p-6 rounded-3xl hover:border-purple-500/40 transition-all"
                >
                  <div onClick={() => onSelectPrediction(pred)} className="cursor-pointer">
                    <h3 className="font-bold text-white text-lg mb-4">{pred.title}</h3>
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-center flex-1">
                        <div className="text-purple-400 text-sm mb-1">{pred.sideALabel}</div>
                        <div className="text-2xl font-black text-white">${stats.sideATotal}</div>
                      </div>
                      <div className="text-cyan-400 text-xs">VS</div>
                      <div className="text-center flex-1">
                        <div className="text-cyan-400 text-sm mb-1">{pred.sideBLabel}</div>
                        <div className="text-2xl font-black text-white">${stats.sideBTotal}</div>
                      </div>
                    </div>
                    <div className="text-center mb-4">
                      <span className="text-xs text-gray-500">Total Pool: </span>
                      <span className="text-sm font-bold text-purple-400">${stats.totalPool}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => handleSharePrediction(pred, e)}
                    className="w-full bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 text-cyan-300 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:border-cyan-500/50 active:scale-98 transition-all"
                  >
                    {copiedPrediction === pred.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        Share Prediction
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// DARK CREATE PREDICTION
const CreatePredictionView = ({ onCreate, onBack }: any) => {
  const [title, setTitle] = useState('');
  const [sideALabel, setSideALabel] = useState('Yes');
  const [sideBLabel, setSideBLabel] = useState('No');
  const [initialSide, setInitialSide] = useState('a');
  const [initialAmount, setInitialAmount] = useState('');

  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-purple-500/20 px-4 py-4">
        <button onClick={onBack} className="text-purple-400 font-bold flex items-center gap-2">
          <ArrowRight className="w-5 h-5 rotate-180" />
          Back
        </button>
      </div>
      
      <div className="max-w-md mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white mb-2">New Prediction</h2>
          <p className="text-cyan-400/60">Set the terms & make your call</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-purple-300 font-bold mb-3 text-sm uppercase tracking-wide">Prediction</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 text-base bg-black/40 border-2 border-purple-500/30 rounded-2xl focus:border-purple-500 focus:outline-none text-white placeholder-gray-600"
              placeholder="Chiefs win the Super Bowl"
              style={{ fontSize: '16px', minHeight: '56px' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-300 font-bold mb-3 text-sm uppercase tracking-wide">Side A</label>
              <input
                type="text"
                value={sideALabel}
                onChange={(e) => setSideALabel(e.target.value)}
                className="w-full px-4 py-3 text-base bg-black/40 border-2 border-purple-500/30 rounded-2xl focus:border-purple-500 focus:outline-none text-white"
                style={{ fontSize: '16px' }}
              />
            </div>
            <div>
              <label className="block text-cyan-300 font-bold mb-3 text-sm uppercase tracking-wide">Side B</label>
              <input
                type="text"
                value={sideBLabel}
                onChange={(e) => setSideBLabel(e.target.value)}
                className="w-full px-4 py-3 text-base bg-black/40 border-2 border-cyan-500/30 rounded-2xl focus:border-cyan-500 focus:outline-none text-white"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-purple-300 font-bold mb-3 text-sm uppercase tracking-wide">Your Pick</label>
            <select
              value={initialSide}
              onChange={(e) => setInitialSide(e.target.value)}
              className="w-full px-5 py-4 text-base bg-black/40 border-2 border-purple-500/30 rounded-2xl focus:border-purple-500 focus:outline-none text-white"
              style={{ fontSize: '16px', minHeight: '56px' }}
            >
              <option value="a">{sideALabel}</option>
              <option value="b">{sideBLabel}</option>
            </select>
          </div>

          <div>
            <label className="block text-purple-300 font-bold mb-3 text-sm uppercase tracking-wide">Your Amount</label>
            <div className="relative">
              <span className="absolute left-5 top-5 text-gray-500 text-xl">$</span>
              <input
                type="number"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                className="w-full pl-12 pr-5 py-4 text-base bg-black/40 border-2 border-purple-500/30 rounded-2xl focus:border-purple-500 focus:outline-none text-white placeholder-gray-600"
                placeholder="100"
                style={{ fontSize: '16px', minHeight: '56px' }}
              />
            </div>
          </div>

          <button
            onClick={() => title && initialAmount && onCreate({ title, sideALabel, sideBLabel, initialSide, initialAmount: parseFloat(initialAmount) })}
            disabled={!title || !initialAmount}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 shadow-lg shadow-purple-500/50 active:scale-98 transition-all"
            style={{ minHeight: '56px' }}
          >
            Create Prediction
          </button>
        </div>
      </div>
    </div>
  );
};

// DARK SETTLEMENT
const SettlementView = ({ prediction, onBack }: any) => {
  const { winners, losers } = prediction.settlement;

  const handlePayment = (type: string, user: any, amount: number) => {
    haptic('medium');
    openPaymentApp(type, user.venmoUsername || user.cashAppTag, amount, `${prediction.title} settlement`);
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-purple-500/20 px-4 py-4 z-10">
        <button onClick={onBack} className="text-purple-400 font-bold flex items-center gap-2">
          <ArrowRight className="w-5 h-5 rotate-180" />
          Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <div className="backdrop-blur-xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-3xl p-6 mb-6 mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Resolved</h2>
              <p className="text-green-400/60 text-sm">Outcome confirmed</p>
            </div>
          </div>
          <p className="text-gray-300">{prediction.title}</p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-black text-green-400 mb-4 flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5" />
              Winners
            </h3>
            <div className="space-y-4">
              {winners.map((winner: any) => (
                <div
                  key={winner.userId}
                  className="backdrop-blur-xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 p-6 rounded-3xl"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-white text-lg">{winner.userName}</p>
                      <p className="text-green-400/60 text-sm">Bet ${winner.amount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 text-2xl font-black">${winner.payout.toFixed(2)}</p>
                      <p className="text-green-400/60 text-sm">+${winner.profit.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-black text-red-400 mb-4 flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5" />
              Losers - Pay Up
            </h3>
            <div className="space-y-4">
              {losers.map((loser: any) => (
                <div
                  key={loser.userId}
                  className="backdrop-blur-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 p-6 rounded-3xl"
                >
                  <div className="mb-4">
                    <p className="font-bold text-white text-lg mb-1">{loser.userName}</p>
                    <p className="text-red-400 text-2xl font-black">Owes ${loser.loss.toFixed(2)}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wide">Quick Pay</p>
                    
                    {loser.venmoUsername && (
                      <button
                        onClick={() => handlePayment('venmo', loser, loser.loss)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-98 transition-all"
                        style={{ minHeight: '56px' }}
                      >
                        <DollarSign className="w-5 h-5" />
                        Pay via Venmo
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}

                    {loser.cashAppTag && (
                      <button
                        onClick={() => handlePayment('cashapp', loser, loser.loss)}
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-98 transition-all"
                        style={{ minHeight: '56px' }}
                      >
                        <DollarSign className="w-5 h-5" />
                        Pay via Cash App
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handlePayment('zelle', loser, loser.loss)}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-98 transition-all"
                      style={{ minHeight: '56px' }}
                    >
                      <Copy className="w-5 h-5" />
                      Copy Zelle Info
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionApp;
