import fs from 'fs/promises';
import path from 'path';
import { analyzeAPI } from '../common/helpers/api';
import { loadPonderSchema } from '../common/helpers/config';
import { ErrorCode, PDKError } from '../common/helpers/error';
import { formatAndSaveFile } from '../common/helpers/file';
import { logger } from '../common/helpers/logger';
import { SchemaModule } from '../common/helpers/ponderSchemaMock';
import { pascalCase } from '../common/helpers/text';

const trpcRouteToHookName = (route: string) => 'use' + pascalCase(route);

export async function generateReactComponents(configPath: string) {
    const configDir = path.dirname(configPath);
    const trpcRouter = path.join(configDir, 'ponder', 'src', 'generated', 'api.ts');
    const componentsDir = path.join(configDir, 'www', 'src', 'generated', 'components');
    const ponderSchemaPath = path.join(configDir, 'ponder', 'ponder.schema.ts');

    // Ensure components directory exists
    try {
        await fs.mkdir(componentsDir, { recursive: true });
    } catch (error) {
        throw new PDKError(ErrorCode.DIR_NOT_FOUND, `Error creating components directory at  ${componentsDir}`);
    }

    const ponderSchema = await loadPonderSchema(ponderSchemaPath);

    const apiStructure = analyzeAPI(trpcRouter);

    for (let key in apiStructure) {
        if (key.includes('getPaginated')) {
            const hook = trpcRouteToHookName(key);
            const entity = key.split('.')[0];
            const template = generateComponent('getPaginated', entity, hook, ponderSchema);

            const componentFile = path.join(componentsDir, `${pascalCase(entity)}List.tsx`);
            await formatAndSaveFile(componentFile, template);
            logger.debug(`Generated component: ${componentFile}`);
        }
    }

    logger.info('React components generation completed successfully.');
}

function generateComponent(template: string, entity: string, hook: string, ponderSchema: SchemaModule) {
    if (ponderSchema[entity].type == 'table') {
        const td = ponderSchema[entity]._schema ?? {};
        const vars: string[] = [];
        const varOutputs: string[] = [];
        for (const v in td) {
            let optional = '';
            let bigint = '';
            if (td[v].type === 'one' || td[v].type === 'many') {
                // ignore joins at the moment
                continue;
            }
            if (v === 'timestamp') {
                varOutputs.push(`<p>Timestamp: {new Date(Number(timestamp)).toLocaleString()}</p>`);
                vars.push(v);
                continue;
            }
            if (td[v].isOptional) {
                optional = "|| ''";
                if (td[v].type === 'bigint') {
                    bigint = '?.toString()';
                }
            } else if (td[v].type === 'bigint') {
                bigint = '.toString()';
            }
            varOutputs.push(`<p>${v}: {${v}${bigint}${optional}}</p>`);
            vars.push(v);
        }
        const typeName = `${pascalCase(entity)}Item`;
        const componentName = `${pascalCase(entity)}ItemComponent`;

        return `
    import React from 'react';
    import { ${hook} } from '../hooks';
    import PaginatedList from './PaginatedList';
    import { inferProcedureOutput } from '@trpc/server';
    import { AppRouter } from '../../../ponder/src/api';


    type ${typeName} = inferProcedureOutput<AppRouter['${entity}']['getPaginated']>['items'][number];

    const ${componentName}: React.FC<${typeName}> = ({ ${vars.join(',')}}) => (
        <div key={id}>
            ${varOutputs.join('\n')}    
        </div>
    );

    const ${entity}List: React.FC = () => (
        <PaginatedList<${typeName}>
            useQueryHook={${hook}}
            itemsPerPage={10}
            renderItem={(item) => <${componentName} {...item} />}
            title="${entity} List"
        />
    );

    export default ${entity}List;
    `;
    }
    return ``;
}
