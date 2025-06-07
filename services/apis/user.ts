import {AxiosClient} from '@/utils/axios';
import {UserData} from './auth';

const axiosClient = new AxiosClient();

export const getUserDetails = async () => {
	const response = await axiosClient.get<{status: string; user: UserData}>(
		'/account/user/detail/'
	);
	return response.data;
};
