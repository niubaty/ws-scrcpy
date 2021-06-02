import '../style/app.css';
import * as querystring from 'querystring';
import { StreamClientScrcpy } from './googDevice/client/StreamClientScrcpy';
import { ShellClient } from './googDevice/client/ShellClient';
import { DevtoolsClient } from './googDevice/client/DevtoolsClient';
import { BroadwayPlayer } from './player/BroadwayPlayer';
import { MsePlayer } from './player/MsePlayer';
import { TinyH264Player } from './player/TinyH264Player';
import { HostTracker } from './client/HostTracker';
import { StreamClientQVHack } from './applDevice/client/StreamClientQVHack';

window.onload = function (): void {
    const hash = location.hash.replace(/^#!/, '');
    const parsedQuery = querystring.parse(hash);
    const action = parsedQuery.action;

    StreamClientScrcpy.registerPlayer(BroadwayPlayer);
    StreamClientScrcpy.registerPlayer(MsePlayer);
    StreamClientScrcpy.registerPlayer(TinyH264Player);

    if (action === StreamClientScrcpy.ACTION && typeof parsedQuery.udid === 'string') {
   	console.log('[index] scrcpy start');
	StreamClientScrcpy.start(parsedQuery);
    } else if (action === StreamClientQVHack.ACTION && typeof parsedQuery.udid === 'string') {
        console.log('[index] qvh start');
	StreamClientQVHack.start(parsedQuery);
    } else if (action === ShellClient.ACTION && typeof parsedQuery.udid === 'string') {
        console.log('[index] shell start');
	ShellClient.start(parsedQuery);
    } else if (action === DevtoolsClient.ACTION) {
	console.log('[index] dvtool start');
        DevtoolsClient.start(parsedQuery);
    } else {
	console.log('[index] tracker start');
        HostTracker.start();
    }
};
