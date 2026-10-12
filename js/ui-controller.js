/**
 * ui-controller.js
 * Manages user interface interactions, steppers, dashboard telemetry,
 * sound effects (Web Audio API synth), and educational quest progression.
 */

import { CHALLENGES } from './challenges.js';

export class UIController {
  constructor(engine, renderer) {
    this.engine = engine;
    this.renderer = renderer;
    this.currentChallenge = CHALLENGES[0];
    this.audioMuted = false;
    this.audioCtx = null;

    this.initDOM();
    this.initAudio();
    this.bindEvents();
    this.refresh();
  }

  initDOM() {
    // Cache control inputs
    this.dom = {
      // Stepper count displays
      rackCount: document.getElementById('rack-count'),
      networkCount: document.getElementById('network-count'),
      airCount: document.getElementById('air-count'),
      waterCount: document.getElementById('water-count'),
      gridCount: document.getElementById('grid-count'),
      solarCount: document.getElementById('solar-count'),
      trafficSlider: document.getElementById('traffic-slider'),
      trafficDisplay: document.getElementById('traffic-display'),

      // Diagnostic & Bottleneck banner
      bottleneckCard: document.getElementById('bottleneck-card'),
      bottleneckBadge: document.getElementById('bottleneck-badge'),
      bottleneckTitle: document.getElementById('bottleneck-title'),
      bottleneckDesc: document.getElementById('bottleneck-desc'),

      // Performance Gauges
      throughputValue: document.getElementById('throughput-value'),
      throughputBar: document.getElementById('throughput-bar'),
      throughputCompare: document.getElementById('throughput-compare'),
      tempValue: document.getElementById('temp-value'),
      tempBar: document.getElementById('temp-bar'),
      tempStatus: document.getElementById('temp-status'),

      // Impact Cards
      powerMW: document.getElementById('power-mw'),
      powerHomes: document.getElementById('power-homes'),
      cleanEnergyTag: document.getElementById('clean-energy-tag'),
      waterGPD: document.getElementById('water-gpd'),
      waterPools: document.getElementById('water-pools'),
      landRemaining: document.getElementById('land-remaining'),
      treesCut: document.getElementById('trees-cut'),

      // Quests & Challenges
      challengeSelect: document.getElementById('challenge-select'),
      challengeDesc: document.getElementById('challenge-desc'),
      challengeGoals: document.getElementById('challenge-goals'),
      challengeSuccessBanner: document.getElementById('challenge-success-banner'),
      resetBtn: document.getElementById('btn-reset'),
      muteBtn: document.getElementById('btn-mute')
    };

    // Populate challenge selector options
    if (this.dom.challengeSelect) {
      this.dom.challengeSelect.innerHTML = CHALLENGES.map(c => 
        `<option value="${c.id}">${c.title}</option>`
      ).join('');
    }
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  playTone(freq = 440, type = 'sine', duration = 0.08) {
    if (this.audioMuted || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  playSuccessFanfare() {
    if (this.audioMuted || !this.audioCtx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.2), idx * 100);
    });
  }

