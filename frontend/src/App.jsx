import React from 'react';
import ChatBot from './components/ChatBot';
import './styles/ChatBot.css';

function App() {
  return (
    <div className="App" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      background: '#1a1a1a',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <h1 style={{
        color: 'white',
        marginBottom: '30px',
        textAlign: 'center'
      }}>AI Chat Bot</h1>
      <div style={{
        width: '100%',
        maxWidth: '800px',  // Adjust this value to control the chat width
        margin: '0 auto'
      }}>
        <ChatBot />
      </div>
    </div>
  );
}

export default App;
