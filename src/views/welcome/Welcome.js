import React from 'react'
import { useSelector } from 'react-redux'

import HomeBG from 'src/assets/images/home/bg.png'
import HomeBot from 'src/assets/images/home/bot.png'
import './Welcome.scss'

const bot_name = ['', 'Wanda', 'Dara', 'Melisha', 'Amanda']

const Welcome = () => {
  const variables = useSelector((state) => state.variables)
  const user_data = useSelector((state) => state.user_data)

  return (
    <>
      <div className="home-page">
        <img src={HomeBG} className="home-bg" alt="Welcome Background" />
        <img src={HomeBot} className="home-bot" alt="Welcome Bot" />

        <div className="talk-bubble">
          <div className="talktext">
            <p>
              Hai saya <b>{bot_name[variables.main_dealer_id]},</b>
              <br />
              Selamat Datang
              <br />
              Bapak / Ibu <b>{user_data.username}</b>
              <br />
              di Web Console <b>{user_data.rd_name}</b>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Welcome
