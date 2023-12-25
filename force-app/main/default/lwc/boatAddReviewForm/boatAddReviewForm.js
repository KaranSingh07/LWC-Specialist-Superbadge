import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import BOAT_REVIEW_OBJECT from '@salesforce/schema/BoatReview__c';
import NAME_FIELD from '@salesforce/schema/BoatReview__c.Name';
import COMMENT_FIELD from '@salesforce/schema/BoatReview__c.Comment__c';

const SUCCESS_TITLE = 'Review Created!';
const SUCCESS_VARIANT = 'success';

export default class BoatAddReviewForm extends LightningElement {
	@api
	get recordId() {
		return this.boatId;
	}
	set recordId(value) {
		this.boatId = value;
	}

	boatId;
	rating;
	boatReviewObject = BOAT_REVIEW_OBJECT;
	nameField = NAME_FIELD;
	commentField = COMMENT_FIELD;
	labelSubject = 'Review Subject';
	labelRating = 'Rating';

	handleRatingChanged(event) {
		this.rating = event.detail.rating;
	}

	handleSubmit(event) {
		event.preventDefault();
		const fields = event.detail.fields;
		fields.Rating__c = this.rating;
		fields.Boat__c = this.boatId;
		this.template.querySelector('lightning-record-edit-form').submit(fields);
	}

	handleSuccess() {
		this.dispatchEvent(
			new ShowToastEvent({
				variant: SUCCESS_VARIANT,
				title: SUCCESS_TITLE,
			})
		);
		this.dispatchEvent(new CustomEvent('createreview'));
		this.handleReset();
	}

	handleReset() {
		const inputFields = this.template.querySelectorAll('lightning-input-field');
		if (inputFields) {
			inputFields.forEach((field) => {
				field.reset();
			});
		}
	}
}
