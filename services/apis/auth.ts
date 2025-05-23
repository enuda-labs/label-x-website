import {AxiosClient} from '@/utils/axios';

const axiosClient = new AxiosClient();

export interface LoginBody {
	username: string;
	password: string;
}

export interface UserData {
	id: number;
	username: string;
	email: string;
	is_reviewer: boolean;
	is_admin: boolean;
}

export interface LoginResponse {
	refresh: string;
	access: string;
	user_data: UserData;
}
export const login = async (payload: LoginBody) => {
	const response = await axiosClient.post<LoginBody, LoginResponse>(
		'/account/login/',
		payload
	);
	return response.data;
};

export interface RegisterBody {
	username: string;
	email: string;
	password: string;
}

export interface RegisterResponse {
	status: 'success' | 'error';
	user_data: {
		id: number;
		username: string;
		email: string;
	};
}

export const register = async (payload: RegisterBody) => {
	const response = await axiosClient.post<RegisterBody, RegisterResponse>(
		'/account/register/',
		payload
	);
	return response.data;
};
