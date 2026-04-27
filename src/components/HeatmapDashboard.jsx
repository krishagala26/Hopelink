import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { AlertTriangle, Users, MapPin, Navigation } from 'lucide-react';

export default function HeatmapDashboard() {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If db is not initialized properly, we handle it gracefully
    try {
      const q = query(collection(db, 'needs'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const needsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by severity manually if needed, but for now we just show recent
        // Let's sort by severity for the "Heatmap" feel
        const severityWeight = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        needsData.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);
        
        setNeeds(needsData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching needs:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn("Firebase not configured yet.");
      setLoading(false);
    }
  }, []);

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'Critical': return 'var(--danger)';
      case 'High': return 'var(--warning)';
      case 'Medium': return 'var(--info)';
      case 'Low': return 'var(--success)';
      default: return 'var(--gray-300)';
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <h2>Emergency Needs Dashboard</h2>
        <p className="subtitle">Prioritized list of areas requiring immediate attention.</p>
      </div>

      {needs.length === 0 ? (
        <div className="empty-state">
          <AlertTriangle size={48} className="empty-icon" />
          <h3>No urgent needs reported</h3>
          <p>The situation is stable. Any new reports will appear here.</p>
        </div>
      ) : (
        <div className="heatmap-grid">
          {needs.map((need) => (
            <div 
              key={need.id} 
              className="need-card" 
              style={{ borderTop: `4px solid ${getSeverityColor(need.severity)}` }}
            >
              <div className="need-card-header">
                <span className="badge" style={{ backgroundColor: getSeverityColor(need.severity), color: '#fff' }}>
                  {need.severity}
                </span>
                <span className="status-badge">{need.status}</span>
              </div>
              
              <h3 className="need-title">{need.problem}</h3>
              
              <div className="need-details" style={{ flexGrow: 1 }}>
                <div className="detail-item" style={{ fontWeight: '600', color: 'var(--text-main, #1e293b)' }}>
                  <MapPin size={16} style={{ color: 'var(--primary-color, #3b82f6)' }} />
                  <span>{need.area}</span>
                </div>
                <div className="detail-item">
                  <Users size={16} />
                  <span>{need.peopleAffected} affected</span>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    (need.latitude && need.longitude) 
                      ? `${need.latitude},${need.longitude}` 
                      : need.area
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', width: '100%' }}
                >
                  <Navigation size={14} />
                  Get Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
