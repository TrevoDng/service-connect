// src/pages/Home.tsx

import { Link } from 'react-router-dom';
import { getUrl } from '../services/getUrl';
//import { useAuth } from '../account/context/AuthContext';
//@ts-ignore
import styles from './Home.module.scss';

interface HomeProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Home: React.FC<HomeProps> = ({
  //currentPage,
  setCurrentPage
}) => {

  /*
  const { isAuthenticated } = useAuth();

  const setUrl=(url: string)=> {
    if (!isAuthenticated) {
      setCurrentPage(url);
    }
  }
    */

  return (
    <div className="home-page">
      <header className="hero">
        <div className="hero-content">
          <h1>ServiceConnect</h1>
          <p className="tagline">
            Find trusted professionals for your home services<br />
            or grow your business by connecting with clients
          </p>
          <div className="auth-buttons">
            <Link to={getUrl('/login', '')[0]} className="cta-button">
              Hire / Get Hired
            </Link>
            <Link to={getUrl('/admin-dashboard', 'ADMIN')[0]} 
            onClick={() => setCurrentPage(getUrl('/admin-dashboard', 'ADMIN')[0])} 
            className="cta-button secondary">
              Admin Dashboard
            </Link>
            <Link to={getUrl('/employee-dashboard', 'EMPLOYEE')[0]} 
             
            className="cta-button secondary">
              Employee Dashboard
            </Link>
            <Link to={getUrl('/login', 'CLIENT')[0]} 
            onClick={() => setCurrentPage(getUrl('/login', 'CLIENT')[0])} 
            className="cta-button secondary">
              Client Login
            </Link>
            <Link to={getUrl('/about', '')[0]} 
            onClick={() => setCurrentPage(getUrl('/about', '')[0])} 
            className="cta-button secondary">
              About
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Home;

/*
import { Link } from 'react-router-dom';
import { getUrl } from '../services/getUrl';

interface HomeProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Home: React.FC<HomeProps> = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            ServiceConnect
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Find trusted professionals for your home services<br />
            or grow your business by connecting with clients
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            <Link 
              to={getUrl('/login', '')[0]} 
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Hire / Get Hired
            </Link>
            
            <Link 
              to={getUrl('/admin-dashboard', 'ADMIN')[0]} 
              onClick={() => setCurrentPage(getUrl('/admin-dashboard', 'ADMIN')[0])} 
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Admin Dashboard
            </Link>
            
            <Link 
              to={getUrl('/employee-dashboard', 'EMPLOYEE')[0]} 
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Employee Dashboard
            </Link>
            
            <Link 
              to={getUrl('/login', 'CLIENT')[0]} 
              onClick={() => setCurrentPage(getUrl('/login', 'CLIENT')[0])} 
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Client Login
            </Link>
            
            <Link 
              to={getUrl('/about', '')[0]} 
              onClick={() => setCurrentPage(getUrl('/about', '')[0])} 
              className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl"
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
*/
