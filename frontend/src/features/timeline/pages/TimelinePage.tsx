import { useTimeline } from '../hooks/useTimeline.js';
import TimelineList from '../components/TimelineList.js';

function TimelinePage() {
  const { tweets, isLoading, error } = useTimeline(1, 20);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500" data-testid="loading-state">
        Loading timeline...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500" data-testid="error-state">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="border-b border-gray-200 p-4 text-xl font-bold">Timeline</h1>
      <TimelineList tweets={tweets} />
    </div>
  );
}

export default TimelinePage;
