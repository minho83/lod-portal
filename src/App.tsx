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
import { RecruitListPage } from "@/pages/RecruitListPage"
import { NewRecruitPage } from "@/pages/NewRecruitPage"
import { RecruitDetailPage } from "@/pages/RecruitDetailPage"
import DevNotificationsPage from "@/pages/DevNotificationsPage"
import AdminPage from "@/pages/AdminPage"

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
            <Route path="/recruit" element={<RecruitListPage />} />
            <Route path="/recruit/new" element={<NewRecruitPage />} />
            <Route path="/recruit/:id" element={<RecruitDetailPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/market/new" element={<NewTradePage />} />
            <Route path="/market/:id" element={<TradeDetailPage />} />
            {/* 관리자 전용 */}
            <Route path="/admin" element={<AdminPage />} />
            {/* 개발자 전용 */}
            <Route path="/dev/notifications" element={<DevNotificationsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}
