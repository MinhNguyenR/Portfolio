import { GitFork, Mail, Heart } from 'lucide-react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <img src="/images/mascot.png" alt="Hachiware" className="footer-mascot" />
        <div className="footer-links">
          <a href="https://github.com/MinhNguyenR" target="_blank" rel="noopener noreferrer">
            <GitFork size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            GitHub
          </a>
          <a href="mailto:nguyendangtuongminh555@gmail.com">
            <Mail size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Email
          </a>
        </div>
        <p className="footer-copy">
          Made with <Heart size={14} style={{ color: '#fda4af', verticalAlign: 'middle' }} /> by Nguyễn Đặng Tường Minh
          <br />
          © {new Date().getFullYear()} Minh.dev — All rights reserved
        </p>
      </div>
    </footer>
  );
}

export default Footer;
