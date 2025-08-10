import React from 'react'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Analytics() {
  return (
    <div className="app-layout">
      <Header 
        showTitle={true} 
        variant="analytics"
      />
      
      <main className="app-main">
        <AnalyticsDashboard />
      </main>
      
      <Footer 
        showDetails={false}
        variant="default"
      />
    </div>
  )
}