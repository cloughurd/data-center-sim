/**
 * main.js
 * Application bootstrap for Data Center Simulator.
 */

import { SimEngine } from './sim-engine.js';
import { SceneRenderer } from './scene-renderer.js';
import { UIController } from './ui-controller.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('sim-canvas');
  if (!canvas) {
    console.error('Canvas element #sim-canvas not found');
    return;
  }

  // 1. Initialize simulation engine
  const engine = new SimEngine({
    serverRacks: 0,
    networkLines: 0,
    airCoolers: 0,
    waterCoolers: 0,
    gridLines: 0,
    solarPanels: 0,
    userDemandPct: 75
  });

  // 2. Initialize 2D canvas visualizer
  const renderer = new SceneRenderer(canvas);

  // 3. Initialize UI controller and bind everything together
  const ui = new UIController(engine, renderer);

  console.log('Data Center Simulation successfully initialized.');
});
