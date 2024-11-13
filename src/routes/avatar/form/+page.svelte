<script lang="ts">




</script>


<form id="profile">

    <h2>Hello ... </h2>

    <label>What is your name?</label>
    <input type="text" name="name" id="name" placeholder="Name">

    <label>What do you do?</label>
    <input type="text" name="description" id="name" placeholder="Description">

    <label>Image</label>
    <input type="text" name="image" id="name" placeholder="Image">

    <button>submit</button>
</form>


<style>

    form {

        display: flex;
        flex-direction: column;
        align-items: center;

        label {
            margin-bottom: .75rem;
        }

        input {
            border: 1px white solid;
            margin-bottom: 1.5rem;
            width: 100%;
        }

        button {
            margin-top: 1.5rem;
        }
    }


</style>

