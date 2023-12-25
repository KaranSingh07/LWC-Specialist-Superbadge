import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';

export default class BoatReviews extends NavigationMixin(LightningElement) {
	@api
	get recordId() {
		return this.boatId;
	}
	set recordId(value) {
		this.boatId = value;
		this.getReviews();
	}

	@api refresh() {
		this.getReviews();
	}

	boatId;
	boatReviews;
	error;
	isLoading;

	getReviews() {
		if (!this.boatId) return;

		this.isLoading = true;
		getAllReviews({ boatId: this.boatId })
			.then((data) => {
				this.boatReviews = data;
			})
			.catch((error) => {
				this.error = error.message;
			})
			.finally(() => {
				this.isLoading = false;
			});
	}

	navigateToRecord(event) {
		event.preventDefault();
		event.stopPropagation();
		let recordId = event.target.dataset.recordId;
		this[NavigationMixin.Navigate]({
			type: 'standard__recordPage',
			attributes: {
				recordId: recordId,
				objectApiName: 'User',
				actionName: 'view',
			},
		});
	}

	get reviewsToShow() {
		return this.boatReviews && this.boatReviews.length;
	}
}
