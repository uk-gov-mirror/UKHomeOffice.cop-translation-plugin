import axios from "../utilities/axios";
import logger from "../config/winston";
import TranslationServiceError from "../TranslationServiceError"


export default class ProcessService {

    constructor(config) {
        this.config = config;
    }

    async getApiCall(url, headers) {
        try {
            return await axios({
                url: `${url}`,
                method: 'GET',
                headers: headers
            });
        } catch (err) {
            logger.error(`Failed to get data from ${url} due to ${err}`);
            return null;
        }

    }

    async getTaskData(taskId, headers) {
        return this.getApiCall(`${this.config.services.workflow.url}/api/workflow/tasks/${taskId}`, headers);
    }

    async getTaskVariables(taskId, headers) {
        return this.getApiCall(`${this.config.services.workflow.url}/api/workflow/tasks/${taskId}/variables`, headers);
    }

    async getProcessVariables(processInstanceId, headers) {
        return await this.getApiCall(`${this.config.services.workflow.url}/api/workflow/process-instances/${processInstanceId}/variables`, headers);
    }

    validateStatus(status) {
        return status < 500;
    }

    async startProcessInstance(processData, headers) {
        const payload = processData.data;

        processData['businessKey'] = payload.businessKey;
        console.log(`Posting to: ${this.config.services.workflow.url}`);
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        try {
            const response = await axios({
                url: `${this.config.services.workflow.url}/api/workflow/process-instances`,
                validateStatus: this.validateStatus,
                method: 'POST',
                data: processData,
                headers: headers
            });
            logger.info(`Workflow response ${response.status}`);
            if (response && response.data) {
                return {
                    data: response.data,
                    status: response.status
                }
            }
            return null;
        } catch (e) {
            const errorMessage = `An exception occurred while trying to start process ${processData.processKey} ... '${e.message}'`;
            logger.error(errorMessage);
            logger.error(e.config);
            throw new TranslationServiceError(errorMessage, e.response ? e.response.status : 500);
        }
    }

    async startNonShiftProcessInstance(processData, processKey, headers) {
        try {
            const response = await axios.post(`${this.config.services.workflow.url}/rest/camunda/process-definition/key/${processKey}/start`,
                processData,
                {validateStatus: this.validateStatus, headers: headers});
            if (response && response.data) {
                return {
                    data: response.data,
                    status: response.status
                }
            }
            return null;
        } catch (e) {
            const errorMessage = `An exception occurred while trying to start process ${processData.processKey} ... '${e}'`;
            logger.error(errorMessage, e);
            throw new TranslationServiceError(errorMessage, 500);
        }
    }

    async startShift(shiftData, headers) {
        try {
            const response = await axios({
                url: `${this.config.services.workflow.url}/api/workflow/shift`,
                validateStatus: this.validateStatus,
                method: 'POST',
                data: shiftData,
                headers: headers
            });
            logger.log(`Shift response ${JSON.stringify(response)}`);
            if (response && response.data) {
                return {
                    data: response.data,
                    status: response.status
                }
            }
            return null;
        } catch (e) {
            const errorMessage = `An exception occurred while trying to start shift ... '${e.message}'`;
            logger.error(errorMessage);
            throw new TranslationServiceError(errorMessage, e.response ? e.response.status : 500);
        }
    }

    async completeTask(taskId, taskData, headers) {
        try {
            const response = await axios.post(`${this.config.services.workflow.url}/api/workflow/tasks/${taskId}/form/_complete`, taskData, {
                validateStatus: this.validateStatus,
                headers: headers
            });
            if (response) {
                return {
                    status: response.status
                }
            }
            return null;
        } catch (e) {
            const errorMessage = `An exception occurred while trying to complete task ${taskId} ... '${e}'`;
            logger.error(errorMessage, e);
            throw new TranslationServiceError(errorMessage, 500);
        }
    }
}
