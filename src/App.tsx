import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import TodayPage from '@/pages/TodayPage'
import CasesPage from '@/pages/CasesPage'
import CaseDetailPage from '@/pages/CaseDetailPage'
import StatsPage from '@/pages/StatsPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<TodayPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}
