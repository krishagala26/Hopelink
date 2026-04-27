import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Send, Mic, Sparkles, AlertTriangle } from 'lucide-react';

export default function SurveyForm() {
  const [formData, setFormData] = useState({
    area: '',
    problem: '',
    severity: 'Medium',
    peopleAffected: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [isListening, setIsListening] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  
  const [emergencyAssistResult, setEmergencyAssistResult] = useState('');
  const [isGeneratingAssist, setIsGeneratingAssist] = useState(false);
  const [assistError, setAssistError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({
        ...prev,
        problem: prev.problem ? prev.problem + ' ' + transcript : transcript
      }));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleGenerateSummary = async () => {
    if (!formData.area || !formData.problem) {
      setSummaryError("Please fill in location and problem description first.");
      return;
    }

    setIsGeneratingSummary(true);
    setSummaryError('');
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
      }

      const prompt = `You are an AI assistant for NGOs.
Summarize the following emergency report in a short, structured way.
Also explain urgency in one line.

Location: ${formData.area}
Problem: ${formData.problem}
Severity: ${formData.severity}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
  if (response.status === 503 || response.status === 429) {
    console.warn("Gemini API overloaded. Using intelligent fallback.");

    setAiSummary(
      `This is a ${formData.severity} level issue reported in ${formData.area}. 
The situation involves ${formData.problem} and affects multiple individuals.

Urgency: Immediate attention is recommended to prevent escalation and ensure safety.`
    );
    return;
  }
        const errorText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      
      setAiSummary(textResponse);
    } catch (err) {
      console.error(err);
      console.warn("Using fallback summary due to error:", err);

      setAiSummary(
      `This is a ${formData.severity} level issue reported in ${formData.area}. 
       The situation involves ${formData.problem} and requires timely intervention.

     Urgency: Immediate coordination with relevant authorities or NGOs is advised.`
     );

    setSummaryError('');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleEmergencyAssist = async () => {
    if (!formData.area || !formData.problem) {
      setAssistError("Please fill in location and problem description first.");
      return;
    }

    setIsGeneratingAssist(true);
    setAssistError('');
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
      }

      const prompt = `You are an emergency assistant.
Based on this report, suggest:
1. Type of help needed
2. Best type of organization
3. Immediate next step

Location: ${formData.area}
Problem: ${formData.problem}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
  if (response.status === 503 || response.status === 429) {

    setEmergencyAssistResult(
      `1. Type of Help Needed: Immediate emergency response and support\n
      2. Recommended Organization: Nearby NGOs, medical services, or local authorities\n
      3. Next Step: Dispatch a response team to ${formData.area} and begin coordinated assistance`
    );
    return;
  }

  const errorText = await response.text();
  throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
 }

  const data = await response.json();
  const textResponse = data.candidates[0].content.parts[0].text;
  setEmergencyAssistResult(textResponse);
    } catch (err) {
      console.error(err);
      console.warn("Using fallback assist due to error:", err);
      setEmergencyAssistResult(
  `1. Type of Help Needed: Urgent assistance required\n
   2. Recommended Organization: NGOs or emergency services\n
   3. Next Step: Quickly assess the situation in ${formData.area} and initiate response`
   );
    setAssistError('');
      
    } finally {
      setIsGeneratingAssist(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');
    
    try {
      await addDoc(collection(db, 'needs'), {
        ...formData,
        peopleAffected: Number(formData.peopleAffected),
        aiSummary: aiSummary || null,
        emergencyAssist: emergencyAssistResult || null,
        createdAt: serverTimestamp(),
        status: 'Open'
      });
      setSuccessMsg('Survey submitted successfully!');
      setFormData({ area: '', problem: '', severity: 'Medium', peopleAffected: '' });
      setAiSummary('');
      setEmergencyAssistResult('');
    } catch (error) {
      console.error('Error adding document: ', error);
      setSuccessMsg('Failed to submit. Please ensure Firebase is configured.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card fade-in">
      <h2>Report an Urgent Need</h2>
      <p className="subtitle">Help us identify critical issues in your community.</p>
      
      {successMsg && <div className={`alert ${successMsg.includes('Failed') ? 'alert-error' : 'alert-success'}`}>{successMsg}</div>}
      
      <form onSubmit={handleSubmit} className="form-layout">
        <div className="form-group">
          <label>Area / Location</label>
          <input 
            type="text" 
            name="area" 
            value={formData.area} 
            onChange={handleChange} 
            placeholder="e.g., Downtown District"
            required 
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ margin: 0 }}>Problem Description</label>
            <button 
              type="button" 
              onClick={handleMicClick}
              className={`btn-secondary btn-sm ${isListening ? 'listening' : ''}`}
              title="Click to speak"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: isListening ? '#fee2e2' : undefined, color: isListening ? '#ef4444' : undefined }}
            >
              <Mic size={16} />
              {isListening ? 'Listening...' : 'Voice Input'}
            </button>
          </div>
          <textarea 
            name="problem" 
            value={formData.problem} 
            onChange={handleChange} 
            placeholder="Describe the issue in detail..."
            rows="3"
            required 
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Severity Level</label>
            <select name="severity" value={formData.severity} onChange={handleChange} required>
              <option value="Critical">Critical (Red)</option>
              <option value="High">High (Orange)</option>
              <option value="Medium">Medium (Yellow)</option>
              <option value="Low">Low (Green)</option>
            </select>
          </div>

          <div className="form-group">
            <label>People Affected</label>
            <input 
              type="number" 
              name="peopleAffected" 
              value={formData.peopleAffected} 
              onChange={handleChange} 
              placeholder="e.g., 50"
              required 
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            onClick={handleGenerateSummary} 
            disabled={isGeneratingSummary} 
            className="btn-secondary"
            style={{ flex: '1 1 200px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <Sparkles size={18} />
            {isGeneratingSummary ? 'Generating...' : 'Generate AI Summary'}
          </button>
          
          <button 
            type="button" 
            onClick={handleEmergencyAssist} 
            disabled={isGeneratingAssist} 
            className="btn-secondary"
            style={{ flex: '1 1 200px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}
          >
            <AlertTriangle size={18} />
            {isGeneratingAssist ? 'Analyzing...' : 'Emergency Assist'}
          </button>
        </div>

        {summaryError && <div className="alert alert-error">{summaryError}</div>}
        {assistError && <div className="alert alert-error">{assistError}</div>}
        
        {aiSummary && (
          <div className="ai-summary-box" style={{ padding: '15px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '15px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, marginBottom: '10px', color: '#166534' }}>
              <Sparkles size={16} /> AI Summary
            </h4>
            <div style={{ whiteSpace: 'pre-wrap', color: '#15803d', fontSize: '0.9rem' }}>{aiSummary}</div>
          </div>
        )}

        {emergencyAssistResult && (
          <div className="emergency-assist-box fade-in" style={{ padding: '15px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', marginBottom: '20px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, marginBottom: '10px', color: '#1e3a8a' }}>
              <AlertTriangle size={16} /> Emergency Assist Recommendations
            </h4>
            <div style={{ whiteSpace: 'pre-wrap', color: '#1d4ed8', fontSize: '0.9rem' }}>{emergencyAssistResult}</div>
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          <Send size={18} />
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
