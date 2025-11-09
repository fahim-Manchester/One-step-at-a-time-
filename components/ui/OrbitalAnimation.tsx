import React from 'react';

const OrbitalAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-0 opacity-70">
      <div className="w-96 h-96 relative flex items-center justify-center">
        {/* Sun */}
        <div className="w-8 h-8 bg-yellow-400 rounded-full shadow-[0_0_20px_theme(colors.yellow.300)]"></div>
        
        {/* Orbit 1 */}
        <div className="orbit" style={{ width: '150px', height: '150px', animationDuration: '12s' }}>
          <div className="planet" style={{ width: '10px', height: '10px' }}></div>
        </div>

        {/* Orbit 2 */}
        <div className="orbit" style={{ width: '250px', height: '250px', animationDuration: '20s' }}>
          <div className="planet" style={{ width: '15px', height: '15px', backgroundColor: '#a5b4fc' /* indigo-300 */, boxShadow: '0 0 10px #a5b4fc' }}></div>
        </div>

        {/* Orbit 3 */}
        <div className="orbit" style={{ width: '350px', height: '350px', animationDuration: '35s', animationDirection: 'reverse' }}>
            <div className="planet" style={{ width: '12px', height: '12px', backgroundColor: '#f472b6' /* pink-400 */, boxShadow: '0 0 10px #f472b6' }}></div>
        </div>
      </div>
    </div>
  );
};

export default OrbitalAnimation;