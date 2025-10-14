const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const suggestions=document.querySelectorAll(".suggestion-list .suggestion");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

let userMessage = null;
let isResponseGenerating= false;
const API_KEY="AIzaSyAMhVu3iGLsD2G8w4VYOtAIMwYtVJyQ5to";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;




const loadLocalstorageData=()=>{
const savedChats=localStorage.getItem("savedChats");
const isLightMode = (localStorage.getItem("themeColor")==="light_mode");
//apply the stored theme
document.body.classList.toggle("light_mode",isLightMode);
toggleThemeButton.innerText= isLightMode? "dark_mode": "light_mode";
//restore saved charts
chatList.innerHTML= savedChats || "";
document.body.classList.toggle("hide-header",savedChats);
chatList.scrollTo(0,chatList.scrollHeight);



}

loadLocalstorageData();


// Create a new message element and return it
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div"); 
    div.classList.add("message",  ...classes);
    div.innerHTML = content; 
    return div;
};

//show typing effcet diplaying  words one by one
const showTypingEffect=(text,textElement,incommingMessageDiv)=>{
   const words = text.split(' ');
    let currentWordIndex=0;
    const typingInterval=setInterval(()=>{
     textElement.innerText+=(currentWordIndex===0?' ':' ')+words[currentWordIndex++];
     incommingMessageDiv.querySelector(".icon").classList.add("hide");

     //if all words are displayed
     if(currentWordIndex===words.length){
        clearInterval(typingInterval);
        isResponseGenerating=false;
         incommingMessageDiv.querySelector(".icon").classList.remove("hide");
        localStorage.setItem("savedChats",chatList.innerHTML);//save charts to local storage
        chatList.scrollTo(0,chatList.scrollHeight);//scroll to bottom

     }
    },75);

}



//fetch the response from user
const generateAPIResponse=async(incommingMessageDiv)=>{

    const textElement=incommingMessageDiv.querySelector(".text");
    try{
//send a  post request to the api from the users
        const response=await fetch(API_URL,{
             method: "POST",
             headers: { "Content-Type" : "application/json" },
            body: JSON.stringify({
            contents: [{ 
              role:"user",
                parts: [{ text: userMessage }]
             }]
         })
        });

         const data=await response.json();

         if(!response.ok) throw new error(data.error.message);

     //get the api response text
         const apiResponse=data?.candidates[0].content.parts[0].text.replace(/\*/g, "") || "".trim();;
         showTypingEffect(apiResponse,textElement,incommingMessageDiv);


    }catch(error){
        isResponseGenerating=false;
       textElement.innerText=error.message;
       textElement.classList.add("error");

    }finally{
        incommingMessageDiv.classList.remove("loading");
    }
    
}


//show a loading animation while waiting for the api response
const showLoadingAnimation=()=>{
      const html = `
     
      <div class="message-content">
         <img src="https://play-lh.googleusercontent.com/Pkwn0AbykyjSuCdSYCbq0dvOqHP-YXcbBLTZ8AOUZhvnRuhUnZ2aJrw_YCf6kVMcZ4PM=s256"  alt ='Gemini'  class ="avatar" > 
         <p class="text">  </p>
          <div class="loading-indicator">
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
          </div>
          
     </div>
     <span onClick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>

    `;

    const incommingMessageDiv = createMessageElement(html, "incomming","loading");
    chatList.appendChild(incommingMessageDiv);
       chatList.scrollTo(0,chatList.scrollHeight);
    generateAPIResponse(incommingMessageDiv);
}

//copy message text to the clip borad
const copyMessage=(copyIcon)=>{
    const messageText=copyIcon.parentElement.querySelector(".text").innerText;
    navigator.clipboard.writeText(messageText);
    copyIcon.innerText="done"; //tick icon
    setTimeout=(()=> copyIcon.innerText="content_copy",1000) ; //revert icon after one second

}

const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
    if (!userMessage || isResponseGenerating) return; // Exit if input is empty
    isResponseGenerating=true;

    const html = `
        <div class="message-content">
            <img src="https://wallpaperaccess.com/full/1953967.jpg" alt="User Image" class="avatar"> 
            <p class="text"></p>
        </div>
    `;

    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatList.appendChild(outgoingMessageDiv);
    typingForm.reset();
    chatList.scrollTo(0,chatList.scrollHeight);//scrool to the bottom
    document.body.classList.add("hide-header");//hide header once the chart is start
    setTimeout(showLoadingAnimation,500);//show loading animation after a  dealy

   
};

//set user message and handle out going chat when suggestion is clicked
suggestions.forEach(suggestion=>{
    suggestion.addEventListener("click",()=>{
        userMessage=suggestion.querySelector(".text").innerText;
        handleOutgoingChat();

    })

})


//toggle between light and dark modes
toggleThemeButton.addEventListener('click',()=>{
const isLightMode = document.body.classList.toggle("light_mode");
localStorage.setItem("themeColor",isLightMode? "light_mode": "dark_mode");
toggleThemeButton.innerText= isLightMode? "dark_mode": "light_mode";

})

//delete all chats from local storage when button is clicked
deleteChatButton.addEventListener('click',()=>{
    if(confirm("are you sure you want to delete all messages?")){
      localStorage.removeItem("savedChats");
      loadLocalstorageData();
    }
       
    
})


// Prevent default form submission and handle outgoing chat
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
});
