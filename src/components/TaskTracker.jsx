import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle, Clock, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export default function TaskTracker() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState({});

  const toggleExpand = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  useEffect(() => {
    try {
      // Fetch needs that are not completed yet
      const q = query(collection(db, 'needs'), where('status', '==', 'Open'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTasks(tasksData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn("Firebase not configured yet.");
      setLoading(false);
    }
  }, []);

  const markAsCompleted = async (taskId) => {
    try {
      const taskRef = doc(db, 'needs', taskId);
      await updateDoc(taskRef, {
        status: 'Completed'
      });
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Check Firebase connection.");
    }
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <h2>Active Tasks</h2>
        <p className="subtitle">Manage and track assigned field operations.</p>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={48} className="empty-icon success-icon" />
          <h3>All caught up!</h3>
          <p>There are no open tasks at the moment.</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => {
            const isExpanded = expandedTasks[task.id];
            
            // Try to extract volunteer name if assigned via Smart Matching
            let displayTitle = task.problem;
            let assignedVolunteer = "Pending Assignment";
            
            if (task.problem && task.problem.startsWith("Assigned ")) {
              const colonIndex = task.problem.indexOf(':');
              if (colonIndex !== -1) {
                assignedVolunteer = task.problem.substring(9, colonIndex);
                displayTitle = task.problem.substring(colonIndex + 1).trim();
              }
            }

            return (
              <div key={task.id} className="task-item" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
                  <div className="task-info" style={{ flex: '1 1 200px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{displayTitle}</h4>
                    <div className="task-meta">
                      <span className="task-location">{task.area}</span>
                      <span className={`task-severity severity-${task.severity.toLowerCase()}`}>
                        {task.severity}
                      </span>
                    </div>
                  </div>
                  <div className="task-actions" style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => toggleExpand(task.id)} 
                      className="btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </button>
                    <button 
                      onClick={() => markAsCompleted(task.id)}
                      className="btn-complete"
                      title="Mark as Completed"
                    >
                      <CheckCircle size={18} />
                      Complete
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="task-details-panel fade-in" style={{ 
                    marginTop: '8px', 
                    paddingTop: '16px', 
                    borderTop: '1px solid var(--border-color, #e2e8f0)', 
                    fontSize: '0.95rem', 
                    color: 'var(--text-secondary, #475569)' 
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      <strong style={{ color: 'var(--text-main, #1e293b)' }}>Problem Description:</strong>
                      <p style={{ margin: '4px 0 0 0' }}>{task.problem}</p>
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ color: 'var(--text-main, #1e293b)' }}>Assigned Volunteer:</strong>
                      <p style={{ margin: '4px 0 0 0' }}>
                        {assignedVolunteer !== "Pending Assignment" ? (
                          <span style={{ display: 'inline-block', backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '500' }}>
                            {assignedVolunteer}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Pending Assignment</span>
                        )}
                      </p>
                    </div>

                    {task.aiSummary && (
                      <div style={{ 
                        backgroundColor: '#f0fdf4', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        border: '1px solid #bbf7d0' 
                      }}>
                        <strong style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <Sparkles size={16} /> AI Summary
                        </strong>
                        <div style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#15803d', fontSize: '0.9rem', lineHeight: '1.5' }}>
                          {task.aiSummary}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
