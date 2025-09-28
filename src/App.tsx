import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Toaster } from '@/components/ui/sonner'
import { DashboardPage } from '@/pages/DashboardPage'
import { MineralsPage } from '@/pages/MineralsPage'
import { TagsPage } from '@/pages/TagsPage'
import { MineralForm } from '@/components/minerals/MineralForm'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/minerals" element={<MineralsPage />} />
            <Route path="/minerals/:id/edit" element={<MineralForm />} />
            <Route path="/minerals/new" element={<MineralForm />} />
            <Route path="/tags" element={<TagsPage />} />
          </Routes>
        </main>
        <Toaster richColors />
      </div>
    </Router>
  )
}

export default App