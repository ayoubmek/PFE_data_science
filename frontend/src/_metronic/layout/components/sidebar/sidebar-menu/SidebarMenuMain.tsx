
import React from 'react'
import { SidebarMenuItemWithSub } from './SidebarMenuItemWithSub'
import { SidebarMenuItem } from './SidebarMenuItem'

const SidebarMenuMain = () => {
  return (
    <>
      {}
      <SidebarMenuItem
        to='/dashboard'
        icon='element-11'
        title='Tableau de Bord'
        fontIcon='bi-app-indicator'
        iconColor='#3B82F6'
      />

      {}
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

      {}
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

      {}
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

      {}
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
        title='Prévisions IA (Prophet)'
        fontIcon='bi-cpu'
        iconColor='#50CD89'
      />

      <SidebarMenuItem
        to='/data-science/benchmark'
        icon='chart-line-star'
        title='Benchmark Modèles IA'
        fontIcon='bi-bar-chart'
        iconColor='#009EF7'
      />

      <SidebarMenuItem
        to='/data-science/sandbox'
        icon='file-up'
        title='Tester Modèles IA (Fichier)'
        fontIcon='bi-cloud-upload'
        iconColor='#F59E0B'
      />

      {/* Administration & Sécurité */}
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>
            Administration & Sécurité
          </span>
        </div>
      </div>

      <SidebarMenuItem
        to='/admin/users'
        icon='profile-user'
        title='Gestion des Utilisateurs'
        fontIcon='bi-people'
        iconColor='#E11D48'
      />
    </>
  )
}

export { SidebarMenuMain }