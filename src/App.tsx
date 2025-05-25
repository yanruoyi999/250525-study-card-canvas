import React from 'react'
import SmartForm from './components/SmartForm'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <SmartForm />
      <Toaster />
    </div>
  )
}

export default App
