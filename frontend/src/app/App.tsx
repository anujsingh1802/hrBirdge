import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { AdBanners } from './components/AdBanners';

function App() {
  return (
    <AuthProvider>
      <AdBanners />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
