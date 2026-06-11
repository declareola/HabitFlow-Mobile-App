export const Config = {
  apiBaseUrl: process.env.NODE_ENV === "production" 
    ? "/api" 
    : "http://localhost:3000/api",
  defaultFocusDuration: 25, // minutes
  soundscapes: [
    { id: "rain", name: "Rainforest Rain", url: "rain" },
    { id: "waves", name: "Ocean Waves", url: "waves" },
    { id: "ambient", name: "Deep Ambient Synth", url: "synth" },
    { id: "binaural", name: "432Hz Focus Binaural", url: "binaural" },
  ],
  categories: [
    { key: "work", label: "Work & Cognitive" },
    { key: "wellness", label: "Physical Wellness" },
    { key: "mind", label: "Zen & Mindfulness" },
  ],
};
