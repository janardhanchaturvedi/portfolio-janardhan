import React, { useState, useEffect, useRef } from 'react';
const Parser = require('expr-eval').Parser;

const parser = new Parser({
    operators: {
        add: true,
        concatenate: true,
        conditional: true,
        divide: true,
        factorial: true,
        multiply: true,
        power: true,
        remainder: true,
        subtract: true,
        logical: false,
        comparison: false,
        'in': false,
        assignment: true
    }
});

const Calc = (props) => {
    const [terminalRows, setTerminalRows] = useState([]);
    const [prevCommands, setPrevCommands] = useState([]);
    const [commandsIndex, setCommandsIndex] = useState(-1);
    const [currentCommand, setCurrentCommand] = useState("");
    const [cursorVisible, setCursorVisible] = useState(true);
    const [variables, setVariables] = useState({});

    const inputRef = useRef(null);
    const rowsCount = useRef(2);

    useEffect(() => {
        reStartTerminal();
        const interval = setInterval(() => setCursorVisible(v => !v), 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, [terminalRows]);

    const reStartTerminal = () => {
        setTerminalRows([]);
        rowsCount.current = 2;
        appendTerminalRow();
    };

    const appendTerminalRow = () => {
        const id = rowsCount.current;
        setTerminalRows(prev => [...prev, { id, command: "", result: "", isFinished: false }]);
        rowsCount.current += 2;
        setCurrentCommand("");
    };

    const handleCommands = (command, rowId) => {
        let result = "";
        switch (command.trim()) {
            case "clear":
                reStartTerminal();
                return;
            case "exit":
                document.getElementById("close-calc")?.click();
                return;
            case "help":
                result = "Available Commands: <br/>Operators: + - * / % ^ <br/>Mathematical functions: abs, acos, asin, atan, cos, sin, tan, exp, log, sqrt, etc. <br/>Constants: E, PI <br/>Assignments: x=1";
                break;
            default:
                result = evaluateExp(command);
        }

        setTerminalRows(prev => {
            const newRows = [...prev];
            const idx = newRows.findIndex(r => r.id === rowId);
            if (idx !== -1) {
                newRows[idx].command = command;
                newRows[idx].result = result;
                newRows[idx].isFinished = true;
            }
            return newRows;
        });
        setTimeout(appendTerminalRow, 10);
    };

    const evaluateExp = (command) => {
        try {
            const expr = parser.parse(command);
            const res = parser.evaluate(command, variables);
            if (expr.tokens.length === 2 && expr.tokens[1].type === "IOP2") {
                setVariables(prev => ({ ...prev, [expr.variables()[0]]: res }));
            }
            return res.toString();
        } catch (e) {
            return "Invalid Expression";
        }
    };

    const checkKey = (e, rowId) => {
        if (e.key === "Enter") {
            handleCommands(currentCommand, rowId);
            setPrevCommands(prev => [...prev, currentCommand]);
            setCommandsIndex(prevCommands.length);
        } else if (e.key === "ArrowUp") {
            if (commandsIndex >= 0) {
                setCurrentCommand(prevCommands[commandsIndex]);
                setCommandsIndex(v => v - 1);
            }
        } else if (e.key === "ArrowDown") {
            if (commandsIndex < prevCommands.length - 1) {
                const idx = commandsIndex + 1;
                setCurrentCommand(prevCommands[idx]);
                setCommandsIndex(idx);
            } else {
                setCurrentCommand("");
            }
        }
    };

    return (
        <div className="h-full w-full bg-ub-drk-abrgn text-ubt-grey opacity-100 p-1 float-left font-normal overflow-y-auto">
            <div>C-style arbitrary precision calculator (version 2.12.7.2)</div>
            <div>Calc is open software.</div>
            <div>[ type "exit" to exit, "clear" to clear, "help" for help.]</div>
            <div className="text-white text-sm font-bold mt-2" id="calculator-body">
                {terminalRows.map(row => (
                    <div key={row.id}>
                        <div className="flex w-full h-5">
                            <div className="flex text-ubt-green mr-2">;</div>
                            <div className="bg-transparent relative flex-1 overflow-hidden">
                                <span className="float-left whitespace-pre pb-1 font-normal">{row.isFinished ? row.command : currentCommand}</span>
                                {!row.isFinished && (
                                    <>
                                        <div className="float-left mt-1 w-1.5 h-3.5 bg-white" style={{ visibility: cursorVisible ? 'visible' : 'hidden' }}></div>
                                        <input 
                                            ref={inputRef}
                                            value={currentCommand}
                                            onChange={(e) => setCurrentCommand(e.target.value)}
                                            onKeyDown={(e) => checkKey(e, row.id)}
                                            className="absolute top-0 left-0 w-full opacity-0 outline-none"
                                            autoFocus
                                            autoComplete="off"
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                        {row.result && <div className="my-2 font-normal" dangerouslySetInnerHTML={{ __html: row.result }}></div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calc;

export const displayTerminalCalc = (addFolder, openApp) => <Calc addFolder={addFolder} openApp={openApp} />;