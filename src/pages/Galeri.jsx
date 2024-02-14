import React from 'react'
import Sidebar from '../components/Sidebar'
import GalleryForm from '../components/GalleryForm'
import ListAlbumFoto from '../components/ListAlbumFoto'

const Galeri = () => {
  return (
    <div>
        <Sidebar/>
        <GalleryForm/>
        <ListAlbumFoto/>
    </div>
  )
}

export default Galeri