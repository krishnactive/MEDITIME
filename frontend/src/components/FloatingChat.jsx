import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { FaComments, FaUserMd, FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
// import { toast } from 'react-hot-toast'; 
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const DrAIChat = () => {
  const { userData } = useContext(AppContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    symptoms: '',
    duration: '',
    history: '',
    medications: '',
    allergies: '',
  });
  const [messages, setMessages] = useState([
    { from: 'ai', text: "Hello! I'm Dr.AI. Let's create your health report." },
    { from: 'ai', text: "What symptoms are you experiencing?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReportReady, setIsReportReady] = useState(false);
  const bottomRef = useRef(null);

  const questions = [
    { key: 'symptoms', question: "What symptoms are you experiencing?" },
    { key: 'duration', question: "For how long have you had these symptoms?" },
    { key: 'history', question: "Do you have any relevant medical history?" },
    { key: 'medications', question: "Are you currently taking any medications?" },
    { key: 'allergies', question: "Do you have any allergies?" }
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNext = async () => {
    if (!input.trim() || isLoading || step === -1) return;

    const currentStep = questions[step];
    const updatedAnswers = { ...answers, [currentStep.key]: input };

    const newMessages = [
      ...messages,
      { from: 'user', text: input }
    ];

    setAnswers(updatedAnswers);
    setInput('');

    if (step < questions.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      setMessages([
        ...newMessages,
        { from: 'ai', text: questions[nextStep].question }
      ]);
    } else {
      setIsLoading(true);
      setMessages([
        ...newMessages,
        { from: 'ai', text: "Generating your prescription..." }
      ]);

      const summary = `
Symptoms: ${updatedAnswers.symptoms}
Duration: ${updatedAnswers.duration}
Medical History: ${updatedAnswers.history}
Medications: ${updatedAnswers.medications}
Allergies: ${updatedAnswers.allergies}
      `;

      try {
        const response = await axios.post(`${backendUrl}/api/ai/ask`, {
          messages: [
            { from: 'user', text: `Act as a doctor. Based on this info, generate a prescription:\n${summary}` }
          ]
        });

        setMessages([
          ...newMessages,
          { from: 'ai', text: "Generating your prescription..." },
          { from: 'ai', text: response?.data?.text || response?.data?.answer || "Here's your prescription." },
          { from: 'ai', text: "Your report is ready! If you wish to generate another report, please click below to restart." }
        ]);
        setIsReportReady(true);
        setStep(-1); // disable further input
      } catch (err) {
        console.error(err);
        toast.error('Failed to generate prescription');
        setMessages([
          ...newMessages,
          { from: 'ai', text: "Sorry, something went wrong while generating your report." }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    let y = 10;
    messages.forEach(({ from, text }) => {
      const prefix = from === 'user' ? 'User: ' : 'Dr.AI: ';
      const lines = doc.splitTextToSize(prefix + text, 180);
      lines.forEach(line => {
        doc.text(line, 10, y);
        y += 8;
      });
    });
    doc.save('DrAI_Report.pdf');
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers({
      symptoms: '',
      duration: '',
      history: '',
      medications: '',
      allergies: '',
    });
    setInput('');
    setMessages([
      { from: 'ai', text: "Hello again! Let's create a new health report." },
      { from: 'ai', text: questions[0].question }
    ]);
    setIsReportReady(false);
  };

  return (
    <div>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 flex flex-col items-center space-y-1 z-50">
          <div className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full shadow-md">
            Dr.AI
          </div>
          <button
            onClick={() => {
              if (!userData) {
                toast.error("Please login first to use Dr.AI");
                return;
              }
              setIsOpen(true);
            }}
            className="bg-teal-600 text-white p-4 rounded-full shadow-lg hover:bg-teal-700"
            aria-label="Open Dr.AI Chat"
          >
            <FaComments size={24} />
          </button>
        </div>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 md:right-10 mb-5 w-full max-w-md md:max-w-lg h-[75%] bg-white border border-gray-300 rounded-xl shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center p-4 bg-teal-600 text-white rounded-t-xl">
            <FaUserMd className="mr-3 text-xl" />
            <div>
              <div className="font-semibold text-lg">Dr.AI</div>
              <div className="text-xs">Free AI-powered medical assistant</div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto text-xl font-bold hover:text-gray-300"
              aria-label="Close chat"
            >
              &times;
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl text-sm whitespace-pre-wrap max-w-[80%] ${
                  msg.from === 'user'
                    ? 'bg-teal-100 self-end'
                    : 'bg-white border border-gray-200 self-start'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="p-3 rounded-xl text-sm bg-white border border-gray-200 self-start">
                Typing...
              </div>
            )}

            {/* Download + Restart */}
            {isReportReady && (
              <div className="self-center text-center mt-4 space-y-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-full text-sm hover:bg-teal-700"
                >
                  <FaDownload />
                  Download Report (PDF)
                </button>
                <button
                  onClick={handleRestart}
                  className="text-teal-600 hover:underline text-sm"
                >
                  Start New Report
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white rounded-b-xl flex space-x-2">
            {!isLoading && step !== -1 && (
              <>
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  placeholder="Type your answer..."
                  aria-label="User input"
                />
                <button
                  onClick={handleNext}
                  className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm hover:bg-teal-700"
                  aria-label="Send message"
                >
                  Send
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DrAIChat;
