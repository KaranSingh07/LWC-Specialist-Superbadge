import { api, LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getSimilarBoats from '@salesforce/apex/BoatDataService.getSimilarBoats';

const BOAT_OBJECT = 'Boat__c';

export default class SimilarBoats extends NavigationMixin(LightningElement) {
	@api similarBy;

	@api get recordId() {
		return this.boatId;
	}
	set recordId(value) {
		this.boatId = value;
		this.setAttribute('boatId', value);
	}

	@wire(getSimilarBoats, { boatId: '$boatId', similarBy: '$similarBy' })
	similarBoats({ error, data }) {
		if (data) {
			this.relatedBoats = data;
			this.error = undefined;
		} else if (error) {
			this.error = error;
		}
	}

	currentBoat;
	relatedBoats;
	boatId;
	error;

	openBoatDetailPage(event) {
		this[NavigationMixin.Navigate]({
			type: 'standard__recordPage',
			attributes: {
				recordId: event.detail.boatId,
				objectApiName: BOAT_OBJECT,
				actionName: 'view',
			},
		});
	}

	get getTitle() {
		return 'Similar boats by ' + this.similarBy;
	}

	get noBoats() {
		return !(this.relatedBoats && this.relatedBoats.length > 0);
	}
}
