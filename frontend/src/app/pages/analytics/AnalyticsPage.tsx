import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Chart from 'react-apexcharts'
import { KTIcon } from '../../../_metronic/helpers'
import { PageSkeleton } from '../../components/PageSkeleton'

export default function AnalyticsPage() {
  const [machines, setMachines] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [totalOutput, setTotalOutput] = useState(0)
  const [avgOee, setAvgOee] = useState(0)

  const fetchAnalytics = async () => {
    setLoading(true)
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'
    try {
      const { data } = await axios.get(`${apiUrl}/production/machines`)
      setMachines(data || [])
      
      if (data && data.length > 0) {
        const total = data.reduce((acc: number, m: any) => acc + (m.totalOutput || 0), 0)
        const avg = data.reduce((acc: number, m: any) => acc + (m.tauxRendement || 0), 0) / data.length
        setTotalOutput(total)
        setAvgOee(Math.round(avg * 10) / 10)
      }
    } catch (err) {
      console.warn('Failed to fetch analytics, using mock data:', err)
      const mockMachines = [
        { code: 'M-01', nom: 'Presse Hydraulique P1', statut: 'EN_PRODUCTION', tauxRendement: 85.5, totalOutput: 1240, temperature: 62 },
        { code: 'M-02', nom: 'Toureuse T2', statut: 'EN_PRODUCTION', tauxRendement: 79.2, totalOutput: 890, temperature: 55 },
        { code: 'M-03', nom: 'Découpeuse Laser L3', statut: 'DISPONIBLE', tauxRendement: 92.4, totalOutput: 2150, temperature: 41 },
        { code: 'M-04', nom: 'Fraiseuse F4', statut: 'EN_MAINTENANCE', tauxRendement: 45.0, totalOutput: 340, temperature: 30 },
        { code: 'M-05', nom: 'Robot Soudeur R5', statut: 'EN_PANNE', tauxRendement: 12.8, totalOutput: 1050, temperature: 75 },
        { code: 'M-06', nom: 'Unité Injection I6', statut: 'DISPONIBLE', tauxRendement: 88.0, totalOutput: 1540, temperature: 48 }
      ]
      setMachines(mockMachines)
      const total = mockMachines.reduce((acc, m) => acc + m.totalOutput, 0)
      const avg = mockMachines.reduce((acc, m) => acc + m.tauxRendement, 0) / mockMachines.length
      setTotalOutput(total)
      setAvgOee(Math.round(avg * 10) / 10)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  // Options for TRG chart
  const machineNames = machines.map((m) => m.nom || m.code)
  const yieldRates = machines.map((m) => m.tauxRendement || 0)
  const colors = yieldRates.map((r) => r >= 80 ? '#50CD89' : r >= 50 ? '#F1BC00' : '#F1416C')

  const trgChartOptions: any = {
    series: [{
      name: 'Taux de Rendement (TRG)',
      data: yieldRates
    }],
    options: {
      chart: {
        fontFamily: 'Inter, sans-serif',
        type: 'bar',
        height: 280,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '35%',
          borderRadius: 6,
          distributed: true
        }
      },
      dataLabels: { enabled: false },
      stroke: { show: false },
      xaxis: {
        categories: machineNames,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#A1A5B7', fontSize: '11px', fontWeight: '500' } }
      },
      yaxis: {
        max: 100,
        labels: {
          style: { colors: '#A1A5B7', fontSize: '11px', fontWeight: '500' },
          formatter: (val: number) => val + '%'
        }
      },
      colors: colors,
      grid: {
        borderColor: '#EFF2F5',
        strokeDashArray: 4,
        yaxis: { lines: { show: true } }
      },
      tooltip: {
        style: { fontSize: '12px' },
        y: { formatter: (val: number) => val + '%' }
      },
      legend: { show: false }
    }
  }

  // Options for Production volume chart
  const outputValues = machines.map((m) => Math.round(m.totalOutput || 0))
  const prodChartOptions: any = {
    series: [{
      name: 'Volume de Production',
      data: outputValues
    }],
    options: {
      chart: {
        fontFamily: 'Inter, sans-serif',
        type: 'bar',
        height: 280,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '35%',
          borderRadius: 6
        }
      },
      dataLabels: { enabled: false },
      stroke: { show: false },
      xaxis: {
        categories: machineNames,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#A1A5B7', fontSize: '11px', fontWeight: '500' } }
      },
      yaxis: {
        labels: { style: { colors: '#A1A5B7', fontSize: '11px', fontWeight: '500' } }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.3,
          opacityFrom: 0.9,
          opacityTo: 0.6,
          stops: [0, 100]
        }
      },
      colors: ['#3E97FF'],
      grid: {
        borderColor: '#EFF2F5',
        strokeDashArray: 4,
        yaxis: { lines: { show: true } }
      },
      tooltip: {
        style: { fontSize: '12px' },
        y: { formatter: (val: number) => val.toLocaleString() + ' unités' }
      }
    }
  }

  if (loading && machines.length === 0) {
    return <PageSkeleton type='charts' />
  }

  return (
    <div className='d-flex flex-column gap-5'>
      <style>{`
        .glass-card {
          background: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.04) !important;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.02) !important;
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.04) !important;
        }
      `}</style>
      
      {/* KPI row */}
      <div className='row g-5 mb-3'>
        <div className='col-md-6'>
          <div className='card glass-card h-100 py-5 border-top border-4 border-success shadow-sm' style={{ borderTop: '4px solid #50CD89 !important' }}>
            <div className='card-body d-flex flex-column justify-content-center px-9'>
              <span className='fs-2hx fw-extrabolder text-success mb-2 lh-1'>{totalOutput.toLocaleString()} u</span>
              <span className='text-gray-800 fw-bold fs-5'>Production Globale Cumulée</span>
              <span className='text-gray-500 fw-semibold fs-7 mt-1'>Volume total de pièces usinées</span>
            </div>
          </div>
        </div>
        <div className='col-md-6'>
          <div className='card glass-card h-100 py-5 border-top border-4 border-warning shadow-sm' style={{ borderTop: '4px solid #F1BC00 !important' }}>
            <div className='card-body d-flex flex-column justify-content-center px-9'>
              <span className='fs-2hx fw-extrabolder text-warning mb-2 lh-1'>{avgOee}%</span>
              <span className='text-gray-800 fw-bold fs-5'>Taux de Rendement Moyen (TRG)</span>
              <span className='text-gray-500 fw-semibold fs-7 mt-1'>Efficacité moyenne de l'atelier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Production Chart */}
      <div className='card glass-card shadow-sm border-0'>
        <div className='card-header pt-6 bg-transparent border-0'>
          <h3 className='card-title align-items-start flex-column'>
            <span className='card-label fw-bold text-gray-900 fs-5'>Production par Poste de Travail</span>
            <span className='text-muted fs-7 fw-semibold mt-1'>Quantité brute produite par machine</span>
          </h3>
        </div>
        <div className='card-body pt-2'>
          <div style={{ height: '300px' }}>
            <Chart
              options={prodChartOptions.options}
              series={prodChartOptions.series}
              type='bar'
              height={280}
            />
          </div>
        </div>
      </div>

      {/* Yield/TRG Chart */}
      <div className='card glass-card shadow-sm border-0'>
        <div className='card-header pt-6 bg-transparent border-0'>
          <h3 className='card-title align-items-start flex-column'>
            <span className='card-label fw-bold text-gray-900 fs-5'>Rendement des Machines (TRG)</span>
            <span className='text-muted fs-7 fw-semibold mt-1'>Taux d'OEE (Rendement Global) par machine d'atelier</span>
          </h3>
        </div>
        <div className='card-body pt-2'>
          <div style={{ height: '300px' }}>
            <Chart
              options={trgChartOptions.options}
              series={trgChartOptions.series}
              type='bar'
              height={280}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
