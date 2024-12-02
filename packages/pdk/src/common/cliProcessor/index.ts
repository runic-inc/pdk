import path from 'path';
import { CLIProcessor } from './cliProcessor';

const CONTRACT_SCHEMA = path.join(__dirname, '../../../../../schemas/patchwork-contract-config.schema.json');
const PROJECT_SCHEMA = path.join(__dirname, '../../../../../schemas/patchwork-project-config.schema.json');

const cliProcessor = new CLIProcessor(CONTRACT_SCHEMA, PROJECT_SCHEMA);

export { cliProcessor };
