import { styles } from './assets.js';

    document.addEventListener("DOMContentLoaded", function() {
      // Create a <link> element
      const linkElement = document.createElement('link');
    
      // Set the sattributes of the <link> element
      linkElement.rel = 'stylesheet';
      linkElement.href = 'data:text/css;charset=UTF-8,' + encodeURIComponent(styles);
    
      // Append the <link> element to the <head> of the document
      document.head.appendChild(linkElement);
  function initChatbotWidget(config) {
  
  // Insert the chatbot HTML into the 'app' div
  const appDiv = document.querySelector("#app");
  appDiv.style.overflow = 'auto'; // or 'hidden', 'scroll', 'auto', etc.
  appDiv.innerHTML = `
    <button class="chatbot-toggler" style="position: fixed; ${config.position}: 0; margin: 9px;">
    <img src=${config.chatbotToggler} alt="Chat Image">
    
    <span class="expand-text" 
      style="position: absolute; animation: blink ${config.animationBlinkSec} linear infinite; animation-fill-mode: forwards; animation-iteration-count: ${config.animationBlinkIteration}; color: ${config.toggleButtonTextColor} !important;
       left: ${config.toggleButtonVPosition}; top: ${config.toggleButtonHPosition};
        width: ${config.toggleButtonWidth}">
        ${config.toggleButtonText}</span>
      <span class="material-symbols-outlined" >close</span>
    </button>   

    <div class="chatbot" style="position: fixed; ${config.position}: 0; "> 
 
    <header style="background:${config.chatbotColor};"> 
        <h2>${config.titelMessage}</h2>
        <span class="close-btn material-symbols-outlined">close</span>

      </header>
      <ul class="chatbox" style="height: 460px;">
        <li class="chat incoming">
          <span class="material-symbols-outlined" style="background:${config.chatbotColor}; ">smart_toy</span>
          <p>${config.welcomeMessage}</p>
        </li>
      </ul>
      <div class="chat-input" >      
        <textarea placeholder="Enter a message..." spellcheck="false" required></textarea>
        <!-- <input type="hidden" id="imageUpload" accept="image/*"> -->
        <span id="send-btn" class="material-symbols-rounded">send</span>
              
    </div>
    <div class="footer"><p style="color:white;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
    <p>powered by <a href=" https://www.fxrsoft.com" target="_blank">fxrsoft</a>
  </p></div>
  </div>
  `;
  // Now that the chatbot HTML is inserted, you can select the elements
const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const imageUpload = document.querySelector("#imageUpload");

let userMessage = null; // Variable to store user's message
const inputInitHeight = chatInput.scrollHeight;

var ws = new WebSocket(window.chatbotConfig.websocketAddress);
var thinking = window.chatbotConfig.thinkingMessage;

ws.onopen = function(e) {
    console.log("[open] Connection established");
    //console.log("Sending the server hostname");
    ws.send(location.hostname);
  };
  
  ws.onmessage = function(event) {
    console.log(`[message] Data received from server: ${event.data}`);
  };
  
  ws.onerror = function(error) {
    console.log(`[error] ${error.message}`);
  };

const createChatLi = (message, className, imgSrc) => {
  // Create a chat <li> element with passed message and className
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", `${className}`);

  //let chatContent = className === "outgoing" ? `<div class="message-container" style="background:${config.chatbotColor}; "><p class="message-text"></p></div><br>` : `<span class="material-symbols-outlined" style="background:${config.chatbotColor}; margin: 0 10px 7px 0;">smart_toy</span><div class="message-container" ><p class="message-text"></p></div>`;

 let chatContent = className === "outgoing" ? `<div class="message-container" style="background:${config.chatbotColor}; border-radius: 10px 10px 0 10px;"><p class="message-text"></p></div><br>` : `<span class="material-symbols-outlined" style="background:${config.chatbotColor}; width: 35px; height: 35px; cursor: default; line-height: 36px; align-self: flex-end; border-radius: 4px; margin: 0 10px 7px 0;">smart_toy</span><div class="message-container" ><p class="message-text"></p></div>`;

  if(imgSrc) {
    chatContent += `<div class="image-container"><img class="chat-image" src="${imgSrc}" alt="Uploaded image"/></div>`;
  }
  chatLi.innerHTML = chatContent;
  chatLi.querySelector(".message-text").textContent = message;

  return chatLi; // return chat <li> element
}


// Function to send the form data and file as a single message
function sendFormData(textFieldValue, imageClassificationChecked, file) {
    var dataToSend = {
        textField: textFieldValue,
        host: location.hostname,
        kb: config.knowledgeBase,
        imageClassification: imageClassificationChecked
    };
        ws.send(JSON.stringify(dataToSend));

}

const handleChat = (data) => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if(!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;    

    // Append the user's message to the chatbox
    let reader = new FileReader();
    reader.onloadend = function() {
        chatbox.appendChild(createChatLi(userMessage, "outgoing", reader.result));
        chatbox.scrollTo(0, chatbox.scrollHeight);
        
    }
    {
        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);
        sendFormData(userMessage, false, null);
    }
    
      // Access the thinkingMessage and messageType from the chatbotConfig object
    const thinkingMessage = window.chatbotConfig.thinkingMessage;
    const messageType = window.chatbotConfig.messageType;

    setTimeout(() => {
      // Display the thinkingMessage from chatbotConfig while waiting for the response
      const incomingChatLi = createChatLi(window.chatbotConfig.thinkingMessage, "incoming");
      chatbox.appendChild(incomingChatLi);
      chatbox.scrollTo(0, chatbox.scrollHeight);
  }, 600);

}

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    const lastMessageElement = chatbox.lastElementChild.querySelector("p");
    const md = window.markdownit({ html: true });
    // Check if the data from the server is a button
    if (data.type === 'buttonResponse') {
      // Append the server's response to the chatbox as an incoming message
      chatbox.appendChild(createChatLi(data.text, "outgoing"));  //incoming
      chatbox.scrollTo(0, chatbox.scrollHeight);
    } else if (data.type === 'button') {
        // Create a button element
        let btn = document.createElement('button');
        btn.textContent = data.text;
        btn.style.backgroundColor = config.chatbotColor; // Same color as the avatar
        btn.style.color = 'white'; // White text
        btn.style.borderRadius = '12px'; // Rounded corners
        btn.style.border = 'none'; // No border
        btn.style.padding = '10px 20px'; // Padding
        btn.style.textAlign = 'center'; // Centered text
        btn.style.textDecoration = 'none'; // No underline
        btn.style.display = 'inline-block';
        btn.style.fontSize = '12px';
        btn.style.margin = '4px 2px';
        btn.style.cursor = 'pointer'; // Cursor pointer on hover
        host: location.hostname,

      btn.onclick = function() {
        // Send a message back to Node-RED when the button is clicked
        ws.send(JSON.stringify({ action: data.action, text: data.text, host: location.hostname, kb: config.knowledgeBase }));
    
        // Append the button's text to the chatbox as an outgoing message
        chatbox.appendChild(createChatLi(data.text, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);
    };

        // Append the button to the chatbox
        chatbox.appendChild(btn);

    } else if (data.type === 'fdbutton') {
        // Create a button element
        let btn = document.createElement('button');
        btn.textContent = data.text;
        btn.style.backgroundColor = config.chatbotColor; // Same color as the avatar
        btn.style.color = 'white'; // White text
        btn.style.borderRadius = '12px'; // Rounded corners
        btn.style.border = 'none'; // No border
        btn.style.padding = '10px 20px'; // Padding
        btn.style.textAlign = 'center'; // Centered text
        btn.style.textDecoration = 'none'; // No underline
        btn.style.display = 'inline-block';
        btn.style.fontSize = '12px';
        btn.style.margin = '4px 2px';
        btn.style.cursor = 'pointer'; // Cursor pointer on hover
        host: location.hostname,
        btn.onclick = function() {
            // Send a message back to Node-RED when the button is clicked
            ws.send(JSON.stringify({ action: data.action, host: location.hostname, kb: config.knowledgeBase }));
        };

        // Append the button to the chatbox
        chatbox.appendChild(btn);

  } else if (data.type === 'message') {
        // Create a new paragraph element
        // let p = document.createElement('p');
        // p.textContent = data.text;
        // p.style.fontSize = '20px';
        // // Append the paragraph to the chatbox
        // chatbox.appendChild(p);'

        // Parse the markdown text to HTML
        let html = md.render(data.text);

        // Create a new element to display the message
        let div = document.createElement('div');
        div.innerHTML = html;
        div.style.fontSize = '14px';
        // Append the message to the chatbox
        chatbox.appendChild(div);



        // Parse the markdown text to HTML
        //let html = md.render(data.text);
        //chatbox.appendChild(createChatLi(html, "incoming"));
        //chatbox.appendChild(createChatLi(data.text, "incoming"));
        //chatbox.scrollTo(0, chatbox.scrollHeight);
    } else {
        // Handle text message
        if (lastMessageElement) {
            // Initialize markdown-it
            const md = window.markdownit({ html: true });

            // Render the markdown text
            let html = md.render(data.message);
            // Set the innerHTML of the last message element to the rendered HTML
            lastMessageElement.innerHTML = html;
    
            // Change the font size to 14px
            lastMessageElement.style.fontSize = "14px";





            // lastMessageElement.textContent = data.message;
            // // Change the font size to 14px
            // lastMessageElement.style.fontSize = "16px";
            
        }
    }

    chatbox.scrollTo(0, chatbox.scrollHeight);

    // Check if the data from the server contains an image URL
    // if (data.url) {
    //     // Create an image element
    //     let img = document.createElement('img');
    //     img.src = data.url;
    //     img.style.width = '300px'; // Set the width to 300px
    //     img.style.display = 'block';

    //     // Append the image to the chatbox
    //     chatbox.appendChild(img);
    //     chatbox.scrollTo(0, chatbox.scrollHeight);
    // }
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
    
});

chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window 
    // width is greater than 800px, handle the chat
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

// Apply the image from the config
//chatbotToggler.style.backgroundImage = `url(${config.toggleButtonImage})`;

let chatbot = document.querySelector('.chatbot');
// Apply the position from the config
chatbotToggler.style.position = 'fixed';
chatbot.style.position = 'fixed';

if (config.position.includes('top')) {
  chatbotToggler.style.top = '0';
  chatbot.style.right = '5px';
  chatbot.style.top = '5px';
} else {
  chatbotToggler.style.bottom = '0';
  chatbot.style.bottom = '560px';
}

if (config.position.includes('left')) {
  chatbotToggler.style.left = '0';
  chatbot.style.left = '5px';
  chatbot.style.bottom = '5px';
} else {
  chatbotToggler.style.right = '0';
  chatbot.style.right = '5px';
   chatbot.style.bottom = '5px';
}
  }
  // Initialize the chatbot widget with config options
 initChatbotWidget(window.chatbotConfig);
});