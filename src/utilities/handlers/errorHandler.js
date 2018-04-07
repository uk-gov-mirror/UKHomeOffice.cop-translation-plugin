const ERROR_CODE = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,

};

const DATA_NOT_FOUND = new Error('Data not found');
DATA_NOT_FOUND.code = ERROR_CODE.NOT_FOUND;

const INVALID_PARAMETER = new Error('Invalid parameter');
INVALID_PARAMETER.code = ERROR_CODE.BAD_REQUEST;

const INTERNAL_SERVER_ERROR = new Error('Internal server error');
INTERNAL_SERVER_ERROR.code = ERROR_CODE.INTERNAL_SERVER_ERROR;

const PERMISSION_DENIED = new Error('Permission denied');
PERMISSION_DENIED.code = ERROR_CODE.UNAUTHORIZED;

export default {
  DATA_NOT_FOUND,
  INVALID_PARAMETER,
  INTERNAL_SERVER_ERROR,
  PERMISSION_DENIED,
}
