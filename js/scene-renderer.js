/**
 * scene-renderer.js
 * 2D Canvas Animated Cartoony Data Center Visualizer.
 * Renders pristine nature transforming into an active data center campus.
 */

export class SceneRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.simData = null;

    // Animation state
    this.time = 0;
    this.clouds = [
      { x: 30, y: 35, speed: 0.15, scale: 0.9 },
      { x: 260, y: 20, speed: 0.22, scale: 1.1 },
      { x: 520, y: 45, speed: 0.18, scale: 0.75 },
      { x: 740, y: 25, speed: 0.12, scale: 1.0 }
    ];

    // Particle systems
    this.steamParticles = [];
    this.heatParticles = [];
    this.dataPackets = [];
    this.outboundPackets = [];
    this.birds = [
      { x: 100, y: 60, speed: 0.6, flap: 0 },
      { x: 130, y: 75, speed: 0.55, flap: 1.2 }
    ];

    // Static tree positions (deterministic for stability)
    this.treePositions = [
      { x: 40, y: 230, scale: 0.95 },
      { x: 85, y: 255, scale: 1.1 },
      { x: 125, y: 220, scale: 0.85 },
      { x: 170, y: 240, scale: 1.0 },
      { x: 230, y: 225, scale: 0.9 },
      { x: 280, y: 235, scale: 1.05 },
      { x: 340, y: 220, scale: 0.8 },
      { x: 420, y: 230, scale: 1.15 },
      { x: 480, y: 225, scale: 0.9 },
      { x: 550, y: 240, scale: 1.05 },
      { x: 620, y: 220, scale: 0.85 },
      { x: 680, y: 235, scale: 1.0 },
      { x: 730, y: 250, scale: 1.1 },
      { x: 770, y: 225, scale: 0.95 }
    ];

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = (rect.width || 800) * dpr;
    this.canvas.height = (rect.height || 450) * dpr;
    this.scaleX = this.canvas.width / 800;
    this.scaleY = this.canvas.height / 450;
  }

  update(simData) {
    this.simData = simData;
  }

  animate(timestamp) {
    this.time = timestamp * 0.001;
    this.render();
    requestAnimationFrame(this.animate);
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (!w || !h) return;

    ctx.save();
    ctx.scale(this.scaleX, this.scaleY);

    // 1. Sky & Sun
    this.renderSky(ctx);

    // 2. Distant Hills & Meadow Ground
    this.renderLandscape(ctx);

    // 3. Pristine River / Stream
    this.renderRiver(ctx);

    if (this.simData) {
      // 4. Solar Array Field (Left Meadow)
      this.renderSolarField(ctx);

      // 5. Power Grid Lines & Substation (Right Boundary)
      this.renderPowerInfrastructure(ctx);

      // 6. Network Fiber Trench & Data Packets (Lower edge)
      this.renderNetworkLine(ctx);

      // 7. Data Center Facility (Central cleared land)
      this.renderDataCenter(ctx);

      // 8. Trees (Clears dynamically as building & solar expand)
      this.renderTrees(ctx);

      // 9. Water Pipes & Steam Towers
      this.renderCoolingTowersAndPipes(ctx);

      // 10. Floating Status Badges / Alerts
      this.renderVisualAlerts(ctx);
    } else {
      this.renderTrees(ctx);
    }

    // 11. Drifting Clouds & Birds
    this.renderAtmosphere(ctx);

    ctx.restore();
  }

  renderSky(ctx) {
    // Soft sunny gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 260);
    skyGrad.addColorStop(0, '#68B7F7');
    skyGrad.addColorStop(0.65, '#B7E2FC');
    skyGrad.addColorStop(1, '#D9F2FF');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 800, 450);

    // Sun with warm glow
    ctx.beginPath();
    ctx.arc(710, 60, 36, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 238, 140, 0.4)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(710, 60, 24, 0, Math.PI * 2);
    ctx.fillStyle = '#FFE552';
    ctx.fill();
  }

  renderAtmosphere(ctx) {
    // Drifting clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    for (const c of this.clouds) {
      c.x += c.speed;
      if (c.x > 860) c.x = -80;

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.scale, c.scale);
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.arc(20, -6, 22, 0, Math.PI * 2);
      ctx.arc(42, 0, 18, 0, Math.PI * 2);
      ctx.arc(22, 8, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Flying birds in the sky
    ctx.strokeStyle = '#3A637B';
    ctx.lineWidth = 2;
    for (const b of this.birds) {
      b.x += b.speed;
      if (b.x > 840) b.x = -40;
      const flapY = Math.sin(this.time * 5 + b.flap) * 3;
      ctx.beginPath();
      ctx.moveTo(b.x - 8, b.y + flapY);
      ctx.quadraticCurveTo(b.x - 4, b.y - 4 + flapY, b.x, b.y + flapY);
      ctx.quadraticCurveTo(b.x + 4, b.y - 4 + flapY, b.x + 8, b.y + flapY);
      ctx.stroke();
    }
  }

  renderLandscape(ctx) {
    // Distant soft green hills
    ctx.fillStyle = '#83C97E';
    ctx.beginPath();
    ctx.moveTo(0, 240);
    ctx.bezierCurveTo(200, 190, 380, 260, 600, 205);
    ctx.bezierCurveTo(700, 180, 780, 210, 800, 220);
    ctx.lineTo(800, 450);
    ctx.lineTo(0, 450);
    ctx.fill();

    // Foreground lush meadow
    ctx.fillStyle = '#5FA857';
    ctx.beginPath();
    ctx.moveTo(0, 265);
    ctx.bezierCurveTo(260, 245, 520, 275, 800, 255);
    ctx.lineTo(800, 450);
    ctx.lineTo(0, 450);
    ctx.fill();
  }

  renderRiver(ctx) {
    // Winding sparkling river along the bottom edge
    ctx.fillStyle = '#3998D6';
    ctx.beginPath();
    ctx.moveTo(0, 410);
    ctx.bezierCurveTo(250, 395, 500, 425, 800, 405);
    ctx.lineTo(800, 450);
    ctx.lineTo(0, 450);
    ctx.fill();

    // River highlight shimmer
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const rx = (i * 200 + (this.time * 30)) % 800;
      const ry = 420 + Math.sin(this.time * 2 + i) * 6;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + 35, ry - 2);
      ctx.stroke();
    }
  }

  renderTrees(ctx) {
    const racks = this.simData ? this.simData.inputs.serverRacks : 0;
    const solar = this.simData ? this.simData.inputs.solarPanels : 0;
    
    // Buildings clear the center (x: 240 to 560)
    // Solar clears the left (x: 60 to 240)
    for (const tree of this.treePositions) {
      const inBuildingZone = racks > 0 && tree.x >= 230 && tree.x <= 570;
      const inSolarZone = solar > 3 && tree.x < 240;

      if (inBuildingZone || inSolarZone) continue; // Cleared!

      ctx.save();
      ctx.translate(tree.x, tree.y);
      ctx.scale(tree.scale, tree.scale);

      // Trunk
      ctx.fillStyle = '#734E2F';
      ctx.fillRect(-3, 0, 7, 24);

      // Leaves (Pine tree layers)
      ctx.fillStyle = '#2B7038';
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(-14, -2);
      ctx.lineTo(14, -2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#348643';
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(-17, 8);
      ctx.lineTo(17, 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#3D9E4E';
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.lineTo(-20, 18);
      ctx.lineTo(20, 18);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  renderSolarField(ctx) {
    const panels = this.simData.inputs.solarPanels;
    if (panels === 0) return;

    const startX = 60;
    const startY = 250;
    const cols = Math.min(panels, 5);
    const rows = Math.ceil(panels / 5);

    for (let i = 0; i < panels; i++) {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const px = startX + col * 32;
      const py = startY + row * 22;

      // Stand
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + 12, py + 16);
      ctx.lineTo(px + 12, py + 24);
      ctx.stroke();

      // Photovoltaic panel (angled)
      ctx.fillStyle = '#1B3B6F';
      ctx.strokeStyle = '#D9E8F5';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py + 6);
      ctx.lineTo(px + 24, py);
      ctx.lineTo(px + 24, py + 14);
      ctx.lineTo(px, py + 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Subtle solar gleam
      if ((i + Math.floor(this.time)) % 3 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(px + 6, py + 5, 8, 4);
      }
    }
  }

  renderPowerInfrastructure(ctx) {
    const lines = this.simData.inputs.gridLines;
    if (lines === 0) return;

    const poleX = 730;
    const poleY = 230;

    // Wooden utility pole
    ctx.fillStyle = '#5A3D28';
    ctx.fillRect(poleX - 4, poleY, 8, 120);

    // Cross arms
    ctx.fillRect(poleX - 22, poleY + 12, 44, 5);
    ctx.fillRect(poleX - 18, poleY + 28, 36, 5);

    // Insulators
    ctx.fillStyle = '#A8DADC';
    ctx.fillRect(poleX - 20, poleY + 7, 5, 6);
    ctx.fillRect(poleX + 15, poleY + 7, 5, 6);
    ctx.fillRect(poleX - 16, poleY + 23, 5, 6);
    ctx.fillRect(poleX + 11, poleY + 23, 5, 6);

    // Power cables stretching to building
    const buildingTargetX = this.simData.inputs.serverRacks > 0 ? 540 : 600;
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(poleX - 20, poleY + 10);
    ctx.quadraticCurveTo((poleX + buildingTargetX) / 2, poleY + 35, buildingTargetX, 260);
    ctx.stroke();

    // Electrical substation box
    ctx.fillStyle = '#8D99AE';
    ctx.fillRect(poleX - 35, poleY + 80, 24, 28);
    ctx.strokeStyle = '#2B2D42';
    ctx.strokeRect(poleX - 35, poleY + 80, 24, 28);

    // Warning lightning bolt decal
    ctx.fillStyle = '#FFE600';
    ctx.beginPath();
    ctx.moveTo(poleX - 22, poleY + 86);
    ctx.lineTo(poleX - 26, poleY + 95);
    ctx.lineTo(poleX - 22, poleY + 95);
    ctx.lineTo(poleX - 25, poleY + 104);
    ctx.lineTo(poleX - 18, poleY + 93);
    ctx.lineTo(poleX - 22, poleY + 93);
    ctx.closePath();
    ctx.fill();
  }

  renderNetworkLine(ctx) {
    const lines = this.simData.inputs.networkLines;
    if (lines === 0) return;

    const trenchY = 375;
    // 1. Dual fiber conduit trench along bottom edge
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, trenchY, 800, 10);

    // 2. Inbound Fiber Cable (Upper conduit: Sky Blue / Cyan)
    ctx.strokeStyle = '#0EA5E9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, trenchY + 3);
    ctx.lineTo(390, trenchY + 3);
    ctx.lineTo(390, 320); // Leads up into left side of data center
    ctx.stroke();

    // 3. Outbound Fiber Cable (Lower conduit: Neon Violet / Magenta)
    ctx.strokeStyle = '#C084FC';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(410, 320); // Leads down from right side of data center
    ctx.lineTo(410, trenchY + 7);
    ctx.lineTo(800, trenchY + 7);
    ctx.stroke();

    // Subtle edge labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('📥 REQUESTS ➔', 10, trenchY - 3);
    ctx.fillText('➔ RESPONSES 📤', 710, trenchY - 3);

    // ==========================================
    // 4. Inbound Packets (User Traffic In)
    // ==========================================
    const isBottleneck = this.simData.bottleneck.type === 'NETWORK_CHOKE';
    const inPacketColor = isBottleneck ? '#F59E0B' : '#00F5D4';
    const inSpeed = isBottleneck ? 45 : 120;

    // Inbound traffic spawns based on demand
    const inSpawnChance = Math.min(0.45, (this.simData.incomingTraffic / 3000) * 0.35 + 0.1);
    if (Math.random() < inSpawnChance) {
      this.dataPackets.push({ progress: 0 });
    }

    ctx.fillStyle = inPacketColor;
    for (let i = this.dataPackets.length - 1; i >= 0; i--) {
      const p = this.dataPackets[i];
      p.progress += (inSpeed * 0.016);

      // Track 1: Horizontal x: 0 -> 390
      // Track 2: Vertical y: (trenchY + 3) -> 320 (height = 58px)
      if (p.progress <= 390) {
        ctx.beginPath();
        ctx.arc(p.progress, trenchY + 3, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const vertProgress = p.progress - 390;
        const upY = (trenchY + 3) - vertProgress;
        if (upY >= 320) {
          ctx.beginPath();
          ctx.arc(390, upY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (p.progress > 450) {
        this.dataPackets.splice(i, 1);
      }
    }

    // ==========================================
    // 5. Outbound Packets (Processed Responses Out)
    // ==========================================
    const throughput = this.simData.actualThroughput;
    const isPowered = throughput > 0 && !this.simData.isBlackout;

    // Outbound packets only spawn if servers are actively computing work!
    if (isPowered) {
      const outSpawnChance = Math.min(0.45, (throughput / 3000) * 0.35 + 0.08);
      if (Math.random() < outSpawnChance) {
        this.outboundPackets.push({ progress: 0 });
      }
    }

    const outSpeed = 120;
    const outColor = '#F472B6'; // Neon pink / magenta response glow

    ctx.fillStyle = outColor;
    for (let j = this.outboundPackets.length - 1; j >= 0; j--) {
      const op = this.outboundPackets[j];
      op.progress += (outSpeed * 0.016);

      // Track 1: Vertical y: 320 -> (trenchY + 7) (dist = 62px)
      // Track 2: Horizontal x: 410 -> 800 (dist = 390px)
      const vertDist = (trenchY + 7) - 320;
      if (op.progress <= vertDist) {
        const downY = 320 + op.progress;
        ctx.beginPath();
        ctx.arc(410, downY, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const horizProgress = op.progress - vertDist;
        const curX = 410 + horizProgress;
        if (curX <= 800) {
          ctx.beginPath();
          ctx.arc(curX, trenchY + 7, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (op.progress > vertDist + 400) {
        this.outboundPackets.splice(j, 1);
      }
    }
  }

  renderDataCenter(ctx) {
    const racks = this.simData.inputs.serverRacks;
    if (racks === 0) return; // Pristine meadow!

    // Facility dimensions scale with rack count
    const minWidth = 140;
    const maxWidth = 340;
    const width = Math.min(maxWidth, minWidth + (racks * 8));
    const height = 130;
    const centerX = 400;
    const bx = centerX - (width / 2);
    const by = 210;

    // 1. Concrete foundation slab
    ctx.fillStyle = '#6C757D';
    ctx.fillRect(bx - 12, by + height - 10, width + 24, 24);
    ctx.strokeStyle = '#495057';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx - 12, by + height - 10, width + 24, 24);

    // 2. Building Main Shell (Modern Sleek Data Hall)
    ctx.fillStyle = '#E9ECEF';
    ctx.fillRect(bx, by, width, height);
    ctx.strokeStyle = '#ADB5BD';
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, by, width, height);

    // Roof parapet
    ctx.fillStyle = '#495057';
    ctx.fillRect(bx - 4, by - 6, width + 8, 10);

    // 3. Cutaway Window / Glass Wall to see Server Racks inside
    const windowX = bx + 14;
    const windowY = by + 22;
    const windowW = width - 28;
    const windowH = height - 36;

    // Interior server room glow
    const temp = this.simData.serverTempC;
    let roomBg = '#1E293B';
    if (this.simData.isBlackout) roomBg = '#0F172A';
    else if (temp > 75) roomBg = '#3B1E1E'; // Hot reddish room
    else if (temp > 55) roomBg = '#3B2E1E'; // Warm amber

    ctx.fillStyle = roomBg;
    ctx.fillRect(windowX, windowY, windowW, windowH);

    // Glass reflection effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(windowX, windowY);
    ctx.lineTo(windowX + 45, windowY);
    ctx.lineTo(windowX + 15, windowY + windowH);
    ctx.lineTo(windowX, windowY + windowH);
    ctx.closePath();
    ctx.fill();

    // 4. Server Racks inside
    this.renderServerRacks(ctx, windowX, windowY, windowW, windowH, racks);

    // 5. Heat Shimmer effect if servers are hot
    if (temp > 60 && !this.simData.isBlackout) {
      this.renderHeatWaves(ctx, windowX, windowY, windowW, windowH, temp);
    }

    // 6. Rooftop Air Coolers
    this.renderAirCoolers(ctx, bx, by, width);
  }

  renderServerRacks(ctx, wx, wy, ww, wh, rackCount) {
    const visibleRacks = Math.min(16, rackCount);
    const rackW = Math.max(12, Math.floor((ww - (visibleRacks * 4)) / visibleRacks));
    const rackH = wh - 12;
    const startX = wx + 6;

    const isBlackout = this.simData.isBlackout;
    const temp = this.simData.serverTempC;
    const maxPowered = this.simData.maxPoweredRacks;

    for (let i = 0; i < visibleRacks; i++) {
      const rx = startX + i * (rackW + 4);
      const ry = wy + 6;
      const isPowered = i < maxPowered && !isBlackout;

      // Server rack chassis
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(rx, ry, rackW, rackH);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(rx, ry, rackW, rackH);

      // Blinking LEDs
      if (isPowered) {
        const slots = 6;
        for (let s = 0; s < slots; s++) {
          const ledY = ry + 6 + (s * ((rackH - 12) / slots));
          let ledColor = '#10B981'; // Green normal

          if (temp > 75) {
            // Rapid blink red
            ledColor = Math.floor(this.time * 8 + i + s) % 2 === 0 ? '#EF4444' : '#7F1D1D';
          } else if (this.simData.bottleneck.type === 'NETWORK_CHOKE') {
            // Blue idle / waiting for network
            ledColor = '#38BDF8';
          } else {
            // Activity blink
            const blink = Math.floor(this.time * 4 + (i * 2) + s) % 3 !== 0;
            ledColor = blink ? '#10B981' : '#047857';
          }

          ctx.fillStyle = ledColor;
          ctx.fillRect(rx + 2, ledY, Math.max(3, rackW - 4), 2.5);
        }
      } else {
        // Dark unpowered racks
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(rx + 2, ry + 4, rackW - 4, rackH - 8);
      }
    }
  }

  renderAirCoolers(ctx, bx, by, width) {
    const airCount = this.simData.inputs.airCoolers;
    if (airCount === 0) return;

    const visibleFans = Math.min(6, airCount);
    const spacing = width / (visibleFans + 1);

    for (let i = 0; i < visibleFans; i++) {
      const fx = bx + (i + 1) * spacing;
      const fy = by - 14;

      // Metal AC housing
      ctx.fillStyle = '#CED4DA';
      ctx.fillRect(fx - 12, fy, 24, 14);
      ctx.strokeStyle = '#6C757D';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(fx - 12, fy, 24, 14);

      // Spinning Fan blades
      const spin = this.time * 15;
      ctx.save();
      ctx.translate(fx, fy + 7);
      ctx.rotate(spin);
      ctx.fillStyle = '#495057';
      ctx.fillRect(-8, -1.5, 16, 3);
      ctx.fillRect(-1.5, -8, 3, 16);
      ctx.restore();
    }
  }

  renderCoolingTowersAndPipes(ctx) {
    const waterCount = this.simData.inputs.waterCoolers;
    if (waterCount === 0) return;

    // Place water cooling towers on the right side of data center
    const towerX = 575;
    const towerY = 230;
    const visibleTowers = Math.min(3, waterCount);

    for (let i = 0; i < visibleTowers; i++) {
      const tx = towerX + (i * 38);

      // Hyperbolic / cylindrical cooling tower
      ctx.fillStyle = '#D6D6D6';
      ctx.beginPath();
      ctx.moveTo(tx - 12, towerY + 70);
      ctx.lineTo(tx - 9, towerY + 25);
      ctx.lineTo(tx + 9, towerY + 25);
      ctx.lineTo(tx + 12, towerY + 70);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#8E9AAF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Top rim
      ctx.fillStyle = '#6C757D';
      ctx.fillRect(tx - 10, towerY + 22, 20, 4);

      // Animated steam puffing out the top!
      if (Math.random() < 0.2) {
        this.steamParticles.push({
          x: tx + (Math.random() * 8 - 4),
          y: towerY + 20,
          radius: 5,
          alpha: 0.65,
          vx: Math.random() * 0.4 - 0.2,
          vy: -(0.6 + Math.random() * 0.5)
        });
      }
    }

    // Water intake pipes going into the river below
    ctx.strokeStyle = '#023E8A';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(towerX + 15, towerY + 70);
    ctx.lineTo(towerX + 15, 415);
    ctx.stroke();

    // Render active steam particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = this.steamParticles.length - 1; i >= 0; i--) {
      const sp = this.steamParticles[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.radius += 0.2;
      sp.alpha -= 0.012;

      if (sp.alpha <= 0) {
        this.steamParticles.splice(i, 1);
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${sp.alpha})`;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  renderHeatWaves(ctx, wx, wy, ww, wh, temp) {
    const waveCount = Math.min(8, Math.floor((temp - 50) / 5));
    ctx.strokeStyle = temp > 75 ? 'rgba(239, 68, 68, 0.45)' : 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 2;

    for (let i = 0; i < waveCount; i++) {
      const hx = wx + 15 + (i * ((ww - 30) / waveCount));
      const phase = this.time * 6 + i;
      ctx.beginPath();
      ctx.moveTo(hx, wy + wh - 10);
      for (let y = wy + wh - 10; y > wy + 5; y -= 10) {
        const offset = Math.sin((y * 0.08) + phase) * 4;
        ctx.lineTo(hx + offset, y);
      }
      ctx.stroke();
    }
  }

  renderVisualAlerts(ctx) {
    const b = this.simData.bottleneck;
    if (!b || b.type === 'EMPTY' || b.type === 'HEALTHY' || b.type === 'LOW_DEMAND') return;

    // Draw floating warning badge above data center
    const alertX = 400;
    const alertY = 175;
    const pulse = Math.sin(this.time * 8) * 3;

    ctx.save();
    ctx.translate(alertX, alertY + pulse);

    let bgColor = '#F59E0B'; // Amber warning
    if (b.severity === 'danger') bgColor = '#EF4444'; // Red danger

    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(-70, -14, 140, 28, 14);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.badge, 0, 0);

    ctx.restore();
  }
}
