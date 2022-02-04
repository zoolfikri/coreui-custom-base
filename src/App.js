import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom'
import './scss/style.scss'
import 'react-loading-skeleton/dist/skeleton.css'

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Logout = React.lazy(() => import('./views/pages/logout/Logout'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const mapStateToProps = (state) => ({
  user_data: state.user_data,
  access_token: state.access_token,
})

class App extends Component {
  render() {
    return (
      <HashRouter>
        <React.Suspense fallback={loading}>
          <Switch>
            <Route exact path="/login" name="Login Page" render={(props) => <Login {...props} />} />
            <Route
              exact
              path="/logout"
              name="Logout Page"
              render={(props) => <Logout {...props} />}
            />
            <Route
              exact
              path="/register"
              name="Register Page"
              render={(props) => <Register {...props} />}
            />
            <Route exact path="/404" name="Page 404" render={(props) => <Page404 {...props} />} />
            <Route exact path="/500" name="Page 500" render={(props) => <Page500 {...props} />} />
            <Route
              path="/"
              name="Home"
              render={(props) =>
                this.props.access_token && this.props.user_data ? (
                  <DefaultLayout {...props} />
                ) : (
                  <Redirect
                    to={{
                      pathname: '/login',
                    }}
                  />
                )
              }
            />
          </Switch>
        </React.Suspense>
      </HashRouter>
    )
  }
}

App.propTypes = {
  access_token: PropTypes.string,
  user_data: PropTypes.object,
}

export default connect(mapStateToProps)(App)
