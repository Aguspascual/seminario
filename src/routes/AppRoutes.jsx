import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/Home';
import Login from '../pages/Login';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
