import React from 'react';

import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import AwsDashboard from './pages/AwsDashboard';
import AzureDashboard from './pages/AzureDashboard';
import GCPDashboard from './pages/GCPDashboard'; // Import GCPDashboard
import LoginPage from './pages/LoginPage';
import './styles/App.css';
import UnusedService_AWS from './pages/UnusedService_AWS';
import MainPage from './pages/MainPage'; 

//import UnusedServices from "./pages/UnusedServices";

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>

          <Route path="/" exact component={LoginPageWrapper} />
          
          <Route path="/MainPage" exact component={MainPage} />
           <Route path="/aws_dashboard" component={AwsDashboard} />
           <Route path="/azure" component={AzureDashboard} />
           <Route path="/GCPDashboard" component={GCPDashboard} /> Add GCPDashboard route 
          <Route path="/UnusedService_AWS" component={UnusedService_AWS} />

        </Switch>
      </div>
      {/* <div className="app">
      <h1>AWS Unused Services</h1>
      <UnusedServices />
    </div> */}
    </Router>

  );
}

const LoginPageWrapper = () => {
  const history = useHistory();

 const handleLoginSuccess = (selectedDashboard) => {
  console.log(`Navigating to /MainPage with ${selectedDashboard}`);
  localStorage.setItem("selectedCloud", selectedDashboard); // Store selection
  history.push("/MainPage");
};


  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
};

export default App;
