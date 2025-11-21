import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { COIN_IMAGE } from '@/types/slotGame';
import { LogOut, User, Trophy, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function UserProfileButton() {
  const { userData, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!userData) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="text-left hidden md:block">
          <p className="text-white font-semibold text-sm">{userData.username}</p>
          <div className="flex items-center gap-1">
            <img src={COIN_IMAGE} alt="Coin" className="w-4 h-4" />
            <span className="text-yellow-400 text-xs font-bold">{userData.balance.toLocaleString()}</span>
          </div>
        </div>
      </button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-sm border-white/20 p-4 z-50">
          <div className="space-y-4">
            {/* User Info */}
            <div className="border-b border-white/20 pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold">{userData.username}</p>
                  <p className="text-white/50 text-xs">{userData.email}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Bakiye</span>
                <div className="flex items-center gap-2">
                  <img src={COIN_IMAGE} alt="Coin" className="w-5 h-5" />
                  <span className="text-yellow-400 font-bold">{userData.balance.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  Toplam Oyun
                </span>
                <span className="text-white font-semibold">{userData.stats.gamesPlayed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">En Yüksek Kazanç</span>
                <span className="text-green-400 font-semibold">{userData.stats.highestWin.toLocaleString()}</span>
              </div>
            </div>

            {/* Role Badge */}
            {userData.role === 'admin' && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg p-2 text-center">
                <span className="text-yellow-400 font-bold text-sm">👑 Admin</span>
              </div>
            )}

            {/* Profile Edit Button */}
            <button
              onClick={() => {
                window.location.href = '/profile';
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Profili Düzenle
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
