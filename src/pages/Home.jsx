import React, { useState, useEffect } from 'react';
import client from '../sanity';
import { DocumentTextIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline';
import '../styles/Home.css';

const Home = () => {
  const [stats, setStats] = useState([
    {
      name: 'Total Agenda',
      value: '0',
      icon: DocumentTextIcon,
      change: '0%',
      changeType: 'neutral'
    },
    {
      name: 'Total Galeri',
      value: '0',
      icon: EyeIcon,
      change: '0%',
      changeType: 'neutral'
    },
    {
      name: 'Total Prestasi',
      value: '0',
      icon: ClockIcon,
      change: '0%',
      changeType: 'neutral'
    }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const agendaCount = await client.fetch(`count(*[_type == "agenda"])`);
        const galeriCount = await client.fetch(`count(*[_type == "galeri"])`);
        const prestasiCount = await client.fetch(`count(*[_type == "prestasi"])`);
        
        setStats([
          {
            name: 'Total Agenda',
            value: agendaCount.toString(),
            icon: DocumentTextIcon,
            change: '0%',
            changeType: 'neutral'
          },
          {
            name: 'Total Galeri',
            value: galeriCount.toString(),
            icon: EyeIcon,
            change: '0%',
            changeType: 'neutral'
          },
          {
            name: 'Total Prestasi',
            value: prestasiCount.toString(),
            icon: ClockIcon,
            change: '0%',
            changeType: 'neutral'
          }
        ]);
      } catch (error) {
        console.error('Error mengambil statistik:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="home-container">
      {/* Clean dashboard with only essential stats */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="stat-card">
                <div className="stat-icon-wrapper">
                  <Icon className="stat-icon" />
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stat.value}</h3>
                  <p className="stat-label">{stat.name}</p>
                  <div className={`stat-change ${
                    stat.changeType === 'increase' ? 'positive' : 'negative'
                  }`}>
                    <span className="stat-change-value">{stat.change}</span>
                    <span className="stat-change-period">vs bulan lalu</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
