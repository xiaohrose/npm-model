import './App.css'
import List from './components/list'
import MainContent from './components/main'
import { useEffect, useState, useRef } from 'react'
import { getChatHistory, getChatHistoryItem } from './service/index'
import { useMount } from 'ahooks'

function App() {
  const [list, setList] = useState<any>([]);
  const [messages, setMessages] = useState<any>([]);
  const mainRef = useRef<any>(null);

  useMount(() => {
    setTimeout(() => {
      document.title = 'modal-chats'
    }, 400)
  })
  useEffect(() => {
    getChatHistory().then(res => setList(res))
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        if (mainRef.current) {
          mainRef.current.scrollTop = 0;
        }
      }, 200);
    }
  }, [messages])

  return (
    <div className='container'>
      {/* <div className='header'>head</div> */}
      <div className='content'>
        <div className='side'>
          <List onClick={(item) => {
            getChatHistoryItem(item.title).then(res => setMessages(res))
          }} list={list}></List>
        </div>
        <div className='main' ref={mainRef}>
          <MainContent messages={messages}></MainContent>
        </div>
      </div>
    </div >
  )
}

export default App
