@tailwind base;
@tailwind components;
@tailwind utilities;

@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap");

body {
  background-color: #fafaf7;
  color: #161514;
}

.label-eyebrow {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b6a63;
}

.focus-ring:focus-visible {
  outline: 2px solid #0f6b5e;
  outline-offset: 2px;
}
