import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

const socket = io("https://dacntt-mylms-1.onrender.com", {
  withCredentials: true,
});

export default function CourseChat() {
  const [openChat, setOpenChat] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function initChat() {
      const res = await fetch("https://dacntt-mylms-1.onrender.com/api/v1/chat/init", {
        credentials: "include",
      });
      const data = await res.json();
      setConversations(data.conversations || []);
      if (data.conversations?.length) {
        setActiveConv(data.conversations[0]);
      }
    }
    initChat();
  }, []);

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("https://dacntt-mylms-1.onrender.com/api/v1/user/profile", {
        credentials: "include",
      });
      const data = await res.json();
      setCurrentUser(data.user);
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (!activeConv?._id) return;

    socket.emit("join_conversation", activeConv._id);

    async function loadMessages() {
      const res = await fetch(
        `https://dacntt-mylms-1.onrender.com/api/v1/messages/${activeConv._id}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setMessages(data.messages || []);
    }

    loadMessages();

    const onReceive = (msg) => {
      if (msg.conversationId === activeConv._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receive_message", onReceive);
    return () => socket.off("receive_message", onReceive);
  }, [activeConv]);

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !activeConv || !currentUser) return;

    socket.emit("send_message", {
      conversationId: activeConv._id,
      senderId: currentUser._id,
      content: text,
    });
    setText("");
  };

  
  return (
    <>
     
      <button
        onClick={() => setOpenChat(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700"
      >
        <ChatBubbleOutlineIcon />
      </button>

    
      {openChat && (
        <div className="fixed bottom-24 right-6 z-50 h-[75vh] w-[900px] overflow-hidden rounded-2xl bg-white shadow-2xl">
         <div className="grid h-full min-h-0 grid-cols-[320px_1fr]">

        <div className="border-r bg-gray-50 p-4 flex flex-col">



              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg text-blue-600 font-semibold">Tin nhắn</h3>
                <button onClick={() => setOpenChat(false)}>
                  <CloseIcon className="text-black hover:text-black" />
                </button>
              </div>

           <div className="space-y-2 overflow-y-auto flex-1">

                {conversations.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => setActiveConv(c)}
                    className={`cursor-pointer rounded-xl p-3 transition 
                      ${
                        activeConv?._id === c._id
                          ? "bg-blue-100"
                          : "hover:bg-indigo-400"
                      }`}
                  >
                    <p className="font-medium text-black">
                      {c.courseId?.courseTitle}
                    </p>
                    <p className="text-sm text-black">
                      GV: {c.instructorId?.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            
         <div className="flex flex-col h-full min-h-0">


             
              <div className="border-b p-4 font-semibold text-blue-700">
                {activeConv
                  ? activeConv.courseId?.courseTitle
                  : "Chọn cuộc trò chuyện"}
              </div>

             
          <div className="flex-1 overflow-y-scroll p-4">

                {messages.map((m) => {
                  const mine =
                    currentUser &&
                    String(m.senderId) === String(currentUser._id);

                  return (
                    <div
                      key={m._id}
                      className={`mb-2 flex ${
                        mine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm
                          ${
                            mine
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-black"
                          }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              
      <div className="flex items-center gap-2 border-t p-3">



                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Nhập tin nhắn..."
                    className="w-full text-black rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="rounded-xl bg-blue-600 p-2 text-white hover:bg-blue-700"
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
