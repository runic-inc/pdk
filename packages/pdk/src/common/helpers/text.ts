import _ from 'lodash';

export function pascalCase(str: string): string {
    return _.upperFirst(_.camelCase(str));
}

export function envVarCase(str: string): string {
    return _.chain(str).snakeCase().toUpper().value();
}

export function dockerProjectName(projectName: string): string {
    return _.chain(projectName)
        .kebabCase()
        .thru((name) => (/^[a-z]/.test(name) ? name : `project-${name}`))
        .value();
}
