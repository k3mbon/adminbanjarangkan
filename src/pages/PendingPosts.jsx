import PendingPostsList from '../components/PendingPostsList';
import { ClockIcon } from '@heroicons/react/24/outline';

const PendingPosts = () => {
  return (
    <>
      {/* Page Header */}
      <div className="content-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <ClockIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="page-title">Pending Posts</h1>
            <p className="page-subtitle">Review and manage posts awaiting approval</p>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="content-card full-width">
        <PendingPostsList />
      </div>
    </>
  );
};

export default PendingPosts;