import {AxiosError, AxiosInstance} from 'axios';

export interface AxiosClientProps {
	baseUrl?: string;
	axiosClient?: AxiosInstance;
	onAccessTokenExpire?: (error: AxiosError) => void;
}

export const PUBLIC_ROUTES = ['/auth'];
