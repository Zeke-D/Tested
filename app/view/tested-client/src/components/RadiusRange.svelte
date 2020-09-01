<script>
	import { onMount } from 'svelte'
	import { getContext } from 'svelte'
    import { contextKey } from '@beyonk/svelte-mapbox/src/mapbox.js'
	const { getMap, getMapbox } = getContext(contextKey)
	const map = getMap()
	const mapbox = getMapbox()
	
	export let radius = 1;
	export let color = rgba(100, 150, 200, .5);
	export let popupClassName = "defaultPopup";
	let marker = null
	onMount(() => {
      	console.log("bar:", innerHTML);
	  	const popup = new mapbox.Popup({
			offset: 25,
			class: popupClassName
		  }).setDOMContent(innerHTML ? innerHTML : null);

	  	marker = new mapbox.Marker({color}).setLngLat([ lng, lat ])
	   	.setPopup(popup)
		.addTo(map);

	  	return () => marker.remove();
	})
	export function getMarker () {
	  return marker;
	}
</script>