import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

const socket = io("https://dacntt-mylms-1.onrender.com", {
  withCredentials: true,
});

export default function InstructorChat() {
  const [openChat, setOpenChat] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  
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
    async function loadConversations() {
      const res = await fetch(
        "https://dacntt-mylms-1.onrender.com/api/v1/conversations/instructor",
        { credentials: "include" }
      );
      const data = await res.json();
      const convs = data.conversations || [];
      setConversations(convs);
      if (convs.length > 0) setActiveConv(convs[0]);
    }
    loadConversations();
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
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl hover:bg-indigo-700"
      >
        <ChatBubbleOutlineIcon />
      </button>

     
      {openChat && (
        <div className="fixed bottom-24 right-6 z-50 h-[75vh] w-[900px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="grid h-full min-h-0 grid-cols-[320px_1fr]">

   
         <div className="border-r bg-gray-50 p-4 flex flex-col min-h-0">

              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-indigo-600">
                  Student messages
                </h3>
                <button onClick={() => setOpenChat(false)}>
                  <CloseIcon />
                </button>
              </div>

             <div className="space-y-2 flex-1 overflow-y-auto">

                {conversations.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => setActiveConv(c)}
                    className={`cursor-pointer rounded-xl p-3 transition ${
                      activeConv?._id === c._id
                        ? "bg-indigo-100"
                        : "hover:bg-indigo-50"
                    }`}
                  >
                    <p className="font-medium text-black">
                      {c.studentId?.name || "Student"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {c.courseId?.courseTitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>

      <div className="flex flex-col h-full min-h-0">

              <div className="border-b p-4 font-semibold text-black">
                {activeConv
                  ? `${activeConv.studentId?.name} • ${activeConv.courseId?.courseTitle}`
                  : "Choose a conversation"}
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
                        className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                          mine
                            ? "bg-indigo-600 text-white"
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
                  placeholder="Enter messages for students..."
                  className="flex-1 rounded-xl border px-4 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={sendMessage}
                  className="rounded-xl bg-indigo-600 p-2 text-white hover:bg-indigo-700"
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
