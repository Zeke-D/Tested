<script>
    export let date = "";
    export let radius = 1;
</script>
<form method="get" class="picker">
    <label for="date">Date: {date}
        <input bind:value={date} id="date" type="date"/>
    </label>
    <label for="radius">Radius: {radius} mile{radius == 1 ? "" : "s"}</label>
    <input bind:value={radius} id="radius" type="range" min="0" max="20" step=".5"/>
    <button type="submit">Find new times</button>
</form>
<style>
    .picker {
        width: 200px;
        padding: 40px;
        position: absolute;
        top: 20px;
        left: 20px;
        z-index: 1000;
        border-radius: 5px;
        background-color: rgba(255, 255, 255, .7);
    }
</style>