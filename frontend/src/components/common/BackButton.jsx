import { useNavigate } from 'react-router-dom';

export default function BackButton({ className = '' }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className={[
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
        'bg-white border border-gray-300 text-gray-700',
        'hover:bg-gray-50 hover:border-gray-400',
        'transition-all duration-200 shadow-sm hover:shadow',
        'font-medium text-sm',
        className
      ].join(' ')}
      aria-label="Quay lại"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M10 19l-7-7m0 0l7-7m-7 7h18" 
        />
      </svg>
      <span>Quay lại</span>
    </button>
  );
}


