'use client';

import { CertificationRecord } from '@/types/training';

interface CertificationBadgeProps {
  certification: CertificationRecord;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onClick?: () => void;
}

const badgeConfig = {
  platinum: {
    gradient: 'from-slate-300 via-slate-100 to-slate-400',
    glow: 'shadow-slate-300/50',
    icon: '💎',
    label: 'Platinum',
  },
  gold: {
    gradient: 'from-yellow-400 via-yellow-200 to-yellow-500',
    glow: 'shadow-yellow-400/50',
    icon: '🏆',
    label: 'Gold',
  },
  silver: {
    gradient: 'from-gray-300 via-gray-100 to-gray-400',
    glow: 'shadow-gray-300/50',
    icon: '🥈',
    label: 'Silver',
  },
  bronze: {
    gradient: 'from-orange-400 via-orange-200 to-orange-500',
    glow: 'shadow-orange-400/50',
    icon: '🥉',
    label: 'Bronze',
  },
};

const sizeConfig = {
  sm: {
    container: 'w-10 h-10',
    icon: 'text-sm',
    ring: 'w-8 h-8',
  },
  md: {
    container: 'w-16 h-16',
    icon: 'text-xl',
    ring: 'w-14 h-14',
  },
  lg: {
    container: 'w-24 h-24',
    icon: 'text-3xl',
    ring: 'w-20 h-20',
  },
};

export default function CertificationBadge({ 
  certification, 
  size = 'md',
  showDetails = false,
  onClick 
}: CertificationBadgeProps) {
  const badge = badgeConfig[certification.badgeType];
  const sizeClass = sizeConfig[size];

  const isExpired = certification.expiresAt && new Date(certification.expiresAt) < new Date();
  const expiresIn = certification.expiresAt 
    ? Math.ceil((new Date(certification.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div 
      className={`inline-flex flex-col items-center ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`relative ${onClick ? 'hover:scale-110 transition-transform' : ''}`}>
        {/* Outer Ring */}
        <div className={`${sizeClass.container} rounded-full bg-gradient-to-br ${badge.gradient} flex items-center justify-center shadow-lg ${badge.glow} ${
          isExpired ? 'opacity-50 grayscale' : ''
        }`}>
          {/* Inner Ring */}
          <div className={`${sizeClass.ring} rounded-full bg-[var(--bg-primary)] flex items-center justify-center`}>
            <span className={sizeClass.icon}>{badge.icon}</span>
          </div>
        </div>
        
        {/* Checkmark Badge */}
        {!isExpired && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent-lime)] flex items-center justify-center">
            <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {/* Expired Badge */}
        {isExpired && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--auto-none)] flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-2 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">{badge.label}</p>
          <p className="text-xs text-[var(--text-tertiary)]">
            {certification.quizScore}% • {new Date(certification.certifiedAt).toLocaleDateString()}
          </p>
          {expiresIn !== null && expiresIn > 0 && expiresIn < 30 && (
            <p className="text-xs text-[var(--accent-orange)]">
              Expires in {expiresIn} day{expiresIn !== 1 ? 's' : ''}
            </p>
          )}
          {isExpired && (
            <p className="text-xs text-[var(--auto-none)]">Expired</p>
          )}
        </div>
      )}
    </div>
  );
}

// Mini inline badge for showing next to process title
interface InlineBadgeProps {
  certified: boolean;
  badgeType?: 'bronze' | 'silver' | 'gold' | 'platinum';
  onClick?: () => void;
}

export function InlineCertificationBadge({ certified, badgeType = 'bronze', onClick }: InlineBadgeProps) {
  const badge = badgeConfig[badgeType];

  if (!certified) {
    return (
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] text-xs hover:bg-[var(--bg-elevated)] transition-colors"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Not Certified
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r ${badge.gradient} text-black text-xs font-medium hover:opacity-80 transition-opacity`}
    >
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
    </button>
  );
}
