import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';

const Chatbot = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm Dr. Climate 🤖. Ask me about symptoms, precautions, or how I predict diseases!", sender: 'bot' }
    ]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getBotResponse = (query) => {
        const q = query.toLowerCase();

        if (q.includes('malaria')) return "Malaria is spread by mosquitoes. Symptoms: Fever, chills, headache. Risk increases in high temp & humidity.";
        if (q.includes('dengue')) return "Dengue is a viral infection from mosquitoes. Symptoms: High fever, rash, muscle pain. Eliminate standing water!";
        if (q.includes('typhoid')) return "Typhoid is bacterial. Symptoms: Prolonged fever, fatigue, nausea. Drink clean water and eat cooked food.";
        if (q.includes('asthma') || q.includes('aqi')) return "Asthma is triggered by poor air quality (High AQI) and pollen. Wear a mask if AQI > 150.";
        if (q.includes('symptom')) return "I can tell you about symptoms for Malaria, Dengue, Typhoid, and Asthma. Which one?";
        if (q.includes('precaution') || q.includes('prevent')) return "General precautions: Use mosquito nets, drink boiled water, and wear masks in pollution.";
        if (q.includes('hello') || q.includes('hi')) return "Hi there! Stay safe from climate-sensitive diseases. How can I help?";
        if (q.includes('accurate') || q.includes('accuracy')) return "I use a Random Forest algorithm trained on historical climate data to predict disease outbreaks with ~85-92% accuracy.";

        return "I'm not sure about that. Try asking about 'Malaria symptoms', 'Dengue precautions', or 'Accuracy'.";
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate typing delay
        setTimeout(() => {
            const botMsg = { id: Date.now() + 1, text: getBotResponse(input), sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
        }, 600);
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                className="chatbot-fab"
                onClick={() => setIsOpen(!isOpen)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center', // Fix vertical alignment
                    justifyContent: 'center', // Fix horizontal alignment
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    zIndex: 1000
                }}
            >
                {isOpen ? <FaTimes size={24} /> : <FaRobot size={28} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            bottom: '7rem',
                            right: '2rem',
                            width: '350px',
                            height: '500px',
                            background: 'rgba(23, 23, 23, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            zIndex: 1000
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <FaRobot color="#3b82f6" />
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Dr. Climate</h3>
                        </div>

                        {/* Messages Area */}
                        <div style={{
                            flex: 1,
                            padding: '1rem',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.8rem'
                        }}>
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    style={{
                                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        background: msg.sender === 'user' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        padding: '0.8rem 1rem',
                                        borderRadius: '12px',
                                        borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                                        borderBottomLeftRadius: msg.sender === 'bot' ? '2px' : '12px',
                                        maxWidth: '80%',
                                        fontSize: '0.9rem',
                                        lineHeight: 1.4
                                    }}
                                >
                                    {msg.text}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} style={{
                            padding: '1rem',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            gap: '0.5rem'
                        }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '20px',
                                    padding: '0.8rem 1rem',
                                    color: '#fff',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="submit"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: '#3b82f6',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <FaPaperPlane size={14} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;
