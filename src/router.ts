// Define a request router
import { IRouter } from "./Interfaces";
import { checks, notFound, ping, tokens, users } from "./lib/routerHandlers";

const router: IRouter = {
    '404': notFound,
    'ping': ping,
    'users': users,
    'tokens': tokens,
    'checks': checks,
};

export default router;