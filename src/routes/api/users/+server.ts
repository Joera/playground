import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import type { User } from '$lib/types';

let users: User[] = [
    { id: 1, username: 'John Doe', email: 'john@example.com' },
    { id: 2, username: 'Jane Doe', email: 'jane@example.com' }
];

export const GET: RequestHandler = async () => {
    return json(users);
};

export const POST: RequestHandler = async ({ request }) => {
    const { username, email } = await request.json();
    const id = users.length + 1;
    const newUser = { id, username, email };
    users.push(newUser);
    return json(newUser);
};

export const PUT: RequestHandler = async ({ request }) => {
    const { id, username, email } = await request.json();
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
        users[userIndex] = { id, username, email };
        return json(users[userIndex]);
    }
    return json({ error: 'User not found' }, { status: 404 });
};

export const DELETE: RequestHandler = async ({ request }) => {
    const { id } = await request.json();
    users = users.filter(user => user.id !== id);
    return json({ success: true });
};
