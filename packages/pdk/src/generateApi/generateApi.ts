import fs from 'fs/promises';
import path from 'path'
import { register } from 'ts-node';


export async function generateAPI(ponderSchema: string) {
    try {
        register({
            transpileOnly: true,
            compilerOptions: {
                module: 'CommonJS',
                moduleResolution: 'node',
            }
        });

        const schemaModule = await import(ponderSchema);
            
        // Get the default export, which should be the createSchema function
        const createSchema = schemaModule.default;

        if (typeof createSchema !== 'function') {
            throw new Error("createSchema is not a function");
        }

        // Call createSchema
        const schema = createSchema((p: any) => {
            console.log("Schema created:", p);
            return {};  // Return an empty object for now
        });

        console.log("Schema result:", schema);
    } catch (err) {
        console.error('Error:', err);
    }
}