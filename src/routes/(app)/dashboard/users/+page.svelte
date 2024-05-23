<script lang="ts">
  import { onMount } from "svelte";
  import { userStore } from "$lib/stores";
  import type { User } from "$lib/types";
  let users: User[] = [];
  let username = "";
  let email = "";
  let editId: number | null = null;

  onMount(async () => {
    const response = await fetch("/api/users");
    const data = await response.json();
    userStore.set(data);
  });

  userStore.subscribe((value) => {
    users = value;
  });

  async function addUser() {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }),
    });
    const newUser = await response.json();
    userStore.update((users) => [...users, newUser]);
    username = "";
    email = "";
  }

  async function editUser() {
    if (editId !== null) {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, username, email }),
      });
      const updatedUser = await response.json();
      userStore.update((users) =>
        users.map((user) => (user.id === editId ? updatedUser : user))
      );
      username = "";
      email = "";
      editId = null;
    }
  }

  function startEdit(user: User) {
    username = user?.username || "";
    email = user.email;
    editId = user.id;
  }

  async function deleteUser(id: number) {
    await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    userStore.update((users) => users.filter((user) => user.id !== id));
  }
</script>

<section class="py-5">
  <div class="container-fluid">
    <h1>Users</h1>
    <form on:submit|preventDefault={editId === null ? addUser : editUser}>
      <div class="mb-3">
        <span class="form-label">Username</span>
        <input
          type="text"
          class="form-control"
          bind:value={username}
          required
        />
      </div>
      <div class="mb-3">
        <span class="form-label">Email</span>
        <input type="email" class="form-control" bind:value={email} required />
      </div>
      <button type="submit" class="btn btn-primary"
        >{editId === null ? "Add User" : "Edit User"}</button
      >
    </form>

    <ul class="list-group mt-4">
      {#each users as user}
        <li
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          <div>
            <strong>{user.username}</strong> - {user.email}
          </div>
          <div>
            <button
              class="btn btn-secondary btn-sm"
              on:click={() => startEdit(user)}>Edit</button
            >
            <button
              class="btn btn-danger btn-sm"
              on:click={() => deleteUser(user.id)}>Delete</button
            >
          </div>
        </li>
      {/each}
    </ul>
  </div>
</section>
