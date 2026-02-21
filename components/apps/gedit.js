import React, { useState, useEffect } from 'react';
import ReactGA from 'react-ga4';
import emailjs from '@emailjs/browser';

const Gedit = () => {
    const [sending, setSending] = useState(false);
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [nameError, setNameError] = useState("");
    const [messageError, setMessageError] = useState("");

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_USER_ID) {
            emailjs.init(process.env.NEXT_PUBLIC_USER_ID);
        }
    }, []);

    const sendMessage = async () => {
        let error = false;

        if (name.trim().length === 0) {
            setName("");
            setNameError("Name must not be Empty!");
            error = true;
        } else {
            setNameError("");
        }

        if (message.trim().length === 0) {
            setMessage("");
            setMessageError("Message must not be Empty!");
            error = true;
        } else {
            setMessageError("");
        }

        if (error) return;

        setSending(true);

        const serviceID = process.env.NEXT_PUBLIC_SERVICE_ID;
        const templateID = process.env.NEXT_PUBLIC_TEMPLATE_ID;
        const templateParams = {
            'name': name,
            'subject': subject,
            'message': message,
        };

        try {
            await emailjs.send(serviceID, templateID, templateParams);
            document.getElementById("close-gedit")?.click();
        } catch (err) {
            console.error(err);
            document.getElementById("close-gedit")?.click();
        } finally {
            setSending(false);
        }

        ReactGA.event({
            category: "Send Message",
            action: `${name}, ${subject}, ${message}`
        });
    };

    return (
        <div className="w-full h-full relative flex flex-col bg-ub-cool-grey text-white select-none">
            <div className="flex items-center justify-between w-full bg-ub-gedit-light bg-opacity-60 border-b border-t border-blue-400 text-sm">
                <span className="font-bold ml-2">Send a Message to Me</span>
                <div className="flex">
                    <div onClick={sendMessage} className="border border-black bg-black bg-opacity-50 px-3 py-0.5 my-1 mx-1 rounded hover:bg-opacity-80 cursor-pointer">Send</div>
                </div>
            </div>
            <div className="relative flex-grow flex flex-col bg-ub-gedit-dark font-normal windowMainScreen">
                <div className="absolute left-0 top-0 h-full px-2 bg-ub-gedit-darker"></div>
                <div className="relative">
                    <input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className=" w-full text-ubt-gedit-orange focus:bg-ub-gedit-light outline-none font-medium text-sm pl-6 py-0.5 bg-transparent" 
                        placeholder={nameError || "Your Email / Name :"} 
                        spellCheck="false" 
                        autoComplete="off" 
                        type="text" 
                    />
                    <span className="absolute left-1 top-1/2 transform -translate-y-1/2 font-bold light text-sm text-ubt-gedit-blue">1</span>
                </div>
                <div className="relative">
                    <input 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className=" w-full my-1 text-ubt-gedit-blue focus:bg-ub-gedit-light gedit-subject outline-none text-sm font-normal pl-6 py-0.5 bg-transparent" 
                        placeholder="subject (may be a feedback for this website!)" 
                        spellCheck="false" 
                        autoComplete="off" 
                        type="text" 
                    />
                    <span className="absolute left-1 top-1/2 transform -translate-y-1/2 font-bold  text-sm text-ubt-gedit-blue">2</span>
                </div>
                <div className="relative flex-grow">
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className=" w-full gedit-message font-light text-sm resize-none h-full windowMainScreen outline-none tracking-wider pl-6 py-1 bg-transparent" 
                        placeholder={messageError || "Message"} 
                        spellCheck="false" 
                        autoComplete="none" 
                    />
                    <span className="absolute left-1 top-1 font-bold  text-sm text-ubt-gedit-blue">3</span>
                </div>
            </div>
            {sending && (
                <div className="flex justify-center items-center animate-pulse h-full w-full bg-gray-400 bg-opacity-30 absolute top-0 left-0">
                    <img className={" w-8 absolute animate-spin"} src="./themes/Yaru/status/process-working-symbolic.svg" alt="Ubuntu Process Symbol" />
                </div>
            )}
        </div>
    );
};

export default Gedit;

export const displayGedit = () => {
    return <Gedit />;
};