  bindEvents() {
    // Steppers: buttons with data-param and data-delta
    document.querySelectorAll('.stepper-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const param = btn.dataset.param;
        const delta = parseInt(btn.dataset.delta, 10);
        const current = this.engine.getState()[param];
        const next = Math.max(0, current + delta);
        this.engine.set(param, next);
        this.playTone(delta > 0 ? 587 : 440, 'sine', 0.05);
        this.refresh();
      });
    });

    // Traffic slider
    if (this.dom.trafficSlider) {
      this.dom.trafficSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.engine.set('userDemandPct', val);
        this.refresh();
      });
    }

    // Challenge selector
    if (this.dom.challengeSelect) {
      this.dom.challengeSelect.addEventListener('change', (e) => {
        const selected = CHALLENGES.find(c => c.id === e.target.value);
        if (selected) {
          this.loadChallenge(selected);
        }
      });
    }

    // Reset button
    if (this.dom.resetBtn) {
      this.dom.resetBtn.addEventListener('click', () => {
        this.loadChallenge(this.currentChallenge);
        this.playTone(330, 'square', 0.1);
      });
    }

    // Mute button
    if (this.dom.muteBtn) {
      this.dom.muteBtn.addEventListener('click', () => {
        this.audioMuted = !this.audioMuted;
        this.dom.muteBtn.innerHTML = this.audioMuted 
          ? '🔇 Unmute' 
          : '🔊 Sound';
        this.dom.muteBtn.setAttribute('aria-label', this.audioMuted ? 'Unmute sounds' : 'Mute sounds');
      });
    }
  }

  loadChallenge(challenge) {
    this.currentChallenge = challenge;
    this.engine.setState({ ...challenge.initialState });
    this.challengeFinished = false;
    this.refresh();
  }

  refresh() {
    const sim = this.engine.evaluate();
    this.renderer.update(sim);
    this.updateControlsUI(sim);
    this.updateDashboardUI(sim);
    this.updateChallengeUI(sim);
  }

  updateControlsUI(sim) {
    const s = sim.inputs;
    if (this.dom.rackCount) this.dom.rackCount.textContent = s.serverRacks;
    if (this.dom.networkCount) this.dom.networkCount.textContent = s.networkLines;
    if (this.dom.airCount) this.dom.airCount.textContent = s.airCoolers;
    if (this.dom.waterCount) this.dom.waterCount.textContent = s.waterCoolers;
    if (this.dom.gridCount) this.dom.gridCount.textContent = s.gridLines;
    if (this.dom.solarCount) this.dom.solarCount.textContent = s.solarPanels;
    if (this.dom.trafficSlider) this.dom.trafficSlider.value = s.userDemandPct;
    if (this.dom.trafficDisplay) {
      let label = 'Normal Day';
      if (s.userDemandPct < 35) label = 'Night Lull';
      else if (s.userDemandPct > 80) label = 'Viral Rush!';
      this.dom.trafficDisplay.textContent = `${s.userDemandPct}% (${label})`;
    }
  }

  updateDashboardUI(sim) {
    // 1. Bottleneck Banner
    const b = sim.bottleneck;
    if (this.dom.bottleneckCard) {
      this.dom.bottleneckCard.className = `bottleneck-card severity-${b.severity}`;
      this.dom.bottleneckBadge.textContent = b.badge;
      this.dom.bottleneckTitle.textContent = b.title;
      this.dom.bottleneckDesc.textContent = b.description;
    }

    // 2. Throughput / Compute
    if (this.dom.throughputValue) {
      this.dom.throughputValue.textContent = `${sim.actualThroughput.toLocaleString()} ops/sec`;
    }
    if (this.dom.throughputBar) {
      const maxVisualCap = Math.max(2500, sim.rawComputeCapacity, sim.incomingTraffic);
      const fillPct = Math.min(100, Math.round((sim.actualThroughput / maxVisualCap) * 100));
      this.dom.throughputBar.style.width = `${fillPct}%`;
    }
    if (this.dom.throughputCompare) {
      this.dom.throughputCompare.textContent = 
        sim.actualThroughput > 0 
          ? `≈ Streaming ${sim.streamingMoviesEquivalent.toLocaleString()} movies at once`
          : `Data center is idle`;
    }

    // 3. Thermal Gauge
    if (this.dom.tempValue) {
      this.dom.tempValue.textContent = `${sim.serverTempC}°C`;
    }
    if (this.dom.tempBar) {
      // 20C to 100C normalized to 0-100%
      const tempPct = Math.min(100, Math.max(0, ((sim.serverTempC - 20) / 80) * 100));
      this.dom.tempBar.style.width = `${tempPct}%`;
      if (sim.serverTempC > 75) {
        this.dom.tempBar.style.backgroundColor = '#EF4444'; // Red
      } else if (sim.serverTempC > 55) {
        this.dom.tempBar.style.backgroundColor = '#F59E0B'; // Amber
      } else {
        this.dom.tempBar.style.backgroundColor = '#10B981'; // Green
      }
    }
    if (this.dom.tempStatus) {
      if (sim.isThrottled) {
        this.dom.tempStatus.textContent = `🔥 THROTTLED (-${Math.round((1 - sim.thermalThrottleFactor) * 100)}% Speed)`;
        this.dom.tempStatus.className = 'status-tag danger';
      } else if (sim.serverTempC > 55) {
        this.dom.tempStatus.textContent = 'Warm';
        this.dom.tempStatus.className = 'status-tag warning';
      } else {
        this.dom.tempStatus.textContent = 'Cool & Safe';
        this.dom.tempStatus.className = 'status-tag good';
      }
    }

    // 4. Power & Energy Footprint
    if (this.dom.powerMW) {
      this.dom.powerMW.textContent = `${sim.totalPowerMW} MW`;
    }
    if (this.dom.powerHomes) {
      this.dom.powerHomes.textContent = `≈ Powers ${sim.homesPoweredEquivalent.toLocaleString()} homes`;
    }
    if (this.dom.cleanEnergyTag) {
      this.dom.cleanEnergyTag.textContent = `${sim.cleanEnergyPct}% Solar Clean`;
      this.dom.cleanEnergyTag.className = sim.cleanEnergyPct >= 80 ? 'status-tag good' : 'status-tag neutral';
    }

    // 5. Water Consumption
    if (this.dom.waterGPD) {
      this.dom.waterGPD.textContent = `${sim.waterGallonsPerDay.toLocaleString()} gal/day`;
    }
    if (this.dom.waterPools) {
      this.dom.waterPools.textContent = `≈ ${sim.waterPoolsPerWeek} swimming pools/week`;
    }

    // 6. Land & Nature Footprint
    if (this.dom.landRemaining) {
      this.dom.landRemaining.textContent = `${sim.meadowRemainingPct}% Meadow Left`;
    }
    if (this.dom.treesCut) {
      this.dom.treesCut.textContent = `${sim.treesCutDown} trees cleared`;
    }
  }

  updateChallengeUI(sim) {
    if (!this.dom.challengeDesc) return;

    this.dom.challengeDesc.textContent = this.currentChallenge.description;

    let allCompleted = true;
    const goalsHtml = this.currentChallenge.goals.map(goal => {
      const isMet = goal.check(sim);
      if (!isMet) allCompleted = false;
      return `
        <li class="goal-item ${isMet ? 'completed' : 'pending'}">
          <span class="goal-icon">${isMet ? '✅' : '⚪'}</span>
          <span class="goal-text">${goal.label}</span>
        </li>
      `;
    }).join('');

    this.dom.challengeGoals.innerHTML = goalsHtml;

    if (allCompleted && !this.challengeFinished && this.currentChallenge.id !== 'sandbox') {
      this.challengeFinished = true;
      this.dom.challengeSuccessBanner.classList.remove('hidden');
      this.playSuccessFanfare();
    } else if (!allCompleted) {
      this.dom.challengeSuccessBanner.classList.add('hidden');
    }
  }
}
