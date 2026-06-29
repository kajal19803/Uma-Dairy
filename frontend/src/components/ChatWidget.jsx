import React, { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Image as ImageIcon,
  X,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_BACKEND_BASE_URL;

const ChatWidget = () => {
  // ===========================
  // UI
  // ===========================

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);

  // ===========================
  // Messages
  // ===========================

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
`👋 Welcome to Uma Dairy!

I'm your Uma Assistant.

I can help you with:

🧀 Products
📦 Orders
🚚 Delivery
💳 Payments
🎫 Support Tickets
💰 Refunds
❓ General Questions

How may I help you today?`,
    },
  ]);

  // ===========================
  // Ticket Flow
  // ===========================

  const [flowStep, setFlowStep] = useState(null);

  const [ticketData, setTicketData] = useState({
    issueType: "",
    message: "",
    image: null,
    orderId: "",
    productNames: [],
  });

  // ===========================
  // Orders
  // ===========================

  const [recentOrders, setRecentOrders] = useState([]);

  // ===========================
  // Refs
  // ===========================

  const chatRef = useRef(null);
  const messagesRef = useRef(null);
  const imageInputRef = useRef(null);

  // ===========================
  // Auth
  // ===========================

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  // ===========================
  // Delay Bot Message
  // ===========================

  const delayBotMessage = (text, callback = null) => {
    setIsBotTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text,
        },
      ]);

      setIsBotTyping(false);

      if (callback) callback();
    }, 800);
  };

  // ===========================
  // Send Normal Chat Message
  // ===========================

  const sendMessage = async (message) => {
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: message,
      },
    ]);

    setIsBotTyping(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          message,
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text:
              data.reply ||
              "Sorry, I couldn't understand your question.",
          },
        ]);

        setIsBotTyping(false);

        if (data.askToRaiseTicket) {
          setFlowStep("confirmRaise");

          delayBotMessage(
`⚠️ This issue may require assistance from our support team.

Would you like to raise a support ticket?

Reply with:

✅ yes
❌ no`
          );
        }
      }, 700);
    } catch (err) {
      console.error(err);

      setIsBotTyping(false);

      delayBotMessage(
        "❌ Server unavailable. Please try again later."
      );
    }
  };
    // ===========================
  // Fetch Recent Orders
  // ===========================

  const fetchRecentOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/payment/recent`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await res.json();

const orders = response.orders || [];

if (orders.length === 0) {
  delayBotMessage(
    "📦 No previous orders were found in your account."
  );
  setFlowStep(null);
  return;
}

setRecentOrders(orders);

const orderList = orders
  .slice(0, 5)
  .map(
    (order, index) =>
      `${index + 1}. ${order.orderId} (${order.productNames.length} products)`
  )
  .join("\n");
  

      setFlowStep("selectOrder");

      delayBotMessage(
`Please select the order related to your issue.

${orderList}

