export type WrapperType = "ios" | "android"

export default class WrapperConnection {
    private onMessage!: (data: any) => void;
    private onClose!: () => void;

    private wrapperType: WrapperType;
    private channelName: string;

    private mc: MessageChannel | undefined;

    constructor(wrapperType: WrapperType, channelName: string = "wrapperChannel") {
        this.wrapperType = wrapperType;
        this.channelName = channelName;
    }

    public init(onMessage: (data: any) => void, onClose: () => void) {
        console.info(`Starting wrapper: ${this.wrapperType} MC channel: ${this.channelName}`)
        this.onClose = onClose;
        this.onMessage = onMessage;
        this.createBroadcastChannel();
    }

    public close() {
        if (this.mc) {
            console.info(`Closing wrapper: ${this.wrapperType} MC channel: ${this.channelName}`);
            this.onClose();
        }
    }

    public send(obj: object) {
        if (this.mc) {
            const data = this.safeStringify(obj);
            this.mc.port2.postMessage(data)
            console.info(`>>> Sending data: ${data}`);
        } else {
            console.warn("Non-established MC cannot send messages");
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
        const channel = new MessageChannel();

        channel.port1.onmessage = (ev) => {
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

        channel.port1.onmessageerror = (err) => {
            console.warn(`MC error: ${err}`);
        }

        this.mc = channel;
    }
}