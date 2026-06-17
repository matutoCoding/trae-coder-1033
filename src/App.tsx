import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import EventList from './pages/Events/EventList';
import EventRegister from './pages/Events/EventRegister';
import EventDetail from './pages/Events/EventDetail';
import OilSpreadMonitoring from './pages/Monitoring/OilSpreadMonitoring';
import OceanCondition from './pages/Monitoring/OceanCondition';
import BoomDeployment from './pages/Containment/BoomDeployment';
import SkimmerOperation from './pages/Cleanup/SkimmerOperation';
import DispersantSpray from './pages/Cleanup/DispersantSpray';
import ShorelineCleanup from './pages/Cleanup/ShorelineCleanup';
import VesselScheduling from './pages/Resources/VesselScheduling';
import SensitiveResources from './pages/Ecology/SensitiveResources';
import EcologyAssessmentPage from './pages/Ecology/EcologyAssessment';
import DisposalProgress from './pages/Statistics/DisposalProgress';
import EventSummary from './pages/Statistics/EventSummary';
import Home from './pages/Home';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/home" element={<Home />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/events/register" element={<EventRegister />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/monitoring/oil-spread" element={<OilSpreadMonitoring />} />
          <Route path="/monitoring/ocean-condition" element={<OceanCondition />} />
          <Route path="/containment/boom" element={<BoomDeployment />} />
          <Route path="/cleanup/skimmer" element={<SkimmerOperation />} />
          <Route path="/cleanup/dispersant" element={<DispersantSpray />} />
          <Route path="/cleanup/shoreline" element={<ShorelineCleanup />} />
          <Route path="/resources/vessels" element={<VesselScheduling />} />
          <Route path="/ecology/sensitive-resources" element={<SensitiveResources />} />
          <Route path="/ecology/assessment" element={<EcologyAssessmentPage />} />
          <Route path="/statistics/progress" element={<DisposalProgress />} />
          <Route path="/statistics/summary" element={<EventSummary />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
