import { bubble, canvas } from '../ponder.schema';
import { patchwork } from './generated/patchwork';
import { bubbleService } from './services';

/*
 * Write your contract event handlers here by hooking into our Patchwork event bus.
 * These will run as side effects at the end of Ponder's indexing processes.
 *
 * Example:
 *
 * import { patchwork } from "./generated/patchwork";
 * patchwork.after('MyContractName:Transfer', ({ event, context}) => { doMyThing() });
 *
 */

patchwork.after('Bubble:Transfer', async ({ event, context }) => {
    const bubbleId = `${event.log.address}:${event.args.tokenId}`;
    const newBubble = await context.db.find(bubble, { id: bubbleId });
    try {
        if (newBubble) await bubbleService.drawCanvas(newBubble, context);
    } catch (error) {
        console.log(error);
        throw error;
    }
});

patchwork.after('Canvas:Transfer', async ({ event, context }) => {
    if (parseInt(event.args.from, 16) == 0) {
        await context.db.insert(canvas).values({
            tokenId: event.args.tokenId,
            owner: event.args.to,
            contractId: '',
            id: '',
            mintTxId: event.transaction.hash,
            name: 'Canvas #' + (Number(event.args.tokenId) + 1),
        });
    }
});
