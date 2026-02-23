import React from 'react';
import './Header.css';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <a href="/" className="header__logo">
        <svg
          className="header__logo-icon"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="8" fill="#1a2b6d" />
          <circle cx="16" cy="12" r="4" fill="#fff" opacity="0.9" />
          <circle cx="10" cy="20" r="3" fill="#fff" opacity="0.7" />
          <circle cx="22" cy="20" r="3" fill="#fff" opacity="0.7" />
          <circle cx="16" cy="24" r="2" fill="#fff" opacity="0.5" />
        </svg>
        <span className="header__logo-text">Biotasys</span>
      </a>

      <div className="header__right">
        <button className="header__help-btn" title="Ayuda" aria-label="Ayuda">
          ?
        </button>
        <button className="header__lang" aria-label="Cambiar idioma">
          Español
          <svg
            className="header__lang-chevron"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M4.427 6.427a.75.75 0 011.06-.073L8 8.574l2.513-2.22a.75.75 0 11.994 1.123l-3 2.651a.75.75 0 01-.994 0l-3-2.651a.75.75 0 01-.086-1.077z" />
          </svg>
        </button>
      </div>
    </header>
  );
};