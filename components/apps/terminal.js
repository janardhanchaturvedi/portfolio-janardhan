import React, { useState, useEffect, useRef } from 'react';
import ReactGA from 'react-ga4';

const Terminal = (props) => {
    const [terminalRows, setTerminalRows] = useState([]);
    const [currentDirectory, setCurrentDirectory] = useState("~");
    const [currDirName, setCurrDirName] = useState("root");
    const [prevCommands, setPrevCommands] = useState([]);
    const [commandsIndex, setCommandsIndex] = useState(-1);
    const [cursorVisible, setCursorVisible] = useState(true);
    const [currentCommand, setCurrentCommand] = useState("");
    
    const inputRef = useRef(null);
    const terminalRowsCount = useRef(1);

    const childDirectories = {
        root: ["books", "projects", "personal-documents", "skills", "languages", "PDPU", "interests"],
        PDPU: ["Sem-6"],
        books: ["Eric-Jorgenson_The-Almanack-of-Naval-Ravikant.pdf", "Elon Musk: How the Billionaire CEO of SpaceX.pdf", "The $100 Startup_CHRIS_GUILLEBEAU.pdf", "The_Magic_of_Thinking_Big.pdf"],
        skills: ["Front-end development", "React.js", "jQuery", "Flutter", "Express.js", "SQL", "Firebase"],
        projects: ["vivek9patel-personal-portfolio", "synonyms-list-react", "economist.com-unlocked", "Improve-Codeforces", "flutter-banking-app", "Meditech-Healthcare", "CPU-Scheduling-APP-React-Native"],
        interests: ["Software Engineering", "Deep Learning", "Computer Vision"],
        languages: ["Javascript", "C++", "Java", "Dart"],
    };

    useEffect(() => {
        reStartTerminal();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCursorVisible(prev => !prev);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [terminalRows]);

    const reStartTerminal = () => {
        setTerminalRows([]);
        terminalRowsCount.current = 1;
        appendTerminalRow();
    };

    const appendTerminalRow = () => {
        const id = terminalRowsCount.current;
        setTerminalRows(prev => [...prev, { id, command: "", result: "", directory: currentDirectory }]);
        terminalRowsCount.current += 2;
        setCurrentCommand("");
    };

    const handleCommands = (command, rowId) => {
        let words = command.split(' ').filter(Boolean);
        let main = words[0];
        words.shift();
        let result = "";
        let rest = words.join(" ").trim();

        switch (main) {
            case "cd":
                if (words.length === 0 || rest === "") {
                    setCurrentDirectory("~");
                    setCurrDirName("root");
                } else if (words.length > 1) {
                    result = "too many arguments, arguments must be <1.";
                } else if (rest === "personal-documents") {
                    result = `bash /${currDirName} : Permission denied 😏`;
                } else if (childDirectories[currDirName]?.includes(rest)) {
                    setCurrentDirectory(prev => prev + "/" + rest);
                    setCurrDirName(rest);
                } else if (rest === "." || rest === ".." || rest === "../") {
                    result = "Type 'cd' to go back 😅";
                } else {
                    result = `bash: cd: ${words}: No such file or directory`;
                }
                break;
            case "ls":
                let target = words[0] || currDirName;
                if (words.length > 1) {
                    result = "too many arguments, arguments must be <1.";
                } else if (target in childDirectories) {
                    result = renderChildDirectories(target);
                } else if (target === "personal-documents") {
                    result = "Nope! 🙃";
                } else {
                    result = `ls: cannot access '${words}': No such file or directory`;
                }
                break;
            case "mkdir":
                if (words[0]) {
                    props.addFolder(words[0]);
                } else {
                    result = "mkdir: missing operand";
                }
                break;
            case "pwd":
                result = currentDirectory.replace("~", "/home/vivek");
                break;
            case "code":
                if (words[0] === "." || words.length === 0) props.openApp("vscode");
                else result = commandNotFound(main);
                break;
            case "echo":
                result = xss(words.join(" "));
                break;
            case "spotify":
                if (words[0] === "." || words.length === 0) props.openApp("spotify");
                else result = commandNotFound(main);
                break;
            case "chrome":
                if (words[0] === "." || words.length === 0) props.openApp("chrome");
                else result = commandNotFound(main);
                break;
            case "todoist":
                if (words[0] === "." || words.length === 0) props.openApp("todo-ist");
                else result = commandNotFound(main);
                break;
            case "trash":
                if (words[0] === "." || words.length === 0) props.openApp("trash");
                else result = commandNotFound(main);
                break;
            case "about-vivek":
                if (words[0] === "." || words.length === 0) props.openApp("about-vivek");
                else result = commandNotFound(main);
                break;
            case "terminal":
                if (words[0] === "." || words.length === 0) props.openApp("terminal");
                else result = commandNotFound(main);
                break;
            case "settings":
                if (words[0] === "." || words.length === 0) props.openApp("settings");
                else result = commandNotFound(main);
                break;
            case "sendmsg":
                if (words[0] === "." || words.length === 0) props.openApp("gedit");
                else result = commandNotFound(main);
                break;
            case "clear":
                reStartTerminal();
                return;
            case "exit":
                props.closeTerminal?.() || document.getElementById(`close-terminal`)?.click();
                return;
            case "sudo":
                ReactGA.event({ category: "Sudo Access", action: "lol" });
                result = "<img class=' w-2/5' src='./images/memes/used-sudo-command.webp' />";
                break;
            default:
                result = commandNotFound(main);
        }

        setTerminalRows(prev => {
            const newRows = [...prev];
            const currentIndex = newRows.findIndex(r => r.id === rowId);
            if (currentIndex !== -1) {
                newRows[currentIndex].command = command;
                newRows[currentIndex].result = result;
                newRows[currentIndex].isFinished = true;
            }
            return newRows;
        });

        setTimeout(() => appendTerminalRow(), 10);
    };

    const commandNotFound = (main) => `Command '${main}' not found, or not yet implemented.<br>Available Commands: [ cd, ls, pwd, echo, clear, exit, mkdir, code, spotify, chrome, about-vivek, todoist, trash, settings, sendmsg ]`;

    const renderChildDirectories = (parent) => {
        return `<div class="flex justify-start flex-wrap">${childDirectories[parent].map(file => `<span class="font-bold mr-2 text-ubt-blue">'${file}'</span>`).join('')}</div>`;
    };

    const xss = (str) => {
        if (!str) return "";
        return str.replace(/[&<>"'/]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' }[m]));
    };

    const checkKey = (e, rowId) => {
        if (e.key === "Enter") {
            const command = currentCommand.trim();
            if (command.length !== 0) {
                handleCommands(command, rowId);
                setPrevCommands(prev => [...prev, command]);
                setCommandsIndex(prevCommands.length);
            }
        } else if (e.key === "ArrowUp") {
            if (commandsIndex >= 0) {
                const cmd = prevCommands[commandsIndex];
                setCurrentCommand(cmd);
                setCommandsIndex(prev => prev - 1);
            }
        } else if (e.key === "ArrowDown") {
            if (commandsIndex < prevCommands.length - 1) {
                const nextIndex = commandsIndex + 1;
                const cmd = prevCommands[nextIndex];
                setCurrentCommand(cmd);
                setCommandsIndex(nextIndex);
            } else {
                setCurrentCommand("");
            }
        }
    };

    return (
        <div className="h-full w-full bg-ub-drk-abrgn text-white text-sm font-bold" id="terminal-body">
            {terminalRows.map((row, index) => (
                <div key={row.id}>
                    <div className="flex w-full h-5">
                        <div className="flex">
                            <div className=" text-ubt-green">vivek@Dell</div>
                            <div className="text-white mx-px font-medium">:</div>
                            <div className=" text-ubt-blue">{row.isFinished ? row.directory : currentDirectory}</div>
                            <div className="text-white mx-px font-medium mr-1">$</div>
                        </div>
                        <div className=" bg-transperent relative flex-1 overflow-hidden">
                            <span className=" float-left whitespace-pre pb-1 opacity-100 font-normal tracking-wider">
                                {row.isFinished ? row.command : currentCommand}
                            </span>
                            {!row.isFinished && (
                                <>
                                    <div className=" float-left mt-1 w-1.5 h-3.5 bg-white" style={{ visibility: cursorVisible ? 'visible' : 'hidden' }}></div>
                                    <input 
                                        ref={inputRef} 
                                        value={currentCommand}
                                        onChange={(e) => setCurrentCommand(e.target.value)}
                                        onKeyDown={(e) => checkKey(e, row.id)}
                                        className=" absolute top-0 left-0 w-full opacity-0 outline-none bg-transparent" 
                                        spellCheck={false} 
                                        autoFocus={true} 
                                        autoComplete="off" 
                                        type="text" 
                                    />
                                </>
                            )}
                        </div>
                    </div>
                    {row.result && (
                        <div className="my-2 font-normal" dangerouslySetInnerHTML={{ __html: row.result }}></div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Terminal;

export const displayTerminal = (addFolder, openApp) => {
    return <Terminal addFolder={addFolder} openApp={openApp} />;
};
