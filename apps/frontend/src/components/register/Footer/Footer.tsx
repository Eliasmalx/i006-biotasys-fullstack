import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="register-footer">
      <div className="register-footer__links">
        <a href="/terms" target="_blank" rel="noopener noreferrer">
          Términos
        </a>
        <span className="register-footer__separator">|</span>
        <a href="/privacy" target="_blank" rel="noopener noreferrer">
          Política de Privacidad
        </a>
      </div>
    </footer>
  );
};