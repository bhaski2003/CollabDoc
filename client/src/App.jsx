import React, { useState } from 'react';
import TextEditor from './components/TextEditor';
import './styles.css';


const App = () => {
  const [theme, setTheme] = useState('light');
  const [editorContent, setEditorContent] = useState('');

  // Toggle between dark and light mode
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Handle content download
  const downloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([editorContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "document.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className={`app-container ${theme}`}>
      <header>
        <h1 style={{ fontFamily: 'Roboto, sans-serif' }}>Live Editor</h1>
        <button onClick={toggleTheme}>
          {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        </button>
        <button onClick={downloadFile}>Download as Text</button>
      </header>
      <TextEditor setEditorContent={setEditorContent} />
    </div>
  );
};

export default App;
