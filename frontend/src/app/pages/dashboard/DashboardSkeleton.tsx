import { FC } from 'react'
import { useIntl } from 'react-intl'
import { KTIcon } from '../../../_metronic/helpers'

const DashboardSkeleton: FC = () => {
    const intl = useIntl()
    return (
        <>
            <div className='row g-5 g-xl-10 mb-5 mb-xl-10'>
                <div className='col-12'>
                    <div className='notice d-flex bg-light-primary rounded border-primary border border-dashed p-6'>
                        <KTIcon iconName='notification-bing' className='fs-2tx text-primary me-4' />
                        <div className='d-flex flex-stack flex-grow-1 flex-wrap flex-md-nowrap'>
                            <div className='mb-3 mb-md-0 fw-semibold w-100'>
                                <div className='h-20px bg-gray-300 rounded w-25 mb-2 placeholder-glow'></div>
                                <div className='fs-6 text-gray-700 pe-7'>
                                    <div className='h-10px bg-gray-200 rounded w-50 mb-1 placeholder-glow'></div>
                                    <div className='h-10px bg-gray-200 rounded w-40 placeholder-glow'></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='row g-5 g-xl-10 mb-5 mb-xl-10'>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className='col-md-6 col-lg-6 col-xl-3 col-xxl-3'>
                        <div className='card card-flush h-md-100 border-0'>
                            <div className='card-header pt-5'>
                                <div className='card-title d-flex flex-column w-100'>
                                    <div className='h-30px bg-gray-300 rounded w-50 mb-2 placeholder-glow'></div>
                                    <div className='h-10px bg-gray-200 rounded w-25 placeholder-glow'></div>
                                </div>
                            </div>
                            <div className='card-body d-flex align-items-end pt-0'>
                                <div className='d-flex align-items-center flex-column mt-3 w-100'>
                                    <div className='d-flex justify-content-between w-100 mt-auto mb-2'>
                                        <div className='h-10px bg-gray-200 rounded w-20 placeholder-glow'></div>
                                        <div className='h-10px bg-gray-200 rounded w-30 placeholder-glow'></div>
                                    </div>
                                    <div className='h-8px mx-3 w-100 bg-gray-100 rounded'></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className='row g-5 g-xl-10 mb-5 mb-xl-10'>
                <div className='col-xl-8'>
                    <div className='card card-flush h-xl-100'>
                        <div className='card-header pt-7'>
                            <div className='h-20px bg-gray-300 rounded w-25 placeholder-glow'></div>
                        </div>
                        <div className='card-body pt-2'>
                            <div className='h-350px bg-gray-100 rounded w-100 d-flex align-items-center justify-content-center'>
                                <span className='text-gray-400'>{intl.formatMessage({id: 'ORDERS.LOADING'})}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='col-xl-4'>
                    <div className='card card-flush h-xl-100'>
                        <div className='card-header pt-7'>
                            <div className='h-20px bg-gray-300 rounded w-50 placeholder-glow'></div>
                        </div>
                        <div className='card-body pt-2'>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className='d-flex flex-stack mb-5'>
                                    <div className='d-flex align-items-center me-2'>
                                        <div className='h-20px bg-gray-200 rounded w-100px placeholder-glow'></div>
                                    </div>
                                    <div className='h-20px bg-gray-200 rounded w-30px placeholder-glow'></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className='row g-5 g-xl-10 mb-5 mb-xl-10'>
                {[1, 2].map((col) => (
                    <div key={col} className='col-xl-6'>
                        <div className='card card-flush h-xl-100'>
                            <div className='card-header pt-7'>
                                <div className='h-20px bg-gray-300 rounded w-25 placeholder-glow'></div>
                            </div>
                            <div className='card-body pt-2'>
                                <div className="table-responsive">
                                    <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                                        <thead>
                                            <tr className="fw-bold text-muted">
                                                <th className="min-w-150px"><div className='h-15px bg-gray-200 rounded w-50 placeholder-glow'></div></th>
                                                <th className="min-w-100px text-end"><div className='h-15px bg-gray-200 rounded w-50 ms-auto placeholder-glow'></div></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <tr key={i}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="symbol symbol-45px me-5">
                                                                <div className="symbol-label bg-gray-100"></div>
                                                            </div>
                                                            <div className="d-flex justify-content-start flex-column">
                                                                <div className='h-15px bg-gray-200 rounded w-100px mb-1 placeholder-glow'></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-end">
                                                        <div className='h-15px bg-gray-200 rounded w-50px ms-auto placeholder-glow'></div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default DashboardSkeleton
