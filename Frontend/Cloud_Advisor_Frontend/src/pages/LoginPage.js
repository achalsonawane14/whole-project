import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../styles/LoginPage.css';

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const history = useHistory();

  const handleLogin = async (e) => {
    e.preventDefault();
    const loginData = { username, password };

    console.log("Attempting login with:", loginData);

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      console.log("Response data:", data);

      if (response.ok) {
        setLoggedIn(true);
        setError('');
      } else {
        setLoggedIn(false);
        setError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('An error occurred while logging in');
    }
  };

  const handleDropdownChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleSubmit = () => {
    if (selectedOption) {
      localStorage.setItem("selectedCloud", selectedOption); // ✅ Store selected platform
      history.push(`/MainPage?dashboard=${selectedOption}`);
    }
  };
  

  const handleBack = () => {
    setLoggedIn(false);
    setSelectedOption('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Login</h1>

        {loggedIn ? (
          <div>
            <h2>Welcome, Cloud User!</h2>
            <label>Select Cloud Platform:</label>
            <select value={selectedOption} onChange={handleDropdownChange} className="dropdown">
              <option value="">Select</option>
              <option value="azure">Azure</option>
              <option value="aws">AWS</option>
              <option value="gcp">GCP</option> {/* Added GCP option */}
            </select>
            {selectedOption && (
              <button onClick={handleSubmit} className="submit-btn">Submit</button>
            )}
            <button onClick={handleBack} className="back-btn">Back</button>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div className="input-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <button type="submit" className="login-btn">Login</button>
          </form>
        )}

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
