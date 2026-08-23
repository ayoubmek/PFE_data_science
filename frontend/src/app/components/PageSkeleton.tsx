import React, { FC } from 'react'

interface PageSkeletonProps {
  type?: 'table' | 'cards' | 'charts'
}

export const PageSkeleton: FC<PageSkeletonProps> = ({ type = 'table' }) => {
  return (
    <div className='card glass-card shadow-sm border-0' style={{ animation: 'pulse 2s infinite ease-in-out' }}>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        .skeleton-block {
          background-color: #F1F1F4;
          border-radius: 4px;
        }
      `}</style>
      <div className='card-header align-items-center py-5 gap-2 border-0 bg-transparent'>
        <div className='card-title w-100'>
          <div className='skeleton-block h-30px w-250px mb-1'></div>
        </div>
      </div>
      <div className='card-body pt-0'>
        {type === 'table' && (
          <div className='table-responsive'>
            <table className='table align-middle table-row-dashed fs-6 gy-5'>
              <thead>
                <tr className='border-0'>
                  <th><div className='skeleton-block h-15px w-80px'></div></th>
                  <th><div className='skeleton-block h-15px w-120px'></div></th>
                  <th><div className='skeleton-block h-15px w-100px'></div></th>
                  <th><div className='skeleton-block h-15px w-100px'></div></th>
                  <th><div className='skeleton-block h-15px w-150px'></div></th>
                  <th><div className='skeleton-block h-15px w-80px'></div></th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className='border-0'>
                    <td><div className='skeleton-block h-20px w-60px'></div></td>
                    <td><div className='skeleton-block h-20px w-150px'></div></td>
                    <td><div className='skeleton-block h-20px w-80px'></div></td>
                    <td><div className='skeleton-block h-20px w-80px'></div></td>
                    <td><div className='skeleton-block h-20px w-100px'></div></td>
                    <td><div className='skeleton-block h-20px w-70px'></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {type === 'cards' && (
          <div className='row g-5'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='col-md-4'>
                <div className='card h-100 p-6' style={{ backgroundColor: '#F9FAFB', border: '1px solid #EFF2F5' }}>
                  <div className='skeleton-block h-25px w-50 mb-4'></div>
                  <div className='skeleton-block h-35px w-75 mb-3'></div>
                  <div className='skeleton-block h-15px w-100'></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {type === 'charts' && (
          <div className='d-flex flex-column gap-6'>
            <div className='skeleton-block h-300px w-100'></div>
            <div className='skeleton-block h-300px w-100'></div>
          </div>
        )}
      </div>
    </div>
  )
}