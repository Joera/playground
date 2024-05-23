<script lang="ts">
  import type { PageData } from "./$types";
  export let data: PageData;
</script>

<svelte:head>
  <title>overview</title>
  <meta name="description" content="dashboard this app" />
</svelte:head>

<section class="py-5">
  <div class="container-fluid">
    <div class="card">
      <div class="card-header border-bottom">
        <h3 class="h4 mb-0">Users from fake Data</h3>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table text-sm mb-0 table-striped table-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {#each data.users as user, i}
                <tr>
                  <th scope="row">{ i + 1 }</th>
                  <td>{user.name.firstname}</td>
                  <td>{user.name.lastname}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</section>
