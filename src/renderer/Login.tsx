import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({
  setIsConnected,
}: {
  setIsConnected: (isConnected: boolean) => void;
}) => {
  const [host, setHost] = useState(localStorage.getItem('host') || '');
  const [user, setUser] = useState(localStorage.getItem('user') || '');
  const [password, setPassword] = useState(
    localStorage.getItem('password') || '',
  );
  const [port, setPort] = useState(localStorage.getItem('port') || '');
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    window.electron.ipcRenderer.sendMessage('connect', {
      host: host,
      password: password,
      user: user,
      port: port,
    });

    // Save the credentials to localStorage
    localStorage.setItem('host', host);
    localStorage.setItem('user', user);
    localStorage.setItem('password', password);
    localStorage.setItem('port', port);
  };

  useEffect(() => {
    window.electron.ipcRenderer.on('connect', (event, isConnected) => {
      const bool: boolean = event as boolean;
      setIsConnected(bool);
      console.log('HEARD');
      console.log(event);

      if (bool) {
        navigate('/home');
      }
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners('connect');
    };
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={host}
        onChange={(e) => setHost(e.target.value)}
        placeholder="Host"
      />
      <input
        type="text"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        placeholder="User"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <input
        type="text"
        value={port}
        onChange={(e) => setPort(e.target.value)}
        placeholder="Port"
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default Login;
