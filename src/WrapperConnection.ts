export type WrapperType = "ios" | "android"

export default class WrapperConnection {
    private onMessage!: (data: any) => void;
    private onClose!: () => void;

    private wrapperType: WrapperType;
    private channelName: string;

    private bc: BroadcastChannel | undefined;

    constructor(wrapperType: WrapperType, channelName: string = "wrapperChannel") {
        this.wrapperType = wrapperType;
        this.channelName = channelName;
    }

    public init(onMessage: (data: any) => void, onClose: () => void) {
        console.info(`Starting wrapper: ${this.wrapperType} BC channel: ${this.channelName}`)
        this.onClose = onClose;
        this.onMessage = onMessage;
        this.createBroadcastChannel();
    }

    public close() {
        if (this.bc) {
            console.info(`Closing wrapper: ${this.wrapperType} BC channel: ${this.channelName}`);
            this.bc.close();
            this.onClose();
        }
    }

    public send(obj: object) {
        if (this.bc) {
            const data = this.safeStringify(obj);
            this.bc.postMessage(data);
            console.info(`>>> Sending data: ${data}`);
        } else {
            console.warn("Non-established BC cannot send messages");
        }
    }

    private safeStringify(obj: any) {
        let result;
        try {
            result = JSON.stringify(obj);
        } catch (err) {
            console.warn(`Failed to parse supplied json: ${obj}`);
            result = `"Parsing failed": ${err}`;
        }
        return result;
    }

    private createBroadcastChannel() {
        const bc = new BroadcastChannel(this.channelName);

        bc.onmessage = (ev) => {
            let data;
            let parsed = false;
            try {
                data = JSON.parse(ev.data.toString());
                parsed = true;
                console.info(`<<< Rcv ${JSON.stringify(data)}`);
            } catch (err) {
                console.warn(`Failed to parse ${ev.data.toString()}`)
            }

            if (parsed) {
                this.onMessage(data);
            }
        }

        bc.onmessageerror = (err) => {
            console.warn(`BC error: ${err}`);
        }

        this.bc = bc;
    }
}