import { AxiosClient } from '../../utils/axios/index' // adjust path
import { AxiosResponse } from 'axios'

export interface DataPointResponse {
  status: string;
  data: {
    id: number;
    used_data_points: number;
    data_points_balance: number;
    created_at: string;
    updated_at: string;
    user: number;
  };
  message: string | null;
  success: boolean;
}

// Instantiate your Axios client
const api = new AxiosClient()

// Expose function to fetch data points
export const fetchDataPoints = async (): Promise<number> => {
  const res: AxiosResponse<DataPointResponse> = await api.get('/account/datapoints/')
  return res.data.data.data_points_balance
}
