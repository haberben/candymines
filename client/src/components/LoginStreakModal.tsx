import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flame, TrendingUp, Gift } from 'lucide-react';
import { COIN_IMAGE } from '@/types/slotGame';

interface LoginStreakModalProps {
  open: boolean;
  onClose: () => void;
  streakDay: number;
  bonus: number;
  streakReset: boolean;
}

export default function LoginStreakModal({ open, onClose, streakDay, bonus, streakReset }: LoginStreakModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 border-2 border-yellow-500/50 text-white max-w-md">
        <div className="text-center py-6">
          {streakReset ? (
            <>
              <div className="mb-4">
                <Flame className="w-20 h-20 mx-auto text-gray-400" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Streak Sıfırlandı!</h2>
              <p className="text-white/70 mb-4">
                Bir gün ara verdin, streak başa döndü.
              </p>
            </>
          ) : null}

          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Flame className="w-16 h-16 text-orange-500 animate-pulse" />
              <div>
                <p className="text-white/70 text-sm">Giriş Streak'i</p>
                <p className="text-5xl font-bold text-yellow-400">{streakDay}</p>
                <p className="text-white/70 text-sm">Gün</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Gift className="w-8 h-8 text-green-400" />
              <p className="text-xl font-bold">Günlük Bonus</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <img src={COIN_IMAGE} alt="Coin" className="w-12 h-12" />
              <p className="text-4xl font-bold text-yellow-400">+{bonus.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <p className="text-sm font-bold">Streak Bonusları</p>
            </div>
            <div className="grid grid-cols-5 gap-2 text-xs">
              {[1, 2, 3, 4, 5].map(day => (
                <div
                  key={day}
                  className={`p-2 rounded ${
                    day <= streakDay
                      ? 'bg-green-600/50 border border-green-400'
                      : 'bg-white/5 border border-white/20'
                  }`}
                >
                  <div className="font-bold">{day}. Gün</div>
                  <div className="text-yellow-400">{(day * 1000).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <p className="text-white/50 text-xs mt-2">Her gün giriş yap, bonusun artsın!</p>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6"
          >
            Harika! 🎉
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
