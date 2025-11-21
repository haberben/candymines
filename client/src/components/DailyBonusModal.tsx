import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Gift } from 'lucide-react';

interface DailyBonusModalProps {
  onClaim: () => void;
  amount: number;
  onClose: () => void;
}

export default function DailyBonusModal({ onClaim, amount, onClose }: DailyBonusModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="p-8 max-w-md mx-4 bg-gradient-to-br from-purple-900/90 to-pink-900/90 border-2 border-yellow-400/50">
        <div className="text-center">
          <div className="mb-6">
            <Gift className="w-20 h-20 text-yellow-400 mx-auto animate-bounce" />
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4">
            Günlük Bonus!
          </h2>
          
          <p className="text-white/80 text-lg mb-6">
            Bugünün bonusunu almaya hak kazandın!
          </p>
          
          <div className="bg-yellow-400/20 border-2 border-yellow-400 rounded-xl p-6 mb-6">
            <div className="text-yellow-400 text-5xl font-bold">
              +{amount} 🪙
            </div>
          </div>
          
          <Button
            onClick={onClaim}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-xl py-6"
            size="lg"
          >
            Bonusu Al!
          </Button>
        </div>
      </Card>
    </div>
  );
}
