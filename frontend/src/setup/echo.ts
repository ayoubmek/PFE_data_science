// import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: any;
        Echo: any;
    }
}

window.Pusher = Pusher;

// const echo = new Echo({
//     broadcaster: 'pusher',
//     key: 'my-app-key',
//     wsHost: window.location.hostname,
//     wsPort: 8081,
//     wssPort: 8081,
//     forceTLS: false,
//     encrypted: false,
//     disableStats: true,
//     cluster: 'mt1',
//     enabledTransports: ['ws', 'wss'],
// });

// Export a mock object or null to satisfy imports
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
