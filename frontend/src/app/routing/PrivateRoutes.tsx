import { lazy, FC, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { MasterLayout } from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import { DashboardWrapper } from '../pages/dashboard/DashboardWrapper'
import { getCSSVariableValue } from '../../_metronic/assets/ts/_utils'
import { WithChildren } from '../../_metronic/helpers'

const PrivateRoutes = () => {
  const ProductionPage = lazy(() => import('../pages/production/ProductionPage'))
  const MachinesPage = lazy(() => import('../pages/production/MachinesPage'))
  const StockInventoryPage = lazy(() => import('../pages/stock/StockPage'))
  const MovementsPage = lazy(() => import('../pages/stock/MovementsPage'))
  const AnalyticsPage = lazy(() => import('../pages/analytics/AnalyticsPage'))
  const DataSciencePage = lazy(() => import('../pages/data-science/DataSciencePage'))
  const DataScienceBenchmarkPage = lazy(() => import('../pages/data-science/DataScienceBenchmarkPage'))

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {}
        <Route path='auth/*' element={<Navigate to='/dashboard' />} />
        <Route path='/' element={<Navigate to='/dashboard' />} />

        {}
        <Route path='dashboard' element={<DashboardWrapper />} />

        {}
        <Route path='production' element={<SuspensedView><ProductionPage /></SuspensedView>} />
        <Route path='production/machines' element={<SuspensedView><MachinesPage /></SuspensedView>} />
        <Route path='stock' element={<SuspensedView><StockInventoryPage /></SuspensedView>} />
        <Route path='stock/movements' element={<SuspensedView><MovementsPage /></SuspensedView>} />
        <Route path='analytics' element={<SuspensedView><AnalyticsPage /></SuspensedView>} />
        <Route path='data-science' element={<SuspensedView><DataSciencePage /></SuspensedView>} />
        <Route path='data-science/benchmark' element={<SuspensedView><DataScienceBenchmarkPage /></SuspensedView>} />

        {}
        <Route path='*' element={<Navigate to='/error/404' />} />
      </Route>
    </Routes>
  )
}

const SuspensedView: FC<WithChildren> = ({ children }) => {
  const baseColor = getCSSVariableValue('--bs-primary')
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

export { PrivateRoutes }