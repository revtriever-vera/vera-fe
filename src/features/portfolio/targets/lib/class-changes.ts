import type { UpdateClassBody } from '../../types';
import type { ClassFormInput } from '../schemas/class.schema';

export function classChanges(input: ClassFormInput, initial: ClassFormInput): UpdateClassBody {
    return {
        ...(input.name === initial.name ? {} : { name: input.name }),
        ...(input.colorKey === initial.colorKey ? {} : { colorKey: input.colorKey })
    };
}
