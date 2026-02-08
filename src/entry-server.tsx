import { renderToString } from "react-dom/server"
import { StaticRouter } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { AppRoutes } from "@/App"

export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </StaticRouter>,
  )
}
