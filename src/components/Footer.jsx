import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css'; // We'll update this next

// --- SVG Icons (modern and clean) ---
const GlobeIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const PhoneIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
const MailIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const FacebookIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const TwitterIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M22.46 6c-.77.34-1.6.57-2.47.67.89-.53 1.57-1.37 1.89-2.37-.83.5-1.75.87-2.72 1.07C18.15 4.93 17.15 4 16 4a4 4 0 0 0-4 4c0 .32.04.64.11.94A11.02 11.02 0 0 1 3.5 4.5a.4.4 0 0 0-.08.38A4.1 4.1 0 0 0 4.6 9c-.6-.02-1.16-.18-1.66-.45A4.07 4.07 0 0 0 5.4 12c.98.05 1.95-.08 2.85-.45.1.88-.04 1.77-.45 2.58a4.1 4.1 0 0 0 2.92 2.93c-2.38 1-5.4 1.25-8.22.45A11.02 11.02 0 0 0 5.5 18.5a11.16 11.16 0 0 0 17-9.5c0-.15 0-.3-.02-.45"></path></svg>;
const InstagramIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2c2.71 0 3.05.01 4.12.06 1.07.05 1.73.23 2.24.42.53.2.9.43 1.27.8s.66.74.87 1.27c.19.51.37 1.17.42 2.24.05 1.07.06 1.41.06 4.12s-.01 3.05-.06 4.12c-.05 1.07-.23 1.73-.42 2.24-.2.53-.43.9-.8 1.27s-.74.66-1.27.87c-.51.19-1.17.37-2.24.42-1.07.05-1.41.06-4.12.06s-3.05-.01-4.12-.06c-1.07-.05-1.73-.23-2.24-.42-.53-.2-.9-.43-1.27-.8s-.66-.74-.87-1.27c-.19-.51-.37-1.17-.42-2.24-.05-1.07-.06-1.41-.06-4.12s.01-3.05.06-4.12c.05-1.07.23-1.73.42-2.24.2-.53.43-.9.8-1.27s.74-.66 1.27-.87c.51-.19 1.17-.37 2.24-.42 1.07-.05 1.41-.06 4.12-.06zm0 2c-2.67 0-3 .01-4.08.06-1.07.05-1.63.22-2.09.39-.47.18-.77.38-1.04.65-.27.27-.47.57-.65 1.04-.17.46-.34 1.02-.39 2.09-.05 1.08-.06 1.4-.06 4.08s.01 3 .06 4.08c.05 1.07.22 1.63.39 2.09.18.47.38.77.65 1.04.27.27.57.47 1.04.65.46.17 1.02.34 2.09.39 1.08.05 1.4.06 4.08.06s3-.01 4.08-.06c1.07-.05 1.63-.22 2.09-.39.47-.18.77-.38 1.04-.65.27-.27.47-.57.65-1.04.17-.46.34-1.02.39-2.09.05-1.08.06-1.4.06-4.08s-.01-3-.06-4.08c-.05-1.07-.22-1.63-.39-2.09-.18-.47-.38-.77-.65-1.04-.27-.27-.57-.47-1.04-.65-.46-.17-1.02-.34-2.09-.39-1.08-.05-1.4-.06-4.08-.06zM12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM17.5 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"></path></svg>;

const Footer = () => {
  return (
    <footer className="footer-pro">
      <div className="container footer-grid-pro">
        
        {/* Column 1: Brand & Description */}
        <div className="footer-col-pro brand-info">
          <h3 className="footer-logo-pro">Travel<span className="highlight-pro">Pro</span></h3>
          <p className="brand-statement">
            Your journey, expertly curated. Explore the world with confidence and unparalleled service.
          </p>
          <div className="social-links-pro">
            <a href="#" aria-label="Facebook"><FacebookIcon /></a>
            <a href="#" aria-label="Twitter"><TwitterIcon /></a>
            <a href="#" aria-label="Instagram"><InstagramIcon /></a>
          </div>
        </div>

        {/* Column 2: Explore */}
        <div className="footer-col-pro">
          <h4>Explore</h4>
          <ul className="footer-links-pro">
            <li><Link to="/packages">Packages</Link></li>
            <li><Link to="/hotels">Hotels</Link></li>
            <li><Link to="/blogs">Blogs</Link></li>
          </ul>
        </div>

        {/* Column 3: Company */}
        {/* <div className="footer-col-pro">
          <h4>Company</h4>
          <ul className="footer-links-pro">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/press">Press</Link></li>
            <li><Link to="/partners">Partners</Link></li>
          </ul>
        </div> */}

        {/* Column 4: Support */}
        <div className="footer-col-pro">
          <h4>Support</h4>
          <ul className="footer-links-pro">
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Column 5: Contact & Newsletter */}
        <div className="footer-col-pro contact-newsletter">
          <h4>Stay Connected</h4>
          <ul className="contact-info-pro">
            <li><GlobeIcon /><span>Varanasi, Uttar Pradesh, India</span></li>
            <li><PhoneIcon /><span>+91 98765 43210</span></li>
            <li><MailIcon /><span>support@travelpro.com</span></li>
          </ul>
          {/* <p className="newsletter-text">Subscribe for exclusive travel insights and promotions.</p>
          <form className="newsletter-form-pro">
            <input type="email" placeholder="Enter your email" required />
            <button type="submit" className="btn-subscribe-pro">Subscribe</button>
          </form> */}
        </div>
        
      </div>

      <div className="footer-bottom-pro">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} TravelPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;