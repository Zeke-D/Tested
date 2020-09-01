<script>
  import { Map, Geocoder, controls } from '@beyonk/svelte-mapbox';
  import {onMount} from 'svelte';
  import TimeSelect from './forms/TimeSelect.svelte';
  import TestedMarker from './TestedMarker.svelte';
  import TimeFinder from './forms/TimeFinder.svelte';
  const { GeolocateControl, NavigationControl, ScaleControl } = controls;
  const apiPublicKey = "pk.eyJ1IjoicHNldWRvbnltb250eSIsImEiOiJjanR6eDE5MTIzOHo3NDRuc28yOTgxem4wIn0.pnMTUhVyBUsJFKOx9waTJA";
  let mapComponent;
  const boston = [42.361145, -71.057083];
  let [lat, long] = boston;
  let currentLocation = {
    latitude: undefined,
    longitude: undefined
  }
  let domTimeSelect;
  export let errors = [];
  export let range = 1; //range in miles
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log(pos.coords);
          currentLocation.latitude  = pos.coords.latitude;
          currentLocation.longitude = pos.coords.longitude;
          mapComponent.setCenter([currentLocation.longitude, currentLocation.latitude], 12);
        }
      );
    }
    else {
      errors.append('The browser does not support location.')
    }
  }
  onMount(() => {
    getLocation();
  });
</script>

<style>
.mapContainer {
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
}
</style>

{#each errors as error, i}
  <blockquote>error</blockquote>
{/each}
<TimeSelect bind:domRep={domTimeSelect} availableTimes={["6:00pm", "6:15pm", "6:30pm"]}/>
<TimeFinder/>
{#if domTimeSelect !== undefined}
  <div class="mapContainer">
    <Map
      accessToken="{apiPublicKey}"
      bind:this={mapComponent}
      style="mapbox://styles/pseudonymonty/ckeggpduq00t619pnkcdgcang"
    >
      {#if currentLocation.latitude !== undefined && currentLocation.longitude !== undefined}
      <TestedMarker lat={lat} lng={long} color="rgb(60,170,220)" innerHTML={domTimeSelect}/>
      <TestedMarker lat={currentLocation.latitude} lng={currentLocation.longitude} color="rgb(200,120,120)"/>
      {/if}
      <NavigationControl />
      <!-- <GeolocateControl options={{ some: 'control-option' }} on:eventname={eventHandler} /> -->
      <ScaleControl />
    </Map>
  </div>
{/if}