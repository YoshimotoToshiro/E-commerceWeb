import { useNavigate } from 'react-router-dom';

export default function BackButton({ className = '' }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className={['inline-flex items-center gap-2 text-primary hover:underline', className].join(' ')}
      aria-label="Quay lại"
    >
      ← Quay lại
    </button>
  );
}


