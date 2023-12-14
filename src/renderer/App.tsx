import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import Home from './Home';
import { useState } from 'react';
import Login from './Login';
import TalentEditor from './TalentEditor';
import NavBar from './NavBar';

function Hello() {
  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <div className="Hello">
        <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            Read our docs
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="folded hands">
              🙏
            </span>
            Donate
          </button>
        </a>
      </div>
    </div>
  );
}

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  return (
    <Router>
      {isConnected ? <NavBar /> : <></>}
      <Routes>
        <Route path="/" element={<Login setIsConnected={setIsConnected} />} />
        <Route
          path="/home"
          element={
            isConnected ? <Home /> : <Login setIsConnected={setIsConnected} />
          }
        />
        <Route path="/talentEditor/:class" element={<TalentEditor />} />
      </Routes>
    </Router>
  );
}
