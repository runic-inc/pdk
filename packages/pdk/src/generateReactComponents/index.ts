import fs from 'fs/promises';
import path from 'path';
import prettier from 'prettier';
import { Schema } from '../generateApi/ponderMocks';
import { analyzeAPI } from '../helpers/api';
import { loadPonderSchema } from '../helpers/config';

const trpcRouteToHookName = (route: string) => "use" + route.split(".").map((word, index) => index === 1 ? word.charAt(0).toUpperCase() + word.slice(1) : word).join("");

export async function generateReactComponents(configPath: string) {
    const trpcRouter = path.join(path.dirname(configPath), "src", "api", "index.ts");
    const componentsDir = path.join(path.dirname(configPath), "app", "components");
    const ponderSchemaPath = path.join(path.dirname(configPath), "ponder.schema.ts");
    const ponderSchema = await loadPonderSchema(ponderSchemaPath);
    if (ponderSchema === undefined) {
        console.error('Error importing PonderSchema');
        return;
    }

    const apiStructure = analyzeAPI(trpcRouter);

    for (let key in apiStructure) {
        if (key.includes("getPaginated")) {
            const hook = trpcRouteToHookName(key);
            const entity = key.split(".")[0];
            const template = generateComponent("getPaginated", entity, hook, ponderSchema);
            const formatted = await prettier.format(template, { parser: 'typescript', tabWidth: 4, printWidth: 120 });
            const componentFile = path.join(componentsDir, `${entity}List.tsx`);
            await fs.writeFile(componentFile, formatted, 'utf-8');
        }
    }
}

function generateComponent(template: string, entity: string, hook: string, ponderSchema: Schema) {
    const td = ponderSchema[entity].tableDefinition ?? {};
    const vars: string[] = [];
    const varOutputs: string[] = [];
    for (const v in td) {
        let optional = "";
        let bigint = "";
        if (td[v].type === "one" || td[v].type === "many") {
            // ignore joins at the moment
            continue;
        }
        if (v === "timestamp") {
            varOutputs.push(`<p>Timestamp: {new Date(Number(timestamp)).toLocaleString()}</p>`);
            vars.push(v);
            continue;
        }
        if (td[v].isOptional) {
            optional = "|| ''";
            if (td[v].type === "bigint") {
                bigint = "?.toString()";

            }
        } else if (td[v].type === "bigint") {
            bigint = ".toString()";
        }
        varOutputs.push(`<p>${v}: {${v}${bigint}${optional}}</p>`);
        vars.push(v);
    }

    return `
import React from 'react';
import { ${hook} } from '../hooks';
import PaginatedList from './PaginatedList';
import { inferProcedureOutput } from '@trpc/server';
import { AppRouter } from '../../src/api';


type ${entity}Item = inferProcedureOutput<AppRouter['${entity}']['getPaginated']>['items'][number];

const ${entity}ItemComponent: React.FC<${entity}Item> = ({ ${vars.join(",")}}) => (
    <div key={id}>
        ${varOutputs.join("\n")}    
    </div>
);

const ${entity}List: React.FC = () => (
    <PaginatedList<${entity}Item>
        useQueryHook={${hook}}
        itemsPerPage={10}
        renderItem={(item) => <${entity}ItemComponent {...item} />}
        title="${entity} List"
    />
);

export default ${entity}List;
`
}