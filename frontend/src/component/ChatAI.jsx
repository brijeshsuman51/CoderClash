import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useForm } from 'react-hook-form'
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Send } from 'lucide-react';
import axiosClient from "../utils/axiosClient";

function ChatAi({ problem }) {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: 'Tell me! How can i help you' }] }
    ]);
    const [showLoginError, setShowLoginError] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm()
    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, showLoginError])

    useEffect(() => {
        if (isAuthenticated) {
            setShowLoginError(false);
        }
    }, [isAuthenticated]);

    const onSubmit = async (data) => {
        if (!isAuthenticated) {
            setShowLoginError(true);
            return;
        }

        const newMessage = { role: 'user', parts: [{ text: data.message }] };
        const newHistory = [...messages, newMessage];

        setMessages(newHistory);
        setShowLoginError(false);
        reset();

        try {
            const response = await axiosClient.post("/ai/chatBot", {
                messages: newHistory,
                title: problem.title,
                description: problem.description,
                testCases: problem.testCases,
                startCode: problem.startCode
            })

            setMessages(prev => [
                ...prev,
                {
                    role: 'model',
                    parts: [{ text: response.data.message }]
                }
            ])

        } catch (error) {
            console.error("API Error:", error)
            setMessages(
                prev => [...prev, {
                    role: 'model',
                    parts: [{ text: "Error from Ai Chat" }]
                }]
            )
        }
    }

    return (
        <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {showLoginError ? (
                    <div className="alert alert-error mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="font-bold">Error</h4>
                            <p>Please login to use Chat AI</p>
                            <div className="mt-2">
                                <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
                                    Go to Login
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`chat ${msg.role === 'user' ? "chat-end" : "chat-start"}`}
                        >
                            <div className="chat-bubble bg-base-200 text-base-content">
                                {msg.parts[0].text}
                            </div>
                        </div>
                    ))
                )}
                
                <div ref={messagesEndRef} />
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="sticky bottom-0 p-4 bg-base-100 border-t"
            >
                <div className="flex items-center">
                    <input
                        placeholder="Ask Me Anything"
                        className="input input-bordered flex-1"
                        {...register("message", { required: true, minLength: 1 })} 
                    />
                    <button
                        type="submit"
                        className="btn btn-ghost ml-2"
                        disabled={!!errors.message} 
                    >
                        <Send size={20} />
                    </button>
                </div>

            </form>
        </div>
    )
}

export default ChatAi;