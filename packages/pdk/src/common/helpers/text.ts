import _ from 'lodash';

export function pascalCase(str: string): string {
    return _.upperFirst(_.camelCase(str));
}

export function envVarCase(str: string): string {
    return _.chain(str).snakeCase().toUpper().value();
}
