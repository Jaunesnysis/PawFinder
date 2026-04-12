import { useState } from 'react';
import { questions } from '../data/questions';
import {useNavigate} from "react-router-dom";

function Questionnaire() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [petType, setPetType] = useState(null);
  const navigate = useNavigate();

  const handleAnswer = (key, value, type) => {
    const processedValue = type === 'scale' ? parseInt(value) : value;
    setAnswers(prev => ({ ...prev, [key]: processedValue }));
  };

  const nextStep = () => {
    if (currentStep === 0 && answers.type) {
      setPetType(answers.type);
      setCurrentStep(1);
    } else if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submit = async () => {
    // Check if all questions answered
    const requiredKeys = ['type'];
    for (let i = 0; i < 6; i++) {
      requiredKeys.push(`${petType}${i}`);
    }
    const missing = requiredKeys.filter(key => !answers[key]);
    if (missing.length > 0) {
      alert('Please answer all questions.');
      return;
    }

    // Build JSON
    const data = {};
    if (petType === 'dog') {
      questions.dog.forEach((q, i) => {
        const ans = answers[`dog${i}`];
        if (q.apiKey) {
          data[q.apiKey] = ans;
        } else if (q.type === 'choice') {
          const option = q.options.find(o => o.value === ans);
          if (option.apiMappings) {
            Object.assign(data, option.apiMappings);
          }
        }
      });
    } else if (petType === 'cat') {
      questions.cat.forEach((q, i) => {
        const ans = answers[`cat${i}`];
        if (q.apiKey) {
          data[q.apiKey] = ans;
        }
      });
    }
      const token = localStorage.getItem('token');

      if (!token) {
          navigate('/login');
          return;
      }
    // Send to backend
    try {
      const res = await fetch('http://localhost:5050/api/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`},
        body: JSON.stringify(data)
      });
      const result = await res.json();
      alert('Submitted successfully: ' + JSON.stringify(result));
    } catch (e) {
      alert('Error submitting: ' + e.message);
    }
  };

  const renderQuestion = () => {
    if (currentStep === 0) {
      const q = questions.type;
      return (
        <div>
          <h2>{q.question}</h2>
          {q.options.map(opt => (
            <label key={opt.value} style={{ display: 'block' }}>
              <input
                type="radio"
                name="type"
                value={opt.value}
                checked={answers.type === opt.value}
                onChange={e => handleAnswer('type', e.target.value, 'choice')}
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    } else {
      const qIndex = currentStep - 1;
      const q = questions[petType][qIndex];
      return (
        <div>
          <h2>{q.question}</h2>
          {q.options.map(opt => (
            <label key={opt.value} style={{ display: 'block' }}>
              <input
                type="radio"
                name={`q${currentStep}`}
                value={opt.value}
                checked={answers[`${petType}${qIndex}`] === opt.value}
                onChange={e => handleAnswer(`${petType}${qIndex}`, e.target.value, q.type)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    }
  };

  const isLastStep = currentStep === 6;
  const canNext = currentStep === 0 ? answers.type : answers[`${petType}${currentStep - 1}`];

  return (
    <div>
      <p>Step {currentStep + 1} of 7</p>
      {renderQuestion()}
      <div>
        <button onClick={prevStep} disabled={currentStep === 0}>Previous</button>
        {isLastStep ? (
          <button onClick={submit}>Submit</button>
        ) : (
          <button onClick={nextStep} disabled={!canNext}>Next</button>
        )}
      </div>
    </div>
  );
}

export default Questionnaire;