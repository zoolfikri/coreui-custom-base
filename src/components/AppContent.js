import React, { Suspense } from 'react'
import { useSelector } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

// routes config
import routes from '../routes'

const AppContent = () => {
  const user_data = useSelector((state) => state.user_data)

  return (
    <CContainer fluid>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Switch>
          {routes.map((route, idx) => {
            if (!route.role_access || route.role_access?.includes(user_data.role)) {
              return (
                route.component && (
                  <Route
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    render={(props) => (
                      <>
                        <route.component {...props} />
                      </>
                    )}
                  />
                )
              )
            }

            return <React.Fragment key={idx}></React.Fragment>
          })}
          <Redirect from="/" to="/welcome" />
        </Switch>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
