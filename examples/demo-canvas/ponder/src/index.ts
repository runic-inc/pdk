import { canvas, bubble } from '../ponder.schema';
import sharp from 'sharp';
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


patchwork.after('PatchworkProtocol:setup', async () => {
    bubbleService.bubbles = [];
    console.log('SIMD enabled:', sharp.simd());
});

patchwork.after('PatchworkProtocol:Assign', async ({ event, context }) => {
    if (
        event.args.targetAddress == process.env.CANVAS_ADDRESS &&
        (event.args.fragmentAddress == process.env.BUBBLE_ADDRESS)
    ) {
        const id = event.args.fragmentAddress + '_' + event.args.fragmentTokenId;

        const [color1, color2] = bubbleService.generateBubbleColors(event.transaction.from, Number(event.transaction.blockNumber));
        console.log('color1', color1, 'color2', color2);
        const b = await context.db.insert(bubble).values({
            id,
            owner: event.args.owner,
            tokenId: event.args.fragmentTokenId,
            mintTxId: event.transaction.hash,
            // address: event.args.fragmentAddress,
            contractId: event.args.targetAddress,
            minter: event.transaction.from,
            canvasId: event.args.targetTokenId.toString(),
            // decorator1: color1,
            // decorator2: color2,
            // txHash: event.transaction.hash,
            // dateTimeAdded: Number(event.block.timestamp),
        });
        // const latest = await Fragment.findUnique({ id });
        // if (!latest) return console.log('Could not find bubble');

        //comment out while testing minting
        //await bubbleService.drawCanvas(b, context);

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
