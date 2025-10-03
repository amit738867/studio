import Image from 'next/image';
import { Award } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative w-8 h-8">
        <Award className="w-8 h-8 text-blue-400" />
      </div>
      <span className="text-lg font-semibold text-white">Pramaan</span>
    </div>
  );
}