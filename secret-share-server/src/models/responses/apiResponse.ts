export interface IApiResponse<TData> {
    success: boolean;
    data?: TData;
    error?: string;
}