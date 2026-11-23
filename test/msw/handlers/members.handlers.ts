import { http, HttpResponse, type RequestHandler } from 'msw';
import { invitePreview, membersList } from '../../fixtures/members';

export const membersHandlers: RequestHandler[] = [
    http.get('*/members', (): Response => HttpResponse.json(membersList())),
    http.get('*/invites/:token', (): Response => HttpResponse.json(invitePreview()))
];
