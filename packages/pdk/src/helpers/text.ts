import _ from 'lodash';

export function pascalCase(str: string): string {
    return _.upperFirst(_.camelCase(str));
}
