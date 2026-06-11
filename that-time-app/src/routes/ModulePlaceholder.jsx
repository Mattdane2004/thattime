import { useNavigate } from 'react-router-dom';
import ScreenHeader from '../components/ScreenHeader';

export default function ModulePlaceholder({ title, milestone }) {
  const navigate = useNavigate();
  return (
    <>
      <ScreenHeader title="" onBack={() => navigate('/service')} />
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div className="space-y-2">
          <div className="text-[20px] font-semibold tracking-tight">{title}</div>
          <div className="text-[14px] text-gray-500">Coming in {milestone}.</div>
        </div>
      </div>
    </>
  );
}
