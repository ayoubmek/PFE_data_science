
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: any;
        Echo: any;
    }
}

window.Pusher = Pusher;















const echo = {
    channel: (name: string) => ({
        listen: (event: string, callback: Function) => { },
        stopListening: (event: string) => { },
    }),
    leave: (name: string) => { },
    private: (name: string) => ({
        listen: (event: string, callback: Function) => { },
    })
};

export default echo;