<script>
    export let availableTimes = []; // array of times
    export let locationName = "Testing Center"; //name of location
    export let domRep;
</script>
<div bind:this={domRep} class="formContainer">
    <h1>{locationName}</h1>
    <form method="POST" action="#">
        <select>
        {#each availableTimes as time, i}
            <option index={i}>{time}</option>
        {/each}
        </select>
        <button action="submit">Claim this time</button>
    </form>
</div>

<style>
    .formContainer {
        width: 200px;
    }
</style>