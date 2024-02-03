import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ChatRoom from './component/ChatRoom/ChatRoom'


function App() {
  // const [count, setCount] = useState(0)

  // useEffect(() => {


  // })

  return (
    <div className='max-sm:h-[100vh] max-sm:flex max-sm:items-center'>
      <ChatRoom />
    </div>
  )
}

export default App
