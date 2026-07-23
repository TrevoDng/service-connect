interface HomeProps {
  currentPage: string;
  setCurrentPage: (page: string)=> void;
}

const Home: React.FC<HomeProps>=({
  currentPage,
  setCurrentPage
}) => {
  
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
                    <button className="cta-button" onClick={() => setCurrentPage('login')}><a href={currentPage}>Hire / Get Hired</a></button>
                    <button className="cta-button secondary" onClick={() => setCurrentPage('admin-dashboard')}>
                      <a href={currentPage}>Admin Dashboard</a>
                    </button>
                    <button className="cta-button secondary" onClick={() => setCurrentPage('employee-dashboard')}>
                      <a href={currentPage}>Employee Dashboard</a>
                    </button>
                    <button className="cta-button secondary" onClick={() => setCurrentPage('login')}>
                      <a href={currentPage}>Client Login</a>
                    </button>
                    <button className="cta-button secondary" onClick={() => setCurrentPage('about')}>
                      <a href={currentPage}>About</a>
                    </button>
                  </div>
                </div>
              </header>
            </div>
    );
}

export default Home;