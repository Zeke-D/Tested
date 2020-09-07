<script>
    import axios from 'axios';
    import  { onMount } from 'svelte';
    let title = "Login"
    let email = '';
    let password = '';

    async function postData() {
        // console.log(event);
        // console.log(event.target);
        // console.log(event.target.email.value);
        // console.log(event.target.password.value);
        console.log(email)
        console.log(password)

       
        await axios.post('localhost:1337/API/v1/user/login', {
            email,
            password
        })
        .then(response => {
            console.log(response);
        })
        .catch(err => {
            console.log(err)
        })
    }


</script>
<div class="formContainer">
    <h1>{title}</h1>
    <form on:submit|preventDefault="{postData}" method="POST">
        <label for="email">Email</label>
        <input bind:value={email} id="email" type="text" placeholder="Email"/>
        <label for="password">Password</label>
        <input bind:value={password} id="password" type="password" placeholder="Password"/>
        <button on:submit="{postData}" action="submit">Login</button>
    </form>
</div>

<style>
    .formContainer {
        width: 200px;
        color: red;
        margin: 0 auto;
        padding-top: 25vh;
    }
</style>