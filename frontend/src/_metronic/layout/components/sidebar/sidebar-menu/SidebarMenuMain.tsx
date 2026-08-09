/* eslint-disable react/jsx-no-target-blank */
import React from 'react'
import { SidebarMenuItemWithSub } from './SidebarMenuItemWithSub'
import { SidebarMenuItem } from './SidebarMenuItem'

const SidebarMenuMain = () => {
  return (
    <>
      {/* Dashboard */}
      <SidebarMenuItem
        to='/dashboard'
        icon='element-11'
        title='Tableau de Bord'
        fontIcon='bi-app-indicator'
        iconColor='#3B82F6'
      />

      {/* Section Production */}
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>
            Production
          </span>
        </div>
      </div>

      <SidebarMenuItemWithSub
        to='/production'
        title='Suivi Production'
        fontIcon='bi-gear'
        icon='gear'
        iconColor='#F97316'
      >
        <SidebarMenuItem
          to='/production'
          title='Ordres de Fabrication'
          hasBullet={true}
          exact={true}
        />
        <SidebarMenuItem
          to='/production/machines'
          title="Machines d'Atelier"
          hasBullet={true}
          exact={true}
        />
      </SidebarMenuItemWithSub>

      {/* Section Stock */}
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>
            Gestion de Stock
          </span>
        </div>
      </div>

      <SidebarMenuItemWithSub
        to='/stock'
        title='Stock & Flux'
        fontIcon='bi-archive'
        icon='element-plus'
        iconColor='#10B981'
      >
        <SidebarMenuItem
          to='/stock'
          title='Inventaire'
          hasBullet={true}
          exact={true}
        />
        <SidebarMenuItem
          to='/stock/movements'
          title='Mouvements de Stock'
          hasBullet={true}
          exact={true}
        />
      </SidebarMenuItemWithSub>

      {/* Section Analytique */}
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>
            Analytique
          </span>
        </div>
      </div>

      <SidebarMenuItem
        to='/analytics'
        icon='chart-line'
        title='Rendement (TRG)'
        fontIcon='bi-graph-up'
        iconColor='#7C3AED'
      />

      {/* Section Intelligence Artificielle */}
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>
            IA / Prévisions
          </span>
        </div>
      </div>

      <SidebarMenuItem
        to='/data-science'
        icon='technology'
        title='Prévisions Production'
        fontIcon='bi-cpu'
        iconColor='#009EF7'
      />

      {/* Section Administration */}
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>
            Administration
          </span>
        </div>
      </div>

      <SidebarMenuItem
        to='/admin/monitoring'
        icon='shield-tick'
        title='Supervision Admin'
        fontIcon='bi-shield-check'
        iconColor='#E11D48'
      />
    </>
  )
}

export { SidebarMenuMain }
