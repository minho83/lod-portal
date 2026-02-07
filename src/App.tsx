import { HashRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { Layout } from "@/components/layout/Layout"
import { PartyPage } from "@/pages/PartyPage"
import { CalculatorPage } from "@/pages/CalculatorPage"
import { SearchPage } from "@/pages/SearchPage"
import { WikiPage } from "@/pages/WikiPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { MarketPage } from "@/pages/MarketPage"
import { NewTradePage } from "@/pages/NewTradePage"
import { TradeDetailPage } from "@/pages/TradeDetailPage"

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<PartyPage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/wiki" element={<WikiPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/market/new" element={<NewTradePage />} />
            <Route path="/market/:id" element={<TradeDetailPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}
