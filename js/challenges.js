/**
 * challenges.js
 * Guided scenarios and educational quests for students.
 */

export const CHALLENGES = [
  {
    id: 'sandbox',
    title: 'Free Exploration (Sandbox)',
    difficulty: 'Any',
    badge: 'Open Ended',
    description: 'Experiment freely! Add racks, test network limits, watch heat rise, and see real-time environmental footprints.',
    initialState: {
      serverRacks: 0,
      networkLines: 1,
      airCoolers: 0,
      waterCoolers: 0,
      gridLines: 1,
      solarPanels: 0,
      userDemandPct: 75
    },
    goals: [
      {
        id: 'build_first_rack',
        label: 'Build your first server rack',
        check: (sim) => sim.inputs.serverRacks >= 1
      },
      {
        id: 'prevent_overheat',
        label: 'Keep servers cool below 70°C',
        check: (sim) => sim.inputs.serverRacks > 0 && sim.serverTempC <= 70
      },
      {
        id: 'handle_traffic',
        label: 'Achieve at least 1,000 queries/sec throughput',
        check: (sim) => sim.actualThroughput >= 1000
      }
    ],
    hint: 'Start by adding a few server racks, then make sure you have enough network lines and cooling to support them!'
  },
  {
    id: 'streaming_launch',
    title: 'Quest 1: Streaming Launch Party',
    difficulty: 'Beginner',
    badge: 'Balance 101',
    description: 'A hit new multiplayer game just launched! Build a data center capable of handling at least 2,500 queries/second without burning up or stalling.',
    initialState: {
      serverRacks: 12,
      networkLines: 1,
      airCoolers: 0,
      waterCoolers: 0,
      gridLines: 2,
      solarPanels: 0,
      userDemandPct: 100
    },
    goals: [
      {
        id: 'fix_network_choke',
        label: 'Clear the network traffic jam (add fiber lines)',
        check: (sim) => sim.bottleneck.type !== 'NETWORK_CHOKE'
      },
      {
        id: 'prevent_throttling',
        label: 'Stop thermal throttling (keep temp under 70°C)',
        check: (sim) => !sim.isThrottled && sim.serverTempC <= 70
      },
      {
        id: 'reach_throughput',
        label: 'Achieve at least 2,500 queries/sec',
        check: (sim) => sim.actualThroughput >= 2500
      }
    ],
    hint: 'Notice how your 12 server racks are waiting idle because the single fiber line is choking traffic. Add network lines, then watch out for the heat surge!'
  },
  {
    id: 'drought_valley',
    title: 'Quest 2: Drought in the Valley',
    difficulty: 'Intermediate',
    badge: 'Water Conservation',
    description: 'The local river is low and the town has strict water restrictions! Handle at least 2,000 queries/sec with ZERO water cooler towers (water consumption = 0 gal/hr).',
    initialState: {
      serverRacks: 10,
      networkLines: 4,
      airCoolers: 0,
      waterCoolers: 2,
      gridLines: 2,
      solarPanels: 0,
      userDemandPct: 80
    },
    goals: [
      {
        id: 'zero_water',
        label: 'Remove all water coolers (0 gal/hr water usage)',
        check: (sim) => sim.inputs.waterCoolers === 0 && sim.waterGPH === 0
      },
      {
        id: 'replace_with_air',
        label: 'Cool servers with Air Coolers (keep temp ≤ 70°C)',
        check: (sim) => sim.inputs.airCoolers > 0 && sim.serverTempC <= 70
      },
      {
        id: 'supply_power',
        label: 'Supply enough electricity for racks & power-hungry fans',
        check: (sim) => !sim.powerDeficit && sim.actualThroughput >= 2000
      }
    ],
    hint: 'Air coolers don\'t drink any water, but they require much more electricity to spin giant fans. You may need to add extra grid lines or solar panels!'
  },
  {
    id: 'green_cloud',
    title: 'Quest 3: 100% Clean Green Cloud',
    difficulty: 'Advanced',
    badge: 'Renewables & Land',
    description: 'The town wants a fully green data center. Disconnect completely from the fossil-fuel grid (0 grid lines) and run entirely on Solar Panels while handling 1,500+ queries/sec!',
    initialState: {
      serverRacks: 8,
      networkLines: 3,
      airCoolers: 1,
      waterCoolers: 1,
      gridLines: 2,
      solarPanels: 0,
      userDemandPct: 75
    },
    goals: [
      {
        id: 'zero_grid',
        label: 'Disconnect from city grid (0 Grid Lines)',
        check: (sim) => sim.inputs.gridLines === 0
      },
      {
        id: '100_clean',
        label: 'Power 100% of the facility with Solar Panels',
        check: (sim) => sim.cleanEnergyPct >= 99 && !sim.powerDeficit
      },
      {
        id: 'deliver_performance',
        label: 'Deliver at least 1,500 queries/second stably',
        check: (sim) => sim.actualThroughput >= 1500
      }
    ],
    hint: 'Solar panels are clean and renewable, but each array takes up land in the meadow. Watch your land meter as you place enough panels to power your servers and cooling!'
  }
];
