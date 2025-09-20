import React from 'react';

const PillPalLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2Z" />
    <path d="M12 7v10" />
    <path d="m16.5 9.5-9 5" />
    <path d="m7.5 9.5 9 5" />
  </svg>
);

export default PillPalLogo;
