import { createStore } from 'redux'

const initialState = {
  sidebarShow: true,
  variables: {
    main_dealer_id: 4,
    api_base_url: 'https://api-leona.astra-motor.co.id/',
  },
  user_data: JSON.parse(localStorage.getItem('user_data')),
  access_token: localStorage.getItem('access_token'),
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    default:
      return state
  }
}

const store = createStore(changeState)
export default store
