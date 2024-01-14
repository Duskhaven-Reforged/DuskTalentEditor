import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import Home from './Home';
import { useState } from 'react';
import Login from './Login';
import TalentEditor from './TalentEditor';
import NavBar from './NavBar';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  return (
    <Router>
      <div className="titleBar">
        <h1>DuskhavenTalentEditor</h1>
      </div>
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
