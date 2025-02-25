import { BubbleService } from './bubble.service';
import { MetadataService } from './metadata.service';
import { PathsService } from './paths.service';

const pathsService = new PathsService();
const bubbleService = new BubbleService();
const metadataService = new MetadataService(bubbleService, pathsService);

export { bubbleService, metadataService, pathsService };
