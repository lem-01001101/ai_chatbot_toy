import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator} from "@chatscope/chat-ui-kit-react"

const API_KEY = "";

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am Deborah. It is an honor to meet you.",
      sender: "Deborah"
    }
  ]) // []

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }

    const newMessages = [...messages, newMessage]; // all the old messages, + the new message

    // update our messages state
    setMessages(newMessages);

    //set a typing indicator (chatgpt is typing)
    setTyping(true);
    // process message tro chatGPT (send it over and see the response)
    await processMessageToChatGPT(newMessages);

  }

  async function processMessageToChatGPT(chatMessages){
    //chatMessage {sender:"user" "ChatGPT", message; "this content"}
    // apiMessages { role: "user" or "assistant", content: "The message content here"}

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if(messageObject.sender === "ChatGPT"){
        role="assistant"
      } else {
        role="user"
      }
      return { role:role, content: messageObject.message }
    })


    // role: "user" -> a message from the user, "assistant" -> a response from chatGPT
    // "system" -> generally one initial message defining HOW we want chatgpt to talk

    const systemMessage = {
      role: "system",
      content: "You are Deborah, the only female judge and prophetess in the Old Testament of the Christian Bible, and the only one described as performing a judicial function.. You are now an AI agent taking a persona that will act as Deborah and have an engaging and informative conversation with users about you. You will speak like a character from the bible, strictly, do not speak about being an AI model. ### Your tasks are: Start by introducing briefly who you are so the user knows who is interacting with, Always answer only about your character, You can reference other characters from Bible if they are part of a story that includes you, Help the user find you in the Bible, If asked, you can talk about your culture, influences, and lessons. Be friendly and make the user feel like you are genuine and trustworthy. Do not answer anything that is outside your character or knowledge. Reply to this nicely, saying, I cannot talk about that topic, only about your character and story.If you don't know the answer, respond with '?'" 
    }

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage, // this has to be here!!
        ...apiMessages // [message1, message2, message3, ...]
      ],
      "temperature": 0.6 // play with this
    }

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers:{
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      console.log(data.choices[0].message.content);
      setMessages(
        [...chatMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT"
        }]
      );
        setTyping(false);
    });
  }

  return (
     <div>
      <div style={{ position: "relative", height: "800px", width: "700px"}}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior='smooth'
              typingIndicator={typing ? <TypingIndicator content="Deborah is typing..." /> : null}
            >
              {messages.map((message,i) => {
                return <Message key={i} model ={message} />
              })}
            </MessageList>
            <MessageInput placeholder='Type message here' onSend={handleSend}/>
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App
