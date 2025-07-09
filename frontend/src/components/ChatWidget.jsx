import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import useUserStore from '../store/userStore';

const API_BASE = import.meta.env.VITE_BACKEND_BASE_URL

const ChatWidget = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [flowStep, setFlowStep] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [ticketData, setTicketData] = useState({ issueType: '', message: '', image: null, orderId: '', productNames: [] });

  const { user } = useUserStore();
  const isLoggedIn = !!user?.email;

  const chatRef = useRef(null);
  const chatMessagesRef = useRef(null);

  const fetchRecentOrder = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/api/payment/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.orders?.length > 0) {
        setRecentOrders(data.orders);
        setFlowStep('selectOrder');
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: `Here are your recent orders. Please enter the number of the order you want to raise an issue for:\n` +
              data.orders.map((order, i) => `${i + 1}. 📦 Order ID: ${order.orderId} 🛒 Products: ${order.productNames.join(', ')}`).join('\n')
          }
        ]);
      }
    } catch (err) {
      console.error('❌ Error fetching recent order:', err);
    }
  };

  const sendMessage = async (message) => {
    setMessages((prev) => [...prev, { sender: 'user', text: message }]);
    setIsBotTyping(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
        if (data.askToRaiseTicket) {
          if (data.category) {
            setTicketData((prev) => ({ ...prev, issueType: data.category, message }));
          } else {
            setTicketData((prev) => ({ ...prev, message }));
          }
          setMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: `Would you like to raise a support ticket${data.category ? ` for this \"${data.category}\" issue` : ''}? (yes/no)`,
            },
          ]);
          setFlowStep('confirmRaise');
        }
        setIsBotTyping(false);
      }, 1000);
    } catch (err) {
      setIsBotTyping(false);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: '❌ Server error. Try later.' },
      ]);
    }
  };

  const handleUserReply = async (message) => {
    const delayBotMessage = (text, cb = null) => {
      setIsBotTyping(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: 'bot', text }]);
        setIsBotTyping(false);
        if (cb) cb();
      }, 1000);
    };

    if (flowStep === 'confirmRaise') {
      setMessages((prev) => [...prev, { sender: 'user', text: message }]);
      if (message.toLowerCase() === 'yes') {
        fetchRecentOrder();
      } else {
        setFlowStep(null);
        setTicketData({ issueType: '', message: '', image: null, orderId: '', productNames: [] });
        delayBotMessage('Alright! Let me know if you need anything else.');
      }
    } else if (flowStep === 'selectOrder') {
      const index = parseInt(message) - 1;
      if (recentOrders[index]) {
        const selectedOrder = recentOrders[index];
        setTicketData(prev => ({ ...prev, orderId: selectedOrder.orderId, productNames: selectedOrder.productNames }));
        setFlowStep('selectProducts');
        setMessages(prev => [...prev, { sender: 'user', text: message }]);
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: `Which product(s) do you want to raise issue for?\n` +
                    selectedOrder.productNames.map((p, i) => `${i + 1}. ${p}`).join('\n') +
                    `\nPlease enter numbers separated by commas (e.g., 1,3)`
            }
          ]);
        }, 500);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Invalid selection. Please enter a number between 1 and 3.' }]);
      }
    } else if (flowStep === 'selectProducts') {
      setMessages(prev => [...prev, { sender: 'user', text: message }]);
      const indexes = message.split(',').map(m => parseInt(m.trim()) - 1);
      const validProducts = indexes.filter(i => ticketData.productNames[i]).map(i => ticketData.productNames[i]);
      if (validProducts.length > 0) {
        setTicketData(prev => ({ ...prev, productNames: validProducts }));
        setFlowStep('selectType');
        delayBotMessage(`Please select your issue type:\n1. Order Issue\n2. Payment & Refunds\n3. Product Issue\n4. Account & Login\n5. Website Bug/Technical Problem\n6. Request Related`);
      } else {
        delayBotMessage('Invalid product selection. Please try again.');
      }
    } else if (flowStep === 'selectType') {
      const types = ['Order Issue', 'Payment & Refunds', 'Product Issue', 'Account & Login', 'Website Bug/Technical Problem', 'Request Related'];
      const index = parseInt(message) - 1;
      setMessages((prev) => [...prev, { sender: 'user', text: message }]);
      if (types[index]) {
        setTicketData((prev) => ({ ...prev, issueType: types[index] }));
        setFlowStep('enterMessage');
        delayBotMessage('Please describe your issue.');
      } else {
        delayBotMessage('Invalid selection. Please enter a number from 1 to 6.');
      }
    } else if (flowStep === 'enterMessage') {
      setTicketData((prev) => ({ ...prev, message }));
      setMessages((prev) => [...prev, { sender: 'user', text: message }]);
      setFlowStep('askImage');
      delayBotMessage('Do you have any screenshot or image related to this issue? (yes/no)');
    } else if (flowStep === 'askImage') {
      setMessages((prev) => [...prev, { sender: 'user', text: message }]);
      if (message.toLowerCase() === 'yes') {
        document.getElementById('chat-image-upload').click();
        setFlowStep('waitImage');
      } else {
        setFlowStep('anyOther');
        delayBotMessage('Do you have any other issue to report? (yes/no)');
      }
    } else if (flowStep === 'anyOther') {
      setMessages((prev) => [...prev, { sender: 'user', text: message }]);
      if (message.toLowerCase() === 'no') {
        const formData = new FormData();
        formData.append('issueType', ticketData.issueType);
        formData.append('message', ticketData.message);
        formData.append('orderId', ticketData.orderId || '');
        formData.append('productNames', JSON.stringify(ticketData.productNames || []));
        if (ticketData.image) formData.append('images', ticketData.image);
        try {
          setIsBotTyping(true);
          const res = await fetch(`${API_BASE}/api/tickets`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            body: formData,
          });
          const data = await res.json();
          setTimeout(() => {
            setMessages((prev) => [...prev, { sender: 'bot', text: `✅ Ticket raised! Ticket ID: ${data.ticketNumber}` }]);
            setIsBotTyping(false);
          }, 1000);
        } catch (err) {
          delayBotMessage('❌ Failed to raise ticket. Try again later.');
        } finally {
          setFlowStep(null);
          setTicketData({ issueType: '', message: '', image: null, orderId: '', productNames: [] });
        }
      } else {
        setFlowStep('selectType');
        delayBotMessage(`Please select your issue type:\n1. Order Issue\n2. Payment & Refunds\n3. Product Issue\n4. Account & Login\n5. Website Bug/Technical Problem\n6. Request Related`);
      }
    } else {
      if (flowStep === null) {
        sendMessage(message);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleUserReply(inputValue.trim());
      setInputValue('');
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setTicketData((prev) => ({ ...prev, image: e.target.files[0] }));
      setFlowStep('anyOther');
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Do you have any other issue to report? (yes/no)' }]);
    }
  };

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages, isBotTyping]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div ref={chatRef} className="chat-widget border rounded-lg p-4 shadow-2xl w-80 bg-white mb-2">
          <div className="font-semibold text-lg mb-2 text-blue-700">Uma Assistant</div>
          {!isLoggedIn ? (
            <div className="text-red-500 text-sm">⚠️ Please login to use the chatbot.</div>
          ) : (
            <>
              <div ref={chatMessagesRef} className="chat-messages h-64 overflow-y-auto space-y-2 mb-3 flex flex-col">
                {messages.map((msg, i) => (
                  <div key={i} className={`p-2 rounded-lg max-w-xs text-sm ${msg.sender === 'user' ? 'bg-blue-100 self-end ml-auto' : 'bg-gray-100 self-start'}`}>{msg.text}</div>
                ))}
                {isBotTyping && <div className="text-gray-500 text-xs self-start animate-pulse">Typing...</div>}
              </div>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type your message..." className="flex-1 bg-white border p-2 rounded-md text-sm" />
                <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm">Send</button>
              </form>
              <input id="chat-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </>
          )}
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow flex items-center gap-2">
        <MessageCircle size={18} />
        Uma Assistant
      </button>
    </div>
  );
};

export default ChatWidget;

