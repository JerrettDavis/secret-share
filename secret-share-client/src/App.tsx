import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeUIProvider  } from 'theme-ui';
import theme from './theme';
import EncryptForm from './components/EncryptForm';
import RetrieveForm from './components/RetrieveForm';
import ManagementPage from './pages/ManagementPage'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const apiBaseUrl = 'http://localhost:5000';

const App: React.FC = () => {
    return (
        <ThemeUIProvider theme={theme}>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<EncryptForm apiURL={apiBaseUrl} />} />
                        <Route path="/retrieve/:identifier" element={<RetrieveForm />} />
                        <Route path="/manage/:creatorIdentifier" element={<ManagementPage />} />
                    </Routes>
                    <ToastContainer />
                </div>
            </Router>
        </ThemeUIProvider>
    );
};

export default App;
