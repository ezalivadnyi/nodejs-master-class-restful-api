// Define a request router
import {IRouter} from "./Interfaces";
import routerHandlers from "./lib/routerHandlers";

const router: IRouter = {
    '404': routerHandlers.notFound,
    'ping': routerHandlers.ping,
    'users': routerHandlers.users,
    'tokens': routerHandlers.tokens,
    'checks': routerHandlers.checks,
};

export default router;