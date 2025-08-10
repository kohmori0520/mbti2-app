import React from 'react'
import CategoryAnalysis from '../components/CategoryAnalysis'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function CategoryAnalysisPage() {
  return (
    <div className="app-layout">
      <Header 
        showTitle={true} 
        variant="analysis"
      />
      
      <main className="app-main">
        <CategoryAnalysis />
      </main>
      
      <Footer 
        showDetails={false}
        variant="default"
      />
    </div>
  )
}