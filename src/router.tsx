import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import Report from './pages/Report';
import BaziNumerology from './pages/BaziNumerology';
import Enneagram from './pages/Enneagram';
import Maxdiff from './pages/Maxdiff';
import Mbti from './pages/Mbti';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/report/:token', element: <Report /> },
  { path: '/bazi-numerology/:token', element: <BaziNumerology /> },
  { path: '/enneagram/:token', element: <Enneagram /> },
  { path: '/maxdiff/:token', element: <Maxdiff /> },
  { path: '/mbti/:token', element: <Mbti /> },
  { path: '*', element: <NotFound /> },
]);
