// SVG icons for Panel Solar and Transformador Electrico
import React from "react";

export const SolarPanelIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="12" width="24" height="12" rx="2" fill="#90caf9" stroke="#1976d2" strokeWidth="2"/>
    <rect x="6" y="14" width="4" height="8" fill="#e3f2fd" stroke="#1976d2" strokeWidth="1"/>
    <rect x="12" y="14" width="4" height="8" fill="#e3f2fd" stroke="#1976d2" strokeWidth="1"/>
    <rect x="18" y="14" width="4" height="8" fill="#e3f2fd" stroke="#1976d2" strokeWidth="1"/>
    <rect x="24" y="14" width="2" height="8" fill="#e3f2fd" stroke="#1976d2" strokeWidth="1"/>
    <line x1="16" y1="24" x2="16" y2="30" stroke="#1976d2" strokeWidth="2"/>
    <circle cx="16" cy="8" r="3" fill="#fffde7" stroke="#fbc02d" strokeWidth="2"/>
    <line x1="16" y1="1" x2="16" y2="5" stroke="#fbc02d" strokeWidth="2"/>
    <line x1="8" y1="8" x2="13" y2="8" stroke="#fbc02d" strokeWidth="2"/>
    <line x1="19" y1="8" x2="24" y2="8" stroke="#fbc02d" strokeWidth="2"/>
  </svg>
);

export const TransformerIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="10" width="16" height="12" rx="2" fill="#fffde7" stroke="#ffb300" strokeWidth="2"/>
    <circle cx="12" cy="16" r="2" fill="#fff" stroke="#ffb300" strokeWidth="1.5"/>
    <circle cx="20" cy="16" r="2" fill="#fff" stroke="#ffb300" strokeWidth="1.5"/>
    <line x1="16" y1="22" x2="16" y2="30" stroke="#ffb300" strokeWidth="2"/>
    <line x1="16" y1="2" x2="16" y2="10" stroke="#ffb300" strokeWidth="2"/>
    <polyline points="14,6 16,2 18,6" fill="none" stroke="#ffb300" strokeWidth="2"/>
    <polyline points="14,26 16,30 18,26" fill="none" stroke="#ffb300" strokeWidth="2"/>
  </svg>
);
