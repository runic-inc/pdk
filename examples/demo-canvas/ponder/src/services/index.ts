import { BrickService } from './brick.service';
import { BubbleService } from './bubble.service';
import { MetadataService } from './metadata.service';
import { PathsService } from './paths.service';

const pathsService = new PathsService();
const bubbleService = new BubbleService();
const brickService = new BrickService();
const metadataService = new MetadataService(bubbleService, brickService, pathsService);

export { brickService, bubbleService, metadataService, pathsService };
