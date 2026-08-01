# Weather Intelligence App

A web application built using Google AI Studio App Build that provides real-time weather forecasts, visual trends, and planning recommendations using the Open-Meteo public APIs.

---

## 🛠️ Build and Deployment Workflow

### 1. App Generation (Google AI Studio)
* Generated the core React/Vite application using **Google AI Studio App Build**.
* Configured the app to use public Open-Meteo APIs for geocoding and forecast data.
* Ensured strict compliance: No Gemini API keys, Firebase projects, or GCP secret management were used.

### 2. Exporting Code to GitHub
1. In Google AI Studio, navigated to the direct **GitHub export/connection feature**.
2. Authenticated and selected the target corporate GitHub repository.
3. Pushed the generated source code directly from AI Studio into the main branch of the repository.

### 3. Deploying to Cloudflare Pages
1. Logged into **Cloudflare** and navigated to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Authorized Cloudflare to access the GitHub repository.
3. Configured the build settings:
   * **Framework preset:** Vite / React
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
4. Clicked **Save and Deploy**. Cloudflare automatically built the project and generated the live `*.pages.dev` deployment URL.

---

## 🧪 Validating Features & Testing

### API Integration
* **Geocoding API:** `https://geocoding-api.open-meteo.com/v1/search` (Converts city names to lat/long coordinates)
* **Forecast API:** `https://api.open-meteo.com/v1/forecast` (Fetches live weather conditions, 7-day forecast, and metrics)

### Verification Steps
* **Valid Search 1:** Searched "London" — Successfully rendered current weather, 7-day cards, and charts.
* **Valid Search 2:** Searched "Tokyo" — Successfully rendered updated metrics and planning recommendations.
* **Invalid Search Test:** Searched "xyz123" — Gracefully caught empty API results and displayed an error state message.
