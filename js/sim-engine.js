/**
 * sim-engine.js
 * Core mathematical engine and state evaluation for the Data Center Simulation.
 * Designed for middle-school educational clarity and real-world trade-off dynamics.
 */

export class SimEngine {
  constructor(initialState = {}) {
    this.state = {
      serverRacks: initialState.serverRacks ?? 0,
      networkLines: initialState.networkLines ?? 1,
      airCoolers: initialState.airCoolers ?? 0,
      waterCoolers: initialState.waterCoolers ?? 0,
      gridLines: initialState.gridLines ?? 1,
      solarPanels: initialState.solarPanels ?? 0,
      userDemandPct: initialState.userDemandPct ?? 75, // 0 - 100%
      ...initialState
    };

    // Constants & conversion factors
    this.CONSTANTS = {
      COMPUTE_PER_RACK: 250,        // queries / sec per rack at full capacity
      NETWORK_PER_LINE: 600,        // queries / sec supported per fiber line
      RACK_POWER_KW: 35,            // electricity used per active rack
      IDLE_RACK_POWER_KW: 10,       // electricity used even when idle
      BASE_FACILITY_KW: 20,         // facility lighting, switches, base load
      GRID_POWER_PER_LINE_KW: 250,  // power provided per grid line
      SOLAR_POWER_PER_PANEL_KW: 40, // clean power provided per solar array
      AIR_COOLER_HEAT_CAPACITY: 250,// thermal units dissipated per air cooler
      AIR_COOLER_POWER_KW: 30,      // air coolers consume substantial electricity
      AIR_COOLER_WATER_GPH: 0,      // air coolers do not consume water
      WATER_COOLER_HEAT_CAPACITY: 750, // water coolers dissipate massive heat
      WATER_COOLER_POWER_KW: 6,     // water coolers use minimal electricity (pumps only)
      WATER_COOLER_WATER_GPH: 140,  // gallons of water evaporated per hour
      BASE_AMBIENT_TEMP_C: 22,      // normal room temp in Celsius
      MAX_SAFE_TEMP_C: 75,          // throttle kicks in above this temperature
      CRITICAL_TEMP_C: 95,          // extreme thermal throttle
      TREE_DENSITY_PER_ACRE: 45,    // trees in pristine forest
      HOMES_EQUIVALENT_PER_MW: 750, // homes powered by 1 Megawatt
      GALLONS_PER_POOL: 20000,      // standard neighborhood swimming pool size
      ACTIVE_USERS_PER_QUERY_SEC: 10, // each active online user generates ~0.1 req/sec (~1 every 10s) on average
    };
  }

  // Update a single control parameter
  set(param, value) {
    if (param in this.state) {
      this.state[param] = Math.max(0, Number(value));
    }
    return this.evaluate();
  }

  // Set multiple state values at once
  setState(newState) {
    Object.assign(this.state, newState);
    return this.evaluate();
  }

  getState() {
    return { ...this.state };
  }

