import React, { lazy } from 'react'

const SisaKuota = lazy(() => import('./SisaKuota'))
const NewLeadsPerMonth = lazy(() => import('./NewLeadsPerMonth'))
const LeadsUnassigned = lazy(() => import('./LeadsUnassigned'))
const HotProspects = lazy(() => import('./HotProspects'))
const NewLeadsToConvert = lazy(() => import('./NewLeadsToConvert'))
const ClockTick = lazy(() => import('src/components/custom/ClockTick'))

const month_options = [
  { id: 1, name: 'Januari' },
  { id: 2, name: 'Februari' },
  { id: 3, name: 'Maret' },
  { id: 4, name: 'April' },
  { id: 5, name: 'Mei' },
  { id: 6, name: 'Juni' },
  { id: 7, name: 'Juli' },
  { id: 8, name: 'Agustus' },
  { id: 9, name: 'September' },
  { id: 10, name: 'Oktober' },
  { id: 11, name: 'November' },
  { id: 12, name: 'Desember' },
]

const year_options = []
for (let i = 2018; i <= new Date().getFullYear(); i++) {
  year_options.push(i)
}

const Dashboard = () => {
  const [filter_month, setFilter_month] = React.useState(new Date().getMonth() + 1)
  const [filter_year, setFilter_year] = React.useState(new Date().getFullYear())

  return (
    <>
      <div className="row row-cols-1 row-cols-md-3 row-cols-lg-3 row-cols-xl-6 g-3">
        <div className="col">
          <SisaKuota />
        </div>
        <div className="col">
          <NewLeadsPerMonth filter={{ month: filter_month, year: filter_year }} />
        </div>
        <div className="col">
          <LeadsUnassigned filter={{ month: filter_month, year: filter_year }} />
        </div>
        <div className="col">
          <HotProspects filter={{ month: filter_month, year: filter_year }} />
        </div>
        <div className="col">
          <NewLeadsToConvert filter={{ month: filter_month, year: filter_year }} />
        </div>
        <div className="col">
          <ClockTick className="d-block mb-2" />
          <form className="row g-2">
            <div className="col-7">
              <select
                className="form-select"
                value={filter_month}
                onChange={(e) => setFilter_month(e.target.value)}
              >
                {month_options.map((month, month_idx) => (
                  <option value={month.id} key={month_idx}>
                    {month.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-5">
              <select
                className="form-select"
                value={filter_year}
                onChange={(e) => setFilter_year(e.target.value)}
              >
                {year_options.map((year, year_idx) => (
                  <option value={year} key={year_idx}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Dashboard
