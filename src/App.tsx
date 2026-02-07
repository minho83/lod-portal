import { HashRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { PartyPage } from "@/pages/PartyPage"
import { CalculatorPage } from "@/pages/CalculatorPage"
import { SearchPage } from "@/pages/SearchPage"
import { WikiPage } from "@/pages/WikiPage"

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<PartyPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/wiki" element={<WikiPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
