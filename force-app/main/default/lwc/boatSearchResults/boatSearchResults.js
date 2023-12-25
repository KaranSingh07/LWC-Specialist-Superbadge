import { LightningElement, api, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import BOATMC from '@salesforce/messageChannel/boatMessageChannel__c';

import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';

const LOADING_EVENT = 'loading',
	DONE_LOADING_EVENT = 'doneloading',
	SUCCESS_VARIANT = 'success',
	SUCCESS_TITLE = 'Success',
	MESSAGE_SHIP_IT = 'Ship It!',
	ERROR_TITLE = 'Error',
	ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
	@api searchBoats(boatTypeId) {
		this.notifyLoading(true);
		this.boatTypeId = boatTypeId;
	}

	@wire(getBoats, { boatTypeId: '$boatTypeId' })
	wiredBoats({ data, error }) {
		if (data) {
			this.boats = data;
		} else if (error) {
			console.log('Error: ' + error);
		}
		this.notifyLoading(false);
	}

	@wire(MessageContext)
	messageContext;

	columns = [
		{ label: 'Name', fieldName: 'Name', editable: true },
		{ label: 'Length', fieldName: 'Length__c', type: 'number' },
		{ label: 'Price', fieldName: 'Price__c', type: 'currency' },
		{ label: 'Description', fieldName: 'Description__c' },
	];

	boats;
	selectedBoatId;
	boatTypeId = '';
	draftValues;

	async handleSave(event) {
		this.notifyLoading(true);
		const updatedFields = event.detail.draftValues;
		await updateBoatList({ data: updatedFields })
			.then(() => {
				this.dispatchEvent(
					new ShowToastEvent({
						title: SUCCESS_TITLE,
						message: MESSAGE_SHIP_IT,
						variant: SUCCESS_VARIANT,
					})
				);
				this.draftValues = [];
				return this.refresh();
			})
			.catch((error) => {
				this.dispatchEvent(
					new ShowToastEvent({
						title: ERROR_TITLE,
						message: error.message,
						variant: ERROR_VARIANT,
					})
				);
			})
			.finally(() => {
				this.notifyLoading(false);
			});
	}

	connectedCallback() {
		this.notifyLoading(true);
	}

	updateSelectedTile(event) {
		this.selectedBoatId = event.detail.boatId;
		this.sendMessageService(this.selectedBoatId);
	}

	sendMessageService(boatId) {
		publish(this.messageContext, BOATMC, { recordId: boatId });
	}

	notifyLoading(isLoading) {
		if (isLoading) {
			this.dispatchEvent(new CustomEvent(LOADING_EVENT));
		} else {
			this.dispatchEvent(new CustomEvent(DONE_LOADING_EVENT));
		}
	}

	showToast(variant, title, message) {
		this.dispatchEvent(
			new ShowToastEvent({
				variant: variant,
				title: title,
				message: message,
			})
		);
	}

	async refresh() {
		this.notifyLoading(true);
		await refreshApex(this.boats);
		this.notifyLoading(false);
	}
}
