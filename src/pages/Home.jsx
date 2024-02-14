import React from 'react'
import Sidebar from '../components/Sidebar'
import BlogPosts from './BlogPosts'
import DocumentList from '../components/DocumentList'

const Home = () => {
  return (
    <div className="home-container">
        <Sidebar/>
        <BlogPosts/>
        <DocumentList/>
    </div>
  )
}

export default Home