Reply with the order number.
Example:
1`
      );
    } catch (err) {
      console.error(err);

      delayBotMessage(
        "❌ Unable to fetch your orders."
      );

      setFlowStep(null);
    }
  };

  // ===========================
  // Create Ticket
  // ===========================

  const createTicket = async () => {
    try {
      const formData = new FormData();

      formData.append("issueType", ticketData.issueType);
      formData.append("message", ticketData.message);
      formData.append("orderId", ticketData.orderId);

      formData.append(
        "productNames",
        JSON.stringify(ticketData.productNames)
      );

      if (ticketData.image) {
        formData.append("images", ticketData.image);
      }

      const res = await fetch(`${API_BASE}/api/tickets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      delayBotMessage(
`🎉 Ticket Created Successfully

━━━━━━━━━━━━━━

🎫 Ticket Number
${data.ticketNumber}

📌 Status
Open

📧 A confirmation email has been sent to your registered email.

Our support team will contact you shortly.

Thank you for choosing Uma Dairy 💚`
      );

      setFlowStep(null);

      setTicketData({
        issueType: "",
        message: "",
        image: null,
        orderId: "",
        productNames: [],
      });

    } catch (err) {
      console.error(err);

      delayBotMessage(
        "❌ Failed to create support ticket."
      );

      setFlowStep(null);
    }
  };

  // ===========================
  // Handle User Reply
  // ===========================

  const handleUserReply = async (message) => {

    switch (flowStep) {

      case "confirmRaise":

        setMessages((prev) => [
          ...prev,
          {
            sender: "user",
            text: message,
          },
        ]);

        if (message.toLowerCase() !== "yes") {

          delayBotMessage(
            "Alright 😊 Let me know if you need anything else."
          );

          setFlowStep(null);

          return;
        }

        if (!isLoggedIn) {

          delayBotMessage(
            "⚠️ Please login first to raise a support ticket."
          );

          setFlowStep(null);

          return;
        }

        fetchRecentOrders();

        break;

      case "selectOrder": {

        setMessages((prev) => [
          ...prev,
          {
            sender: "user",
            text: message,
          },
        ]);

        const index = Number(message) - 1;

        if (
          index < 0 ||
          index >= recentOrders.length
        ) {
          delayBotMessage(
            "❌ Invalid order number."
          );
          return;
        }

        const order = recentOrders[index];

        setTicketData((prev) => ({
          ...prev,
          orderId: order.orderId,
          productNames: order.productNames,
        }));

        setFlowStep("selectProducts");

        delayBotMessage(
`Please select affected product(s).

${order.productNames
.map(
(name,i)=>
`${i+1}. ${name}`
)
.join("\n")}

Example:
1
or
1,2`
        );

        break;
      }
            case "selectProducts": {

        setMessages((prev) => [
          ...prev,
          {
            sender: "user",
            text: message,
          },
        ]);

        const indexes = message
          .split(",")
          .map((i) => Number(i.trim()) - 1);

        const order = recentOrders.find(
  (o) => o.orderId === ticketData.orderId
);

const selectedProducts = indexes
  .filter((i) => order?.productNames?.[i])
  .map((i) => order.productNames[i]);

        if (!selectedProducts.length) {
          delayBotMessage(
            "❌ Invalid product selection.\nPlease enter valid product number(s)."
          );
          return;
        }

        setTicketData((prev) => ({
          ...prev,
          productNames: selectedProducts,
        }));

        setFlowStep("selectIssue");

        delayBotMessage(
`Please select Issue Type

1️⃣ Order Issue
2️⃣ Payment & Refunds
3️⃣ Product Issue
4️⃣ Account & Login
5️⃣ Website Bug / Technical Problem
6️⃣ Request Related
7️⃣ Other`
);

        break;
      }

      case "selectIssue": {

        setMessages((prev) => [
          ...prev,
          {
            sender: "user",
            text: message,
          },
        ]);

        const issueTypes = [
  "Order Issue",
  "Payment & Refunds",
  "Product Issue",
  "Account & Login",
  "Website Bug/Technical Problem",
  "Request Related",
  "Other",
];

        const issue = issueTypes[Number(message) - 1];

        if (!issue) {
          delayBotMessage(
            "❌ Please choose a valid issue type."
          );
          return;
        }

        setTicketData((prev) => ({
          ...prev,
          issueType: issue,
        }));

        setFlowStep("enterDescription");

        delayBotMessage(
          "📝 Please describe your issue in detail."
        );

        break;
      }

      case "enterDescription":

        setMessages((prev) => [
          ...prev,
          {
            sender: "user",
            text: message,
          },
        ]);

        setTicketData((prev) => ({
          ...prev,
          message,
        }));

        setFlowStep("askScreenshot");

        delayBotMessage(
`📷 Do you want to upload any screenshot?

Reply:

✅ yes

or

❌ no`
        );

        break;

      case "askScreenshot":

        setMessages((prev) => [
          ...prev,
          {
            sender: "user",
            text: message,
          },
        ]);

        if (message.toLowerCase() === "yes") {

          imageInputRef.current.click();

          setFlowStep("waitingImage");

        } else {

          delayBotMessage(
            "🎫 Creating your support ticket..."
          );

          await createTicket();

        }

        break;

      default:

        sendMessage(message);

        break;
    }
  };
    // ===========================
  // Handle Image Upload
  // ===========================

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: "📷 Screenshot uploaded",
      },
    ]);

    setTicketData((prev) => ({
      ...prev,
      image: file,
    }));

    delayBotMessage("📤 Uploading screenshot...");

    // Wait for state update
    setTimeout(async () => {
      await createTicket();
    }, 300);
  };

  // ===========================
  // Handle Form Submit
  // ===========================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const msg = inputValue.trim();

    setInputValue("");

    handleUserReply(msg);
  };

  // ===========================
  // Auto Scroll
  // ===========================

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop =
        messagesRef.current.scrollHeight;
    }
  }, [messages, isBotTyping]);

  // ===========================
  // Close Chat on Outside Click
  // ===========================

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        chatRef.current &&
        !chatRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // ===========================
  // ESC Key Close
  // ===========================

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener(
        "keydown",
        handleEsc
      );
    };
  }, []);

  // ===========================
  // Focus Input on Open
  // ===========================

  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);
 return (
    <>
      {/* Floating Button */}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-[#F97354] to-[#ff9b6b] text-white shadow-2xl hover:scale-110 transition duration-300 flex items-center justify-center"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}

      {isOpen && (
        <div
          ref={chatRef}
          className="fixed bottom-6 right-6 w-[390px] h-[680px] bg-white rounded-[30px] shadow-2xl overflow-hidden flex flex-col border border-orange-100 z-50"
        >
          {/* Header */}

          <div className="bg-gradient-to-r from-[#F97354] to-[#ff9b6b] px-6 py-5">

            <div className="flex justify-between items-center">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">

                  <Bot size={30} color="#F97354" />

                </div>

                <div>

                  <h2 className="text-white text-xl font-bold">

                    Uma Assistant

                  </h2>

                  <p className="text-orange-100 text-sm">

                    Fresh • Pure • Farm to Home

                  </p>

                </div>

              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:rotate-90 transition"
              >
                <X size={24} />
              </button>

            </div>

          </div>

          {/* Messages */}

          <div
            ref={messagesRef}
            className="flex-1 overflow-y-auto bg-[#FFF8F1] px-4 py-5 space-y-5"
          >

            {messages.map((msg, index) => (

              <div
                key={index}
                className={`flex ${
                  msg.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                {msg.sender === "bot" && (

                  <div className="mr-3 w-10 h-10 rounded-full bg-[#F97354] flex items-center justify-center shrink-0">

                    <Bot size={18} color="white" />

                  </div>

                )}

                <div
                  className={`max-w-[78%] px-5 py-4 rounded-3xl whitespace-pre-line shadow-md leading-7 text-[15px]
                  ${
                    msg.sender === "user"
                      ? "bg-[#F97354] text-white rounded-br-md"
                      : "bg-white text-gray-700 rounded-bl-md"
                  }`}
                >

                  {msg.text}

                </div>

                {msg.sender === "user" && (

                  <div className="ml-3 w-10 h-10 rounded-full bg-[#3B2418] flex items-center justify-center shrink-0">

                    <User size={18} color="white" />

                  </div>

                )}

              </div>

            ))}

            {/* Typing Animation */}

            {isBotTyping && (

              <div className="flex items-center">

                <div className="mr-3 w-10 h-10 rounded-full bg-[#F97354] flex items-center justify-center">

                  <Bot size={18} color="white" />

                </div>

                <div className="bg-white rounded-3xl px-5 py-4 shadow-md">

                  <div className="flex gap-2">

                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>

                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:.2s]"></span>

                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:.4s]"></span>

                  </div>

                </div>

              </div>

            )}

            {/* Hidden Image Input */}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

          </div>
                    {/* Bottom Input */}

          <form
            onSubmit={handleSubmit}
            className="bg-white border-t border-orange-100 p-4"
          >
            <div className="flex items-center gap-3">

              {/* Upload Image */}

              <button
                type="button"
                onClick={() => imageInputRef.current.click()}
                className="w-11 h-11 rounded-full bg-orange-100 hover:bg-orange-200 transition flex items-center justify-center shrink-0"
              >
                <ImageIcon
                  size={20}
                  className="text-[#F97354]"
                />
              </button>

              {/* Input */}

              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 h-12 rounded-full border border-orange-200 px-5 outline-none focus:ring-2 focus:ring-[#F97354] bg-[#FFF8F1]"
              />

              {/* Send */}

              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-12 h-12 rounded-full bg-[#F97354] hover:bg-[#ea6847] disabled:bg-gray-300 text-white flex items-center justify-center transition shrink-0"
              >
                <Send size={20} />
              </button>

            </div>

            <p className="mt-3 text-center text-xs text-gray-400">
              Powered by{" "}
              <span className="font-semibold text-[#F97354]">
                Uma Assistant
              </span>
            </p>

          </form>

        </div>
      )}
    </>
  );
};

export default ChatWidget;