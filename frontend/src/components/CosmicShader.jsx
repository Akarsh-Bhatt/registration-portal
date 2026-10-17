import React from 'react';
import CosmicAnimation from './CosmicAnimation';

export default function CosmicShader(props) {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
      <CosmicAnimation {...props} />
    </div>
  );
}
