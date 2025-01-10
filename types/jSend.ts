// https://github.com/omniti-labs/jsend
export default interface jSend {
	status: 'success' | 'fail' | 'error';
	message?: string ; // for error / 500 level only
	data: any; // for success and for fail / 400 level
};

export interface jSendParam {
	status?: 'success' | 'fail' | 'error';
	message?: string;
	data: any;
};
