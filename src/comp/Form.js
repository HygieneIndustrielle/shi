import '../App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Des from '../comp/Des';
import Historique from '../comp/historique'; 
import Admin from '../comp/Admin';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Des />} />
        <Route path="/historique" element={<Historique />} />
        <Route path="/admin" element={<Admin />} />
        
      </Routes>
    </Router>
  );
}

export default App;
