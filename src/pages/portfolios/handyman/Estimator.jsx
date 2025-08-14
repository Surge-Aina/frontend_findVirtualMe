import React, { useState } from 'react';
import './Estimator.css';

// 1. Update priceData to store numbers for calculation
const priceData = {
  '': { min: 0, max: 0, unit: 'task' },
  'faucet': { min: 120, max: 200, unit: 'faucet' },
  'fan': { min: 150, max: 250, unit: 'fan' },
  'drywall': { min: 80, max: 250, unit: 'patch' },
  'painting': { min: 350, max: 700, unit: 'room' },
};

const Estimator = () => {
  const [service, setService] = useState('');
  const [units, setUnits] = useState(1);

  // 2. Calculate the total cost based on units
  const calculateEstimate = () => {
    if (!service) {
      return 'Select a service';
    }
    const base = priceData[service];
    const minCost = base.min * units;
    const maxCost = base.max * units;
    return `$${minCost} - $${maxCost}`;
  };

  return (
    <section id="estimator" className="estimator-section">
      <div className="estimator-container">
        <h2>Get an Instant Estimate</h2>
        <p>This tool provides a rough, non-binding estimate for common jobs.</p>

        <div className="estimator-controls">
          <select className="estimator-select" onChange={(e) => setService(e.target.value)}>
            <option value="">-- Select a Service --</option>
            <option value="faucet">Replace a Faucet</option>
            <option value="fan">Install a Ceiling Fan</option>
            <option value="drywall">Repair Drywall</option>
            <option value="painting">Paint a Room</option>
          </select>

          {/* Only show the number input if a service is selected */}
          {service && (
             <input
                type="number"
                className="estimator-input"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                min="1"
             />
          )}
        </div>

        <div className="estimator-result">
          <h3>Estimated Cost:</h3>
          {/* 3. Display the calculated estimate */}
          <p className="price-range">{calculateEstimate()}</p>
        </div>

         <div className="estimator-disclaimer">
            For a firm quote, please contact us directly.
         </div>
      </div>
    </section>
  );
};

export default Estimator;