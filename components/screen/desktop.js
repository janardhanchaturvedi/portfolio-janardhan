import React, { useState, useEffect, useRef, useCallback } from 'react';
import BackgroundImage from '../util components/background-image';
import SideBar from './side_bar';
import apps from '../../apps.config';
import Window from '../base/window';
import UbuntuApp from '../base/ubuntu_app';
import AllApplications from '../screen/all-applications'
import DesktopMenu from '../context menus/desktop-menu';
import DefaultMenu from '../context menus/default';
import ReactGA from 'react-ga4';

const Desktop = (props) => {
    const [focusedWindows, setFocusedWindows] = useState({});
    const [closedWindows, setClosedWindows] = useState({});
    const [allAppsView, setAllAppsView] = useState(false);
    const [overlappedWindows, setOverlappedWindows] = useState({});
    const [disabledApps, setDisabledApps] = useState({});
    const [favouriteApps, setFavouriteApps] = useState({});
    const [hideSideBar, setHideSideBar] = useState(false);
    const [minimizedWindows, setMinimizedWindows] = useState({});
    const [desktopApps, setDesktopApps] = useState([]);
    const [contextMenus, setContextMenus] = useState({ desktop: false, default: false });
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
    const [showNameBar, setShowNameBar] = useState(false);

    const appStack = useRef([]);
    const initFavourite = useRef({});

    useEffect(() => {
        ReactGA.send({ hitType: "pageview", page: "/desktop", title: "Custom Title" });
        fetchAppsData();
        setContextListeners();
        setEventListeners();
        checkForNewFolders();

        return () => {
            removeContextListeners();
        };
    }, []);

    const checkForNewFolders = () => {
        let new_folders = localStorage.getItem('new_folders');
        if (new_folders === null || new_folders === undefined) {
            localStorage.setItem("new_folders", JSON.stringify([]));
        } else {
            new_folders = JSON.parse(new_folders);
            new_folders.forEach(folder => {
                if (!apps.some(app => app.id === `new-folder-${folder.id}`)) {
                    apps.push({
                        id: `new-folder-${folder.id}`,
                        title: folder.name,
                        icon: './themes/Yaru/system/folder.png',
                        disabled: true,
                        favourite: false,
                        desktop_shortcut: true,
                        screen: () => { },
                    });
                }
            });
            updateAppsData();
        }
    };

    const setEventListeners = () => {
        const settingsBtn = document.getElementById("open-settings");
        if (settingsBtn) {
            settingsBtn.addEventListener("click", () => openApp("settings"));
        }
    };

    const setContextListeners = () => {
        document.addEventListener('contextmenu', checkContextMenu);
        document.addEventListener('click', hideAllContextMenu);
    };

    const removeContextListeners = () => {
        document.removeEventListener("contextmenu", checkContextMenu);
        document.removeEventListener("click", hideAllContextMenu);
    };

    const checkContextMenu = (e) => {
        e.preventDefault();
        hideAllContextMenu();
        const pos = getMenuPosition(e);
        
        // Simple bounds check (approximated, since we don't have menu width yet easily)
        let x = pos.posx;
        let y = pos.posy;
        if (x + 200 > window.innerWidth) x -= 200;
        if (y + 250 > window.innerHeight) y -= 250;

        setMenuPos({ x, y });

        if (e.target.dataset.context === "desktop-area") {
            ReactGA.event({ category: `Context Menu`, action: `Opened Desktop Context Menu` });
            setContextMenus({ desktop: true, default: false });
        } else {
            ReactGA.event({ category: `Context Menu`, action: `Opened Default Context Menu` });
            setContextMenus({ desktop: false, default: true });
        }
    };

    const hideAllContextMenu = () => {
        setContextMenus({ desktop: false, default: false });
    };

    const getMenuPosition = (e) => {
        let posx = 0;
        let posy = 0;
        if (!e) e = window.event;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        return { posx, posy };
    };

    const fetchAppsData = () => {
        let focused = {}, closed = {}, disabled = {}, favourite = {}, overlapped = {}, minimized = {};
        let desktop = [];
        apps.forEach((app) => {
            focused[app.id] = false;
            closed[app.id] = true;
            disabled[app.id] = app.disabled;
            favourite[app.id] = app.favourite;
            overlapped[app.id] = false;
            minimized[app.id] = false;
            if (app.desktop_shortcut) desktop.push(app.id);
        });
        setFocusedWindows(focused);
        setClosedWindows(closed);
        setDisabledApps(disabled);
        setFavouriteApps(favourite);
        setOverlappedWindows(overlapped);
        setMinimizedWindows(minimized);
        setDesktopApps(desktop);
        initFavourite.current = { ...favourite };
    };

    const updateAppsData = () => {
        let focused = {}, closed = {}, favourite = {}, minimized = {}, disabled = {};
        let desktop = [];
        apps.forEach((app) => {
            focused[app.id] = focusedWindows[app.id] !== undefined ? focusedWindows[app.id] : false;
            minimized[app.id] = minimizedWindows[app.id] !== undefined ? minimizedWindows[app.id] : false;
            disabled[app.id] = app.disabled;
            closed[app.id] = closedWindows[app.id] !== undefined ? closedWindows[app.id] : true;
            favourite[app.id] = app.favourite;
            if (app.desktop_shortcut) desktop.push(app.id);
        });
        setFocusedWindows(focused);
        setClosedWindows(closed);
        setDisabledApps(disabled);
        setMinimizedWindows(minimized);
        setFavouriteApps(favourite);
        setDesktopApps(desktop);
        initFavourite.current = { ...favourite };
    };

    const openApp = (objId) => {
        ReactGA.event({ category: `Open App`, action: `Opened ${objId} window` });
        if (disabledApps[objId]) return;

        if (minimizedWindows[objId]) {
            focus(objId);
            const r = document.querySelector("#" + objId);
            if (r) {
                r.style.transform = `translate(${r.style.getPropertyValue("--window-transform-x")},${r.style.getPropertyValue("--window-transform-y")}) scale(1)`;
            }
            setMinimizedWindows(prev => ({ ...prev, [objId]: false }));
            return;
        }

        if (appStack.current.includes(objId)) {
            focus(objId);
        } else {
            let frequentApps = localStorage.getItem('frequentApps') ? JSON.parse(localStorage.getItem('frequentApps')) : [];
            let currentAppIdx = frequentApps.findIndex(app => app.id === objId);
            if (currentAppIdx !== -1) {
                frequentApps[currentAppIdx].frequency += 1;
            } else {
                frequentApps.push({ id: objId, frequency: 1 });
            }
            frequentApps.sort((a, b) => b.frequency - a.frequency);
            localStorage.setItem("frequentApps", JSON.stringify(frequentApps));

            setTimeout(() => {
                setFavouriteApps(prev => ({ ...prev, [objId]: true }));
                setClosedWindows(prev => ({ ...prev, [objId]: false }));
                setAllAppsView(false);
                focus(objId);
                appStack.current.push(objId);
            }, 200);
        }
    };

    const closeApp = (objId) => {
        const idx = appStack.current.indexOf(objId);
        if (idx !== -1) appStack.current.splice(idx, 1);
        giveFocusToLastApp();
        handleHideSideBar(null, false);
        setClosedWindows(prev => ({ ...prev, [objId]: true }));
        if (initFavourite.current[objId] === false) {
            setFavouriteApps(prev => ({ ...prev, [objId]: false }));
        }
    };

    const focus = (objId) => {
        setFocusedWindows(prev => {
            const next = {};
            Object.keys(prev).forEach(key => next[key] = (key === objId));
            return next;
        });
    };

    const handleHideSideBar = (objId, hide) => {
        if (hide === hideSideBar) return;
        if (objId === null) {
            if (hide === false) setHideSideBar(false);
            else {
                for (const key in overlappedWindows) {
                    if (overlappedWindows[key]) {
                        setHideSideBar(true);
                        return;
                    }
                }
            }
            return;
        }
        if (hide === false) {
            for (const key in overlappedWindows) {
                if (overlappedWindows[key] && key !== objId) return;
            }
        }
        setOverlappedWindows(prev => ({ ...prev, [objId]: hide }));
        setHideSideBar(hide);
    };

    const hasMinimised = (objId) => {
        setMinimizedWindows(prev => ({ ...prev, [objId]: true }));
        setFocusedWindows(prev => ({ ...prev, [objId]: false }));
        handleHideSideBar(null, false);
        giveFocusToLastApp();
    };

    const giveFocusToLastApp = () => {
        if (!checkAllMinimised()) {
            for (const id of [...appStack.current].reverse()) {
                if (!minimizedWindows[id]) {
                    focus(id);
                    break;
                }
            }
        }
    };

    const checkAllMinimised = () => {
        for (const key in minimizedWindows) {
            if (!closedWindows[key] && !minimizedWindows[key]) return false;
        }
        return true;
    };

    const addNewFolder = () => setShowNameBar(true);

    const addToDesktop = (folder_name) => {
        folder_name = folder_name.trim();
        let folder_id = folder_name.replace(/\s+/g, '-').toLowerCase();
        apps.push({
            id: `new-folder-${folder_id}`,
            title: folder_name,
            icon: './themes/Yaru/system/folder.png',
            disabled: true,
            favourite: false,
            desktop_shortcut: true,
            screen: () => { },
        });
        let new_folders = JSON.parse(localStorage.getItem('new_folders') || '[]');
        new_folders.push({ id: `new-folder-${folder_id}`, name: folder_name });
        localStorage.setItem("new_folders", JSON.stringify(new_folders));
        setShowNameBar(false);
        updateAppsData();
    };

    return (
        <div className="h-full w-full flex flex-col items-end justify-start content-start flex-wrap-reverse pt-8 bg-transparent relative overflow-hidden overscroll-none window-parent">
            <div className="absolute h-full w-full bg-transparent" data-context="desktop-area">
                {apps.map((app, index) => !closedWindows[app.id] && (
                    <Window 
                        key={index} 
                        title={app.title} 
                        id={app.id} 
                        screen={app.screen} 
                        addFolder={addToDesktop} 
                        closed={closeApp} 
                        openApp={openApp} 
                        focus={focus} 
                        isFocused={focusedWindows[app.id]} 
                        hideSideBar={handleHideSideBar} 
                        hasMinimised={hasMinimised} 
                        minimized={minimizedWindows[app.id]} 
                        changeBackgroundImage={props.changeBackgroundImage} 
                        bg_image_name={props.bg_image_name} 
                    />
                ))}
            </div>
            <BackgroundImage img={props.bg_image_name} />
            <SideBar 
                apps={apps} 
                hide={hideSideBar} 
                hideSideBar={handleHideSideBar} 
                favourite_apps={favouriteApps} 
                showAllApps={() => setAllAppsView(!allAppsView)} 
                allAppsView={allAppsView} 
                closed_windows={closedWindows} 
                focused_windows={focusedWindows} 
                isMinimized={minimizedWindows} 
                openAppByAppId={openApp} 
            />
            {apps.map((app, index) => desktopApps.includes(app.id) && (
                <UbuntuApp key={index} name={app.title} id={app.id} icon={app.icon} openApp={openApp} isExternalApp={app.isExternalApp} url={app.url} />
            ))}
            <DesktopMenu active={contextMenus.desktop} x={menuPos.x} y={menuPos.y} openApp={openApp} addNewFolder={addNewFolder} />
            <DefaultMenu active={contextMenus.default} x={menuPos.x} y={menuPos.y} />
            {showNameBar && (
                <div className="absolute rounded-md top-1/2 left-1/2 text-center text-white font-light text-sm bg-ub-cool-grey transform -translate-y-1/2 -translate-x-1/2 sm:w-96 w-3/4 z-50">
                    <div className="w-full flex flex-col justify-around items-start pl-6 pb-8 pt-6">
                        <span>New folder name</span>
                        <input className="outline-none mt-5 px-1 w-10/12 context-menu-bg border-2 border-yellow-700 rounded py-0.5" id="folder-name-input" type="text" autoComplete="off" spellCheck="false" autoFocus />
                    </div>
                    <div className="flex">
                        <div onClick={() => addToDesktop(document.getElementById("folder-name-input").value)} className="w-1/2 px-4 py-2 border border-gray-900 border-opacity-50 border-r-0 hover:bg-ub-warm-grey hover:bg-opacity-10 hover:border-opacity-50 cursor-pointer">Create</div>
                        <div onClick={() => setShowNameBar(false)} className="w-1/2 px-4 py-2 border border-gray-900 border-opacity-50 hover:bg-ub-warm-grey hover:bg-opacity-10 hover:border-opacity-50 cursor-pointer">Cancel</div>
                    </div>
                </div>
            )}
            {allAppsView && <AllApplications apps={apps} recentApps={appStack.current} openApp={openApp} />}
        </div>
    );
};

export default Desktop;