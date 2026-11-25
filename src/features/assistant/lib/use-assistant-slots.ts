import { useContext } from 'react';
import { AssistantSlotsContext, type AssistantSlots } from './assistant-slots';

export function useAssistantSlots(): AssistantSlots {
    return useContext(AssistantSlotsContext);
}
