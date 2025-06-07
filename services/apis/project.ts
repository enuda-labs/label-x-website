import {AxiosClient} from '@/utils/axios';

const axiosClient = new AxiosClient();

interface ProjectResponse {
	status: string;
	projects: Project[];
}

interface Project {
	id: string;
	name: string;
}

export const getProjects = async () => {
	const response = await axiosClient.get<ProjectResponse>(
		'/account/projects/list/'
	);
	return response.data;
};
