import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, className = '' }) => {
  return (
    <span 
      className={`material-symbols-outlined ${className}`} 
      style={{ fontSize: `${size}px` }}
    >
      {name}
    </span>
  );
};