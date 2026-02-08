import { StrictMode } from "react"
import { hydrateRoot, createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"

const root = document.getElementById("root")!
const hasSSRContent = root.innerHTML.trim().length > 0

if (hasSSRContent) {
  hydrateRoot(
    root,
    <StrictMode>
      <App />
    </StrictMode>,
  )
} else {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
