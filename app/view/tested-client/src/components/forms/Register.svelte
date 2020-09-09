<script>
    let title = "Login"
    let email = '';
    let password = '';
    let successResult = '';
    let errorResult = '';

    async function postData () {
		const res = await fetch('http://localhost:1337/API/v1/user/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				email,
                password,
                
			})
        })
        .then(async response => {
            const json = await response.json()
            let successResult = json.success
            errorResult = json.error;
            console.log(successResult)
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
        <button type="button" on:click="{postData}" action="submit">Login</button>
        {#if errorResult}
        <p>{errorResult}</p>
        {/if}
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