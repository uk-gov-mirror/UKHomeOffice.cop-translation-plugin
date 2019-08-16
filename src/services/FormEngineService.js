import axios from "../utilities/axios";
import logger from "../config/winston";
import FormioUtils from 'formiojs/utils';
import TranslationServiceError from "../TranslationServiceError";
import appConfig from '../config/appConfig';

export default class FormEngineService {

    constructor(config) {
        this.config = config;
    }

    async getForm (formName, keycloakContext) {
        try {
            const response = await axios.get(`${this.config.services.form.url}/form?name=${formName}`, { headers: { Authorization: `Bearer ${keycloakContext.accessToken}` }});
            if (response && response.data) {
                const form = response.data.forms[0];
                if (form) {
                    logger.info(`Form  ${form.name} found`);
                    const subFormComponents = FormioUtils.findComponents(form.components, {
                        type: 'form'
                    });
                    if (subFormComponents && subFormComponents.length >= 1) {
                        logger.info(`Found sub form inside ${formName}...initiating a full form load...`);
                        const fullForm = await axios.get(`${appConfig.services.form.url}/form/${form.id}?full=true`);
                        return fullForm.data;
                    }
                    logger.info(`No sub forms detected for ${formName}`);
                    return form;
                } else {
                    return null;
                }
            } else {
                return null;
            }

        } catch (e) {
            const errorMessage = `An exception occurred while trying to get form ${formName} ... '${e}'`;
            logger.error(errorMessage, e);
            throw new TranslationServiceError(errorMessage, 500);
        }
    }
    validateStatus(status) {
        return status < 500;
    }

    async submitForm (formId, form, keycloakContext) {
        try {
            const response = await axios.post(`${this.config.services.form.url}/form/${formId}/submission`, form, { validateStatus: this.validateStatus, headers: { Authorization: `Bearer ${keycloakContext.accessToken}` }} );
            if (response && response.data) {
                return {
                  data: response.data,
                  status: response.status
                }
            }
            return null;
        } catch (e) {
            const errorMessage = `An exception occurred while trying to submit form ${formId} ... '${e}'`;
            logger.error(errorMessage, e);
            throw new TranslationServiceError(errorMessage, 500);
        }
    }
}
