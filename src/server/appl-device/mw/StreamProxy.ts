import WebSocket from 'ws';
import { Mw, RequestParameters } from '../../mw/Mw';
import { ControlCenterCommand } from '../../../common/ControlCenterCommand';
import { ACTION } from '../../../common/Action';
import { QvhackRunner } from '../services/QvhackRunner';
import { WebsocketProxy } from '../../mw/WebsocketProxy';

export class StreamProxy extends Mw {
    public static readonly TAG = 'IosStreamProxy';

    public static processRequest(ws: WebSocket, params: RequestParameters): StreamProxy | undefined {
        if (params.parsedQuery?.action !== ACTION.STREAM_WS_QVH) {
            return;
        }
        const { parsedQuery } = params;
        const list = parsedQuery.udid;
        if (!list) {
            return;
        }
        const udid = typeof list === 'string' ? list : list[0];
        console.log('[processRequest] streamproxy');
        return new StreamProxy(ws, udid);
    }

    private qvhProcess: QvhackRunner;
    private wsProxy?: WebsocketProxy;
    protected name: string;
    constructor(ws: WebSocket, private readonly udid: string) {
        super(ws);
        console.log('[streamproxy.ts] init');
        this.name = `[${StreamProxy.TAG}][udid: ${this.udid}]`;
        this.qvhProcess = QvhackRunner.getInstance(udid);
        this.attachEventListeners();
    }

    private onStarted = (): void => {
        const remote = this.qvhProcess.getWebSocketAddress();
        console.log('[streamproxy.ts] create ws');
	let t1 = (new Date()).getTime();
	while((new Date()).getTime()-t1<10000);
	console.log('[streamproxy.ts] now create');
        this.wsProxy = WebsocketProxy.createProxy(this.ws, remote);
        this.ws.onclose = this.onSocketClose.bind(this);
    };

    private attachEventListeners(): void {
        if (this.qvhProcess.isStarted()) {
            console.log('[streamproxy][qvh start check] true');
            this.onStarted();
        } else {
	    console.log('[streamproxy][qvh start check] false');
            this.qvhProcess.once('started', this.onStarted);
        }
    }

    protected onSocketMessage(event: WebSocket.MessageEvent): void {
        console.log('[streamproxy.ts] recv '+event.data.toString());
        let command: ControlCenterCommand;
        try {
            command = ControlCenterCommand.fromJSON(event.data.toString());
        } catch (e) {
            console.error(`[${StreamProxy.TAG}], Received message: ${event.data}. Error: ${e.message}`);
            return;
        }
        console.log(`[${StreamProxy.TAG}], Received message: type:"${command.getType()}", data:${command.getData()}.`);
    }

    protected onSocketClose(): void {
        console.log('[streamproxy.ts] on ws close');
        //if (this.wsProxy) {
        //    this.wsProxy.release();
        //}
        //this.release();
    }

    public release(): void {
        super.release();
	console.log('[streamproxy.ts] release');
        if (this.qvhProcess) {
	    console.log('[streamproxy.ts] qvhprocess release');
            this.qvhProcess.release();
            delete this.qvhProcess;
        }
        if (this.wsProxy) {
            this.wsProxy.release();
            delete this.wsProxy;
        }
    }
}
