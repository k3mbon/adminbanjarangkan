import React, { useState } from 'react';
import PostsList from '../components/PostsList';
import { PlusIcon, FunnelIcon, MagnifyingGlassIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Posts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  return (
    <>
      {/* Page Header */}
      <div className="content-header">
        <div className="flex items-center gap-4">
          <div className="page-icon">
            <DocumentTextIcon className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="page-title">Blog Posts</h1>
            <p className="page-subtitle">Manage your blog content</p>
          </div>
        </div>
        
        <Link 
          to="/create" 
          className="btn btn-primary flex items-center gap-3 px-6 py-3"
        >
          <PlusIcon className="w-5 h-5" />
          Create New Post
        </Link>
      </div>
      
      {/* Content */}
      <div className="content-card full-width">
        <PostsList />
      </div>
    </>
  );
};

export default Posts;
