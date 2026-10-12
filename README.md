# 🏢⚡ Data Center Impact Simulator

An interactive, browser-based educational game designed for middle school students (~ages 11–14) to explore the real-world requirements and environmental impacts of data centers and modern cloud computing.

Hosted freely via **GitHub Pages** with zero backend, zero installation, and no login required.

---

## 🌟 Overview & Pedagogical Purpose

When we stream video, play online games, or query artificial intelligence, physical computers in massive data centers are doing the work. But scaling compute capacity comes with real physical trade-offs:
- **Electricity / Power**: Where does the energy come from, and how many homes does that equal?
- **Water Consumption**: Water cooling keeps chips cold efficiently, but can evaporate thousands of gallons of water per day.
- **Land & Nature**: Expanding data halls and building solar farms clears meadows and forests.
- **Bottlenecks**: Why is a server sitting idle? Is it waiting for network fiber, starved of electricity, or thermally throttled from extreme heat?

---

## 🎮 How to Play

1. **Start with Pristine Nature**: You begin with an undisturbed meadow, trees, and a river.
2. **Add Server Racks**: Watch the building appear and trees clear as servers start computing.
3. **Diagnose Bottlenecks**:
   - **Internet Traffic Jam**: If you have 10 racks but only 1 network line, servers sit idle waiting for work! Add **Fiber Lines**.
   - **Overheating Meltdown**: As servers work at 100%, temperatures climb into the red zone (>75°C), triggering automatic speed throttling. Add **Air Coolers** or **Water Cooling Towers**.
   - **Power Blackout**: If power demand exceeds supply, servers shut down. Add **Grid Lines** or **Solar Panels**.
4. **Evaluate Trade-Offs**:
   - *Water Cooling*: Powerful cooling, but drinks river water (gallons/day).
   - *Air Cooling*: Consumes zero water, but requires lots of electricity to spin giant rooftop fans.
   - *Solar Energy*: 100% clean and renewable, but arrays take up large amounts of meadowland.

---

## 🎯 Educational Quests Included

- **Free Exploration (Sandbox)**: Experiment with any combination of servers, cooling, and power.
- **Quest 1: Viral App Launch**: Fix an internet traffic jam and prevent thermal throttling while scaling to support 25,000+ active users.
- **Quest 2: Drought in the Valley**: Handle 20,000 active users (2,000 ops/sec) with zero water consumption (water coolers = 0).
- **Quest 3: 100% Clean Green Cloud**: Disconnect from the city power grid and run a stable data center entirely on solar panels.

---

## 🚀 Running Locally or in the Classroom

Because the simulator uses pure static web technologies (HTML5 Canvas, CSS3, and modern ES6 JavaScript), there are no build steps or node packages required!

### Option A: Local Python Web Server
Open a terminal in this directory and run:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in any web browser.

### Option B: Free GitHub Pages Hosting
1. Push this repository to GitHub on the `main` branch.
2. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment**, select **GitHub Actions** (the included `.github/workflows/deploy.yml` will automatically build and publish).
   - Alternatively, select **Deploy from a branch** > branch `main` / `root`.
3. Your game is now live at `https://<your-username>.github.io/<repo-name>/`!

---

## 🛠️ Project Structure

```
data-center-sim/
├── index.html              # Main responsive web page layout
├── css/
│   ├── style.css           # Modern clean styling, card layouts, gauges
│   └── animations.css      # CSS keyframes & effects
├── js/
│   ├── sim-engine.js       # Mathematical model (compute, network, power, cooling, land, water)
│   ├── scene-renderer.js   # 2D Canvas animated renderer (forest -> data center, steam, heat, packets)
│   ├── ui-controller.js    # Binds steppers & telemetry, Web Audio synthesizer effects
│   ├── challenges.js       # Quest definitions & completion checks
│   └── main.js             # Bootstrap entry point
├── .github/workflows/
│   └── deploy.yml          # Automated GitHub Pages action
└── README.md               # Documentation and classroom guide
```

---

## 📄 License
MIT License. Free to use, modify, and distribute for schools, classrooms, and educational programs.
