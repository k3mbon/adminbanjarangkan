import React from 'react'
import PrestasiForm from '../components/PrestasiForm'
import Sidebar from '../components/Sidebar'
import ListPrestasi from '../components/ListPrestasi'

const Prestasi = () => {
  return (
    <div>
        <Sidebar/>
        <PrestasiForm/>
        <ListPrestasi/>
    </div>
  )
}

export default Prestasi