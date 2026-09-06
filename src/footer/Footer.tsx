import React from 'react';
import { Link } from 'react-router-dom';
import { getUrl } from '../services/getUrl';
import { useTheme } from '../styles/context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFacebook, 
  faTwitter, 
  faLinkedin, 
  faInstagram,
  faYoutube 
} from '@fortawesome/free-brands-svg-icons';
import { 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt,
  faArrowUp 
} from '@fortawesome/free-solid-svg-icons';
import styles from './Footer.module.scss';

export const Footer: React.FC = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`${styles.footer} ${theme}-theme`}>
      <div className={styles.footerContainer}>
        {/* Top section with scroll to top */}
        <div className={styles.footerTop}>
          <button 
            onClick={scrollToTop} 
            className={styles.scrollTop}
            aria-label="Scroll to top"
          >
            <FontAwesomeIcon icon={faArrowUp} />
            <span>Back to Top</span>
          </button>
        </div>

        {/* Main footer content */}
        <div className={styles.footerGrid}>
          {/* Brand Column */}
          <div className={styles.footerColumn}>
            <h3 className={styles.footerBrand}>ServiceConnect</h3>
            <p className={styles.footerDescription}>
              Connecting trusted professionals with clients who need their services. 
              Quality service, guaranteed.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" aria-label="Facebook" className={styles.socialIcon}>
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="#" aria-label="Twitter" className={styles.socialIcon}>
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="#" aria-label="LinkedIn" className={styles.socialIcon}>
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
              <a href="#" aria-label="Instagram" className={styles.socialIcon}>
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="#" aria-label="YouTube" className={styles.socialIcon}>
                <FontAwesomeIcon icon={faYoutube} />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className={styles.footerColumn}>
            <h4 className={styles.footerHeading}>Quick Links</h4>
            <ul className={styles.footerLinks}>
              <li><Link to={getUrl('/', '')[0]}>Home</Link></li>
              <li><Link to={getUrl('/services', '')[0]}>Services</Link></li>
              <li><Link to={getUrl('/about', '')[0]}>About Us</Link></li>
              <li><Link to={getUrl('/login', '')[0]}>Client Login</Link></li>
              <li><Link to={getUrl('/employee-dashboard', 'EMPLOYEE')[0]}>Provider Dashboard</Link></li>
            </ul>
          </div>

          {/* Services Column */}
          <div className={styles.footerColumn}>
            <h4 className={styles.footerHeading}>Services</h4>
            <ul className={styles.footerLinks}>
              <li><Link to={getUrl('/services', '')[0]}>Find Professionals</Link></li>
              <li><Link to={getUrl('/provider/dashboard', '')[0]}>List Your Service</Link></li>
              <li><Link to={getUrl('/about', '')[0]}>How It Works</Link></li>
              <li><Link to={getUrl('/about', '')[0]}>Success Stories</Link></li>
              <li><Link to={getUrl('/about', '')[0]}>FAQ</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className={styles.footerColumn}>
            <h4 className={styles.footerHeading}>Contact Us</h4>
            <ul className={styles.contactInfo}>
              <li>
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>123 Service Street, City, Country</span>
              </li>
              <li>
                <FontAwesomeIcon icon={faPhone} />
                <span>+1 (555) 123-4567</span>
              </li>
              <li>
                <FontAwesomeIcon icon={faEnvelope} />
                <span>info@serviceconnect.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            &copy; {currentYear} ServiceConnect. All rights reserved.
          </p>
          <div className={styles.footerBottomLinks}>
            <Link to={getUrl('/about', '')[0]}>Privacy Policy</Link>
            <Link to={getUrl('/about', '')[0]}>Terms of Service</Link>
            <Link to={getUrl('/about', '')[0]}>Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
