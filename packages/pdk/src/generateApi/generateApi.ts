import { register } from 'ts-node';
import Module from 'module';
import path from 'path';

export async function generateAPI(ponderSchema: string) {
    try {
        // Set up ts-node
        register({
            transpileOnly: true,
            compilerOptions: {
                module: 'CommonJS',
                moduleResolution: 'node',
            }
        });

        console.log("Ponder Schema:", ponderSchema);

        const originalRequire = Module.prototype.require;

        const newRequire = function(this: NodeModule, id: string) {
            if (id === '@ponder/core') {
                return require(path.resolve(__dirname, './ponderMocks'));
            }
            return originalRequire.call(this, id);
        } as NodeRequire;

        Object.assign(newRequire, originalRequire);
        Module.prototype.require = newRequire;

        try {
            const schemaModule = await import(ponderSchema);
            //console.log("Schema module:", schemaModule);

            const schema = schemaModule.default;
            console.log("Schema result:", schema);

            // TODO: Generate your tRPC API based on the schema
            //console.log("TODO: Implement API generation based on schema");
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('is not a function')) {
                console.error("Error: It seems a method is missing from our mock implementation.");
                console.error("Full error:", error);
                console.error("Please add this method to the mockSchemaBuilder in ponderMocks.ts");
            } else {
                throw error;
            }
        } finally {
            Module.prototype.require = originalRequire;
        }
    } catch (err) {
        console.error('Error:', err);
    }
}