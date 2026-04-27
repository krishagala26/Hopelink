import { useState } from 'react';
import SurveyForm from './components/SurveyForm';
import HeatmapDashboard from './components/HeatmapDashboard';
import VolunteerMatching from './components/VolunteerMatching';
import TaskTracker from './components/TaskTracker';
import { HeartHandshake, FileText, Map, Users, CheckSquare } from 'lucide-react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('survey');

  const renderTab = () => {
    switch (activeTab) {
      case 'survey': return <SurveyForm />;
      case 'dashboard': return <HeatmapDashboard />;
      case 'matching': return <VolunteerMatching setActiveTab={setActiveTab} />;
      case 'tasks': return <TaskTracker />;
      default: return <SurveyForm />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <HeartHandshake size={32} className="logo-icon" />
          <h1>HopeLink</h1>
        </div>
        <p className="tagline">AI-Powered Volunteer Coordination</p>
      </header>

      <nav className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'survey' ? 'active' : ''}`}
          onClick={() => setActiveTab('survey')}
        >
          <FileText size={18} />
          Report Need
        </button>
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Map size={18} />
          Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'matching' ? 'active' : ''}`}
          onClick={() => setActiveTab('matching')}
        >
          <Users size={18} />
          AI Matching
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <CheckSquare size={18} />
          Tasks
        </button>
      </nav>

      <main className="main-content">
        {renderTab()}
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} HopeLink NGO. Powered by Gemini AI & Firebase.</p>
      </footer>
    </div>
  );
}

export default App;
