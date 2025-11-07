import { useState } from 'react';
import { api } from '../services/api.js';

export default function TeacherPanel() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { text: '', options: ['', ''], correctAnswer: 0 }
  ]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const addQuestion = () => {
    setQuestions((qs) => [...qs, { text: '', options: ['', ''], correctAnswer: 0 }]);
  };

  const removeQuestion = (idx) => {
    setQuestions((qs) => qs.filter((_, i) => i !== idx));
  };

  const setQText = (idx, text) => {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, text } : q)));
  };

  const addOption = (qi) => {
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, options: [...q.options, ''] } : q)));
  };

  const setOption = (qi, oi, val) => {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? val : o)) } : q
      )
    );
  };

  const setCorrect = (qi, oi) => {
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, correctAnswer: oi } : q)));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    // Basic validation
    if (!title.trim() || questions.length === 0) {
      setError('Title and at least one question are required.');
      return;
    }
    for (const q of questions) {
      if (!q.text.trim() || q.options.some((o) => !o.trim()) || q.options.length < 2) {
        setError('Each question must have text and at least two non-empty options.');
        return;
      }
      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        setError('Each question must have a valid correct answer.');
        return;
      }
    }

    try {
      await api.post('/quizzes', { title, description, questions });
      setMsg('Quiz created successfully!');
      setTitle('');
      setDescription('');
      setQuestions([{ text: '', options: ['', ''], correctAnswer: 0 }]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create quiz');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Teacher Panel</h1>
      <form onSubmit={submit} className="space-y-4">
        <div className="card space-y-3">
          <input className="input" placeholder="Quiz title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="input" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        {questions.map((q, qi) => (
          <div className="card space-y-3" key={qi}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Question {qi + 1}</h3>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(qi)} className="text-sm text-red-700">Remove</button>
              )}
            </div>
            <input className="input" placeholder="Question text" value={q.text} onChange={(e) => setQText(qi, e.target.value)} />
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correctAnswer === oi}
                    onChange={() => setCorrect(qi, oi)}
                  />
                  <input
                    className="input"
                    placeholder={`Option ${oi + 1}`}
                    value={opt}
                    onChange={(e) => setOption(qi, oi, e.target.value)}
                  />
                </div>
              ))}
              <button type="button" className="btn btn-primary" onClick={() => addOption(qi)}>
                Add option
              </button>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <button type="button" className="btn" onClick={addQuestion}>Add question</button>
          <button type="submit" className="btn btn-primary">Create quiz</button>
        </div>
      </form>

      {error && <div className="text-red-600 mt-3">{error}</div>}
      {msg && <div className="text-green-700 mt-3">{msg}</div>}
    </div>
  );
}



