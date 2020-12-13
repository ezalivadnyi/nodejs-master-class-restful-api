import server from './lib/server';
import workers from './lib/workers';

const app = {
    init: () => {
        server.init();
        workers.init();
    },
};

app.init();

export default app;