  /**
   * Evaluates the entire simulation balance and returns comprehensive metrics.
   */
  evaluate() {
    const s = this.state;
    const C = this.CONSTANTS;

    // 1. Raw potential compute capacity
    const rawComputeCapacity = s.serverRacks * C.COMPUTE_PER_RACK;

    // 2. Network throughput capacity
    const networkCapacity = s.networkLines * C.NETWORK_PER_LINE;

    // 3. User demand (work attempting to reach the data center)
    // Scaled against compute capacity or a baseline so kids can stress-test
    const baselineMaxDemand = Math.max(1000, rawComputeCapacity * 1.2);
    const incomingTraffic = Math.round((s.userDemandPct / 100) * baselineMaxDemand);

    // 4. Power supply
    const gridPowerKW = s.gridLines * C.GRID_POWER_PER_LINE_KW;
    const solarPowerKW = s.solarPanels * C.SOLAR_POWER_PER_PANEL_KW;
    const totalPowerAvailableKW = gridPowerKW + solarPowerKW;

    // 5. Baseline cooling power requirements
    const coolingPowerKW = (s.airCoolers * C.AIR_COOLER_POWER_KW) + 
                           (s.waterCoolers * C.WATER_COOLER_POWER_KW);

    // Check power availability for servers
    const baseRequiredKW = (s.serverRacks > 0 ? C.BASE_FACILITY_KW : 0) + coolingPowerKW;
    let powerForServersKW = Math.max(0, totalPowerAvailableKW - baseRequiredKW);

    // Maximum racks that can actually turn on given power
    const maxPoweredRacks = Math.min(s.serverRacks, Math.floor(powerForServersKW / C.RACK_POWER_KW));
    const powerDeficit = totalPowerAvailableKW < (baseRequiredKW + (s.serverRacks * C.RACK_POWER_KW));
    const isBlackout = s.serverRacks > 0 && maxPoweredRacks === 0;

    // 6. Network bottleneck check: how much traffic can enter?
    const trafficAllowedByNetwork = Math.min(incomingTraffic, networkCapacity);

    // 7. Unthrottled active compute given powered racks and traffic
    const activePoweredCompute = Math.min(
      trafficAllowedByNetwork,
      maxPoweredRacks * C.COMPUTE_PER_RACK
    );

    // 8. Thermal & Cooling balance
    // Heat is proportional to work performed plus idling servers
    const idlePoweredRacks = Math.max(0, maxPoweredRacks - (activePoweredCompute / C.COMPUTE_PER_RACK));
    const heatProduced = (activePoweredCompute * 0.5) + (idlePoweredRacks * 20);
    const coolingCapacity = (s.airCoolers * C.AIR_COOLER_HEAT_CAPACITY) + 
                            (s.waterCoolers * C.WATER_COOLER_HEAT_CAPACITY);

    // Server temperature estimation
    let serverTempC = C.BASE_AMBIENT_TEMP_C;
    if (s.serverRacks > 0 && maxPoweredRacks > 0) {
      if (coolingCapacity === 0) {
        serverTempC = C.CRITICAL_TEMP_C; // 95°C if no cooling at all
      } else if (coolingCapacity >= heatProduced) {
        // Well-cooled: between 25°C and 47°C
        const loadRatio = heatProduced / Math.max(1, coolingCapacity);
        serverTempC = 25 + (loadRatio * 22);
      } else {
        // Under-cooled: between 48°C and 95°C based on cooling deficit
        const deficitRatio = (heatProduced - coolingCapacity) / heatProduced;
        serverTempC = 48 + (deficitRatio * 47);
      }
    }
    serverTempC = Math.round(serverTempC);

    // Thermal throttling calculation
    let thermalThrottleFactor = 1.0;
    if (serverTempC > C.MAX_SAFE_TEMP_C) {
      // Linear penalty: drops to 0.3 at critical temperature
      const tempRange = C.CRITICAL_TEMP_C - C.MAX_SAFE_TEMP_C;
      const excessTemp = Math.min(tempRange, serverTempC - C.MAX_SAFE_TEMP_C);
      thermalThrottleFactor = 1.0 - (excessTemp / tempRange) * 0.7; // down to 30% performance
    }

    // 9. Actual throughput achieved
    const actualThroughput = Math.round(activePoweredCompute * thermalThrottleFactor);

    // 10. Actual power consumed
    const activeRacksEquivalent = actualThroughput / C.COMPUTE_PER_RACK;
    const actualServerPowerKW = (activeRacksEquivalent * C.RACK_POWER_KW) + 
                                ((maxPoweredRacks - activeRacksEquivalent) * C.IDLE_RACK_POWER_KW);
    const totalPowerConsumedKW = s.serverRacks > 0 
      ? Math.round(C.BASE_FACILITY_KW + coolingPowerKW + actualServerPowerKW) 
      : 0;

    const totalPowerMW = +(totalPowerConsumedKW / 1000).toFixed(2);
    const homesPoweredEquivalent = Math.round(totalPowerMW * C.HOMES_EQUIVALENT_PER_MW);

    // 11. Water consumption
    const waterGPH = s.waterCoolers * C.WATER_COOLER_WATER_GPH;
    const waterGallonsPerDay = Math.round(waterGPH * 24);
    const waterPoolsPerWeek = +(waterGallonsPerDay * 7 / C.GALLONS_PER_POOL).toFixed(1);

    // 12. Land & Nature footprint
    // 0.2 acre base building + 0.04 acre per rack + 0.08 acre per solar array
    let landAcresUsed = 0;
    if (s.serverRacks > 0 || s.solarPanels > 0 || s.gridLines > 0) {
      landAcresUsed = 0.2 + (s.serverRacks * 0.04) + (s.solarPanels * 0.08) + (s.gridLines * 0.05);
    }
    landAcresUsed = +(landAcresUsed).toFixed(2);
    const maxMeadowAcres = 5.0;
    const meadowRemainingPct = Math.max(0, Math.round(((maxMeadowAcres - landAcresUsed) / maxMeadowAcres) * 100));
    const treesCutDown = Math.round(Math.min(maxMeadowAcres, landAcresUsed) * C.TREE_DENSITY_PER_ACRE);

    // 13. Clean energy percentage
    const cleanEnergyPct = totalPowerConsumedKW > 0 
      ? Math.min(100, Math.round((solarPowerKW / totalPowerConsumedKW) * 100))
      : 0;

    // 14. Server Utilization Rate (0% - 100%)
    const serverUtilizationPct = rawComputeCapacity > 0 
      ? Math.min(100, Math.round((actualThroughput / rawComputeCapacity) * 100))
      : 0;

    // 15. Primary Bottleneck Identification
    let bottleneck = {
      type: 'HEALTHY',
      title: 'Running Smoothly',
      description: 'Your data center is well-balanced and handling traffic cleanly!',
      severity: 'good', // 'good', 'warning', 'danger'
      badge: 'Balanced'
    };

    if (s.serverRacks === 0) {
      bottleneck = {
        type: 'EMPTY',
        title: 'Empty Meadow',
        description: 'No server racks built yet. Add racks to start serving internet traffic!',
        severity: 'neutral',
        badge: 'No Servers'
      };
    } else if (isBlackout) {
      bottleneck = {
        type: 'BLACKOUT',
        title: 'Power Outage!',
        description: 'Not enough electricity from the power grid or solar panels to start the servers!',
        severity: 'danger',
        badge: '⚡ Power Deficit'
      };
    } else if (powerDeficit) {
      bottleneck = {
        type: 'POWER_DEFICIT',
        title: 'Electricity Shortage',
        description: `Only ${maxPoweredRacks} of your ${s.serverRacks} server racks have enough electricity to turn on. Add more grid lines or solar panels!`,
        severity: 'warning',
        badge: '⚡ Power Limited'
      };
    } else if (serverTempC > C.MAX_SAFE_TEMP_C) {
      bottleneck = {
        type: 'OVERHEATING',
        title: 'Thermal Overheating!',
        description: `Servers are running at ${serverTempC}°C! Emergency safety throttles slowed performance down by ${Math.round((1 - thermalThrottleFactor) * 100)}%. Add air or water cooling immediately!`,
        severity: 'danger',
        badge: '🔥 Overheating'
      };
    } else if (networkCapacity < incomingTraffic && networkCapacity < rawComputeCapacity) {
      bottleneck = {
        type: 'NETWORK_CHOKE',
        title: 'Internet Traffic Jam',
        description: `Your server racks have idle power, but data packets are stuck because your fiber network cables are too thin! Add network fiber lines.`,
        severity: 'warning',
        badge: '🌐 Network Bottleneck'
      };
    } else if (rawComputeCapacity < incomingTraffic) {
      bottleneck = {
        type: 'COMPUTE_MAXED',
        title: 'Server Compute Maxed Out',
        description: `All your servers are working at 100% capacity! Add more server racks to handle the incoming rush of users.`,
        severity: 'warning',
        badge: '💻 Compute Saturated'
      };
    } else if (incomingTraffic < rawComputeCapacity * 0.4) {
      bottleneck = {
        type: 'LOW_DEMAND',
        title: 'Servers Waiting (Low Traffic)',
        description: `You have lots of server capacity, but not enough people are visiting right now. Increase traffic demand to test your limits!`,
        severity: 'good',
        badge: '💤 Idle Headroom'
      };
    }

    return {
      inputs: { ...s },
      // Compute & Traffic
      rawComputeCapacity,
      incomingTraffic,
      actualThroughput,
      demandMetPct: incomingTraffic > 0 ? Math.min(100, Math.round((actualThroughput / incomingTraffic) * 100)) : 100,
      serverUtilizationPct,
      activeUsersEquivalent: Math.round(actualThroughput * C.ACTIVE_USERS_PER_QUERY_SEC),
      
      // Power
      gridPowerKW,
      solarPowerKW,
      totalPowerAvailableKW,
      totalPowerConsumedKW,
      totalPowerMW,
      homesPoweredEquivalent,
      cleanEnergyPct,
      powerDeficit,
      isBlackout,
      maxPoweredRacks,

      // Cooling & Heat
      coolingPowerKW,
      heatProduced: Math.round(heatProduced),
      coolingCapacity: Math.round(coolingCapacity),
      serverTempC,
      thermalThrottleFactor,
      isThrottled: thermalThrottleFactor < 0.99,

      // Water
      waterGPH,
      waterGallonsPerDay,
      waterPoolsPerWeek,

      // Land & Environment
      landAcresUsed,
      meadowRemainingPct,
      treesCutDown,

      // Diagnostics
      bottleneck
    };
  }
}
