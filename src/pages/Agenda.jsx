import React from 'react'
import ReminderForm from '../components/ReminderForm'
import Sidebar from '../components/Sidebar'
import ReminderList from '../components/ReminderList'

const Agenda = () => {
  return (
    <div>
        <Sidebar/>
        <ReminderForm/>
        <ReminderList/>
    </div>
  )
}

export default Agenda