import { error } from '@sveltejs/kit';

export async function load({ fetch }) {
  const res = await fetch('https://fakestoreapi.com/users');
	const users = await res.json();

	if (users) {
		return { users };
	}

	error(404, 'Not found');
}