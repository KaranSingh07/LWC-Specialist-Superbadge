import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';

const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';

export default class BoatsNearMe extends LightningElement {
	@api boatTypeId;

	mapMarkers = [];
	isLoading = true;
	isRendered;
	latitude;
	longitude;

	// Add the wired method from the Apex Class
	// Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
	// Handle the result and calls createMapMarkers
	@wire(getBoatsByLocation, {
		latitude: '$latitude',
		longitude: '$longitude',
		boatTypeId: '$boatTypeId',
	})
	wiredBoatsJSON({ error, data }) {
		if (data) {
			this.createMapMarkers(JSON.parse(data));
		} else if (error) {
			this.dispatchEvent(
				new ShowToastEvent({ variant: ERROR_VARIANT, title: ERROR_TITLE, message: error })
			);
		}
		this.isLoading = false;
	}

	// Controls the isRendered property
	// Calls getLocationFromBrowser()
	renderedCallback() {
		if (!this.isRendered) {
			this.getLocationFromBrowser();
			this.isRendered = true;
		}
	}

	// Gets the location from the Browser
	// position => {latitude and longitude}
	getLocationFromBrowser() {
		console.log('~~ get location from browser');
		navigator.geolocation.getCurrentPosition(
			(position) => {
				this.latitude = position.coords.latitude;
				this.longitude = position.coords.longitude;
			},
			(error) => {
				console.log('Error in getting location: ' + error);
			}
		);
	}

	// Creates the map markers
	createMapMarkers(boatData) {
		const newMarkers = boatData.map((boat) => {
			return {
				location: {
					Longitude: boat.Geolocation__Longitude__s,
					Latitude: boat.Geolocation__Latitude__s,
				},
				title: boat.Name,
			};
		});
		newMarkers.unshift(this.getCurrentLocationMarker());
		this.mapMarkers = [...newMarkers];
	}

	getCurrentLocationMarker() {
		return {
			location: {
				Longitude: this.longitude,
				Latitude: this.latitude,
			},
			title: LABEL_YOU_ARE_HERE,
			icon: ICON_STANDARD_USER,
		};
	}
}
