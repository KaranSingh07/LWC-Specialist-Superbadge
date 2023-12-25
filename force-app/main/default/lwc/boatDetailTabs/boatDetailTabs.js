import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import BOATMC from '@salesforce/messageChannel/boatMessageChannel__c';
import { subscribe, MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import { getRecord } from 'lightning/uiRecordApi';
import { getFieldValue } from 'lightning/uiRecordApi';

import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';

import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
	boatId;
	wiredRecord;

	@wire(MessageContext)
	messageContext;

	subscription = null;

	label = {
		labelDetails,
		labelReviews,
		labelAddReview,
		labelFullDetails,
		labelPleaseSelectABoat,
	};

	@wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
	wiredData(response) {
		this.wiredRecord = response;
	}

	connectedCallback() {
		this.subscribeMC();
	}

	subscribeMC() {
		if (this.subscription) return;

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

	navigateToRecordViewPage() {
		this[NavigationMixin.Navigate]({
			type: 'standard__recordPage',
			attributes: {
				recordId: this.boatId,
				actionName: 'view',
			},
		});
	}

	handleReviewCreated() {
		this.template.querySelector('lightning-tabset').activeTabValue = this.label.labelReviews;
		this.template.querySelector('c-boat-reviews').refresh();
	}

	get boatName() {
		if (this.wiredRecord.data) {
			return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
		}
		return null;
	}

	get detailsTabIconName() {
		if (this.wiredRecord.data) return 'utility:anchor';
		return null;
	}
}
