import { LightningElement, api, wire, track } from 'lwc';
import BOATMC from '@salesforce/messageChannel/boatMessageChannel__c';
import { subscribe, MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import { getRecord } from 'lightning/uiRecordApi';

const LONGITUDE_FIELD = 'Boat__c.Geolocation__Longitude__s';
const LATITUDE_FIELD = 'Boat__c.Geolocation__Latitude__s';
const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];

export default class BoatMap extends LightningElement {
	@api get recordId() {
		return this.boatId;
	}
	set recordId(value) {
		this.setAttribute('boatId', value);
		this.boatId = value;
	}

	@wire(MessageContext)
	messageContext;

	subscription = null;

	boatId = '';
	error = undefined;

	@track mapMarkers = [];

	connectedCallback() {
		this.subscribeMC();
	}

	// Getting record's location to construct map markers using recordId
	@wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
	wiredRecord({ error, data }) {
		if (data) {
			this.error = undefined;
			const longitude = data.fields.Geolocation__Longitude__s.value;
			const latitude = data.fields.Geolocation__Latitude__s.value;
			this.updateMap(longitude, latitude);
		} else if (error) {
			this.error = error;
			this.boatId = undefined;
			this.mapMarkers = [];
		}
	}

	subscribeMC() {
		// recordId is populated on Record Pages, and this component should not update when this component is on a record page.
		if (this.subscription || this.recordId) {
			return;
		}

		// Subscribe to the message channel to retrieve the recordId and explicitly assign it to boatId.
		this.subscription = subscribe(
			this.messageContext,
			BOATMC,
			(message) => {
				this.boatId = message.recordId;
			},
			{ scope: APPLICATION_SCOPE }
		);
	}

	// Creates the map markers array with the current boat's location for the map.
	updateMap(longitude, latitude) {
		const mapMarker = {
			location: {
				Longitude: longitude,
				Latitude: latitude,
			},
		};
		this.mapMarkers = [mapMarker];
	}

	get showMap() {
		return this.mapMarkers.length > 0;
	}
}
