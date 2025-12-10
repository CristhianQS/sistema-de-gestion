import React from 'react';

interface ReviewIndicatorProps {
  reviewed: boolean;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ReviewIndicator: React.FC<ReviewIndicatorProps> = ({
  reviewed,
  reviewedAt,
  reviewedBy,
  showTooltip = true,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  if (reviewed) {
    // Campanita verde (revisado)
    return (
      <div
        className="relative group"
        title={
          showTooltip
            ? `Revisado ${reviewedAt ? `el ${formatDate(reviewedAt)}` : ''}${reviewedBy ? ` por ${reviewedBy}` : ''}`
            : undefined
        }
      >
        <svg
          className={`${sizeClasses[size]} text-green-600`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          {/* Checkmark */}
          <circle cx="14" cy="6" r="4" fill="white" />
          <path
            d="M12 6l1.5 1.5L16 5"
            stroke="green"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>

        {/* Tooltip al hacer hover */}
        {showTooltip && (reviewedAt || reviewedBy) && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            <div className="font-semibold">✅ Revisado</div>
            {reviewedAt && <div className="text-gray-300">📅 {formatDate(reviewedAt)}</div>}
            {reviewedBy && <div className="text-gray-300">👤 {reviewedBy}</div>}
            {/* Flecha */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Campanita roja con animación (no revisado)
  return (
    <div
      className="relative group"
      title={showTooltip ? 'Pendiente de revisar' : undefined}
    >
      <svg
        className={`${sizeClasses[size]} text-red-600 animate-pulse`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        {/* Badge de alerta */}
        <circle cx="15" cy="5" r="3" fill="#DC2626" />
        <text
          x="15"
          y="7"
          textAnchor="middle"
          fill="white"
          fontSize="6"
          fontWeight="bold"
        >
          !
        </text>
      </svg>

      {/* Tooltip al hacer hover */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          <div className="font-semibold">🔔 Pendiente de revisar</div>
          <div className="text-gray-300 text-xs mt-1">Click para marcar como revisado</div>
          {/* Flecha */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewIndicator;
