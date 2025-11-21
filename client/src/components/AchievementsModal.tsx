import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Achievement } from '@/types/slotGame';
import { Trophy, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AchievementsModalProps {
  open: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export default function AchievementsModal({ open, onClose, achievements }: AchievementsModalProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionRate = (unlockedCount / totalCount) * 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-purple-900/95 to-pink-900/95 border-purple-500/50 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Başarılar
          </DialogTitle>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Tamamlanma</span>
              <span className="font-bold">{unlockedCount}/{totalCount} ({completionRate.toFixed(0)}%)</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                  : 'bg-white/5 border-white/10 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`text-4xl ${achievement.unlocked ? 'animate-bounce' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-lg">{achievement.title}</h4>
                    {!achievement.unlocked && <Lock className="w-4 h-4 text-white/50" />}
                  </div>
                  <p className="text-sm text-white/70 mb-2">{achievement.description}</p>
                  
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-yellow-300">
                      ✓ {new Date(achievement.unlockedAt).toLocaleDateString('tr-TR')}
                    </p>
                  )}

                  {!achievement.unlocked && achievement.progress !== undefined && achievement.target && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>İlerleme</span>
                        <span>{achievement.progress}/{achievement.target}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.target) * 100} 
                        className="h-1.5"